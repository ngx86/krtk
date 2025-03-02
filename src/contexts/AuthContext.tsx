import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import * as authService from '../lib/authService';

type UserRole = 'mentor' | 'mentee' | null;

// Define a type for user with role
interface UserWithRole extends User {
  userRole?: UserRole;
}

interface AuthContextType {
  session: Session | null;
  user: UserWithRole | null;
  loading: boolean;
  userRole: UserRole;
  isAuthenticated: boolean;
  lastAuthCheckTime: number;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserRole: (role: 'mentor' | 'mentee') => Promise<void>;
  refreshUserRole: () => Promise<void>;
  checkSessionActive: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Increase session timeout to be more resilient during navigation
// Session timeout for navigation within the app (20 minutes instead of 10)
const SESSION_NAVIGATION_TIMEOUT = 20 * 60 * 1000;

// Get the current hostname for domain checks
const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isMainDomain = currentHostname === 'rvzn.app' || currentHostname === 'www.rvzn.app';
const isLocalhost = currentHostname === 'localhost';

// Log the current domain context
if (typeof window !== 'undefined') {
  console.log('Auth context initialized on domain:', currentHostname, 
    isMainDomain ? '(main domain)' : 
    isLocalhost ? '(localhost)' : 
    '(other domain)');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [lastAuthCheckTime, setLastAuthCheckTime] = useState<number>(Date.now());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionChecks, setSessionChecks] = useState<number>(0); 
  
  // Function to check if session is active (for quick checks during navigation)
  const checkSessionActive = async (): Promise<boolean> => {
    // Get current path to add navigation-specific handling
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // Special handling for request-feedback route, which is prone to navigation issues
    const isRequestFeedback = currentPath.includes('/request-feedback');
    
    // If we're navigating to request-feedback, be extra lenient
    if (isRequestFeedback) {
      console.log('Navigation to request-feedback detected, applying lenient session validation');
      // Always trust localStorage token for this sensitive route
      const hasLocalStorageToken = typeof window !== 'undefined' && 
        !!localStorage.getItem('supabase.auth.token');
      
      if (hasLocalStorageToken) {
        console.log('Found token in localStorage during request-feedback navigation, assuming active session');
        return true;
      }
    }
    
    // If we're on the main domain, be more strict with session validation
    // For other domains (like Vercel previews), be more lenient
    const isVercelPreview = typeof window !== 'undefined' && 
      window.location.hostname.includes('vercel.app');
    
    // Count how many times we've checked the session
    setSessionChecks(prev => prev + 1);
    const checkCount = sessionChecks + 1;
    
    // IMPORTANT FIX: If we're checking repeatedly in a short time, trust cached state
    // This prevents logout during rapid navigation
    if (checkCount > 1 && Date.now() - lastAuthCheckTime < 2000) {
      console.log(`Rapid navigation detected (check #${checkCount}), using cached auth:`, isAuthenticated);
      // Always trust the cached state during rapid navigation to prevent logout flicker
      return isAuthenticated || !!localStorage.getItem('supabase.auth.token');
    }
    
    // Use different timeout durations based on domain
    const timeoutDuration = isMainDomain 
      ? SESSION_NAVIGATION_TIMEOUT 
      : (isVercelPreview ? SESSION_NAVIGATION_TIMEOUT * 2 : SESSION_NAVIGATION_TIMEOUT * 1.5);
    
    // If we've checked recently and have a valid session, use cached result
    if (isAuthenticated && Date.now() - lastAuthCheckTime < timeoutDuration) {
      console.log(`Using cached auth state (check #${checkCount}):`, isAuthenticated);
      return isAuthenticated;
    }
    
    try {
      // Update the last check time
      setLastAuthCheckTime(Date.now());
      
      // Check current session
      const { data } = await supabase.auth.getSession();
      const sessionActive = !!data.session?.user;
      
      console.log(`Session active check #${checkCount}:`, sessionActive, 
        'on host:', window.location.hostname,
        'main domain:', isMainDomain);
      
      // CRITICAL FIX: Set authentication state based on session presence - don't wait for role
      if (sessionActive) {
        setIsAuthenticated(true);
        
        // If we don't have a user yet, set it now
        if (!user && data.session?.user) {
          setUser(data.session.user);
          
          // Start role fetch in background, but don't block auth flow
          fetchUserRole(data.session.user.id).catch(err => 
            console.error('Background role fetch error:', err));
        }
        
        return true;
      }
      
      // If we're within the first 5 checks after login and session appears inactive,
      // but we previously thought it was active, do thorough validation
      if (!sessionActive && isAuthenticated && checkCount < 5) {
        console.log(`Session appears inactive but was active before (check #${checkCount}), doing thorough check`);
        
        try {
          // Check local storage for token
          const hasLocalStorageToken = !!localStorage.getItem('supabase.auth.token');
          console.log('  - Local storage token exists:', hasLocalStorageToken);
          
          // Check cookies
          const hasAuthCookie = document.cookie.split(';').some(c => 
            c.trim().startsWith('sb-') || c.trim().includes('supabase'));
          console.log('  - Auth cookies exist:', hasAuthCookie);
          
          // If we have either token source and we're on the main domain, trust it for now
          if ((hasLocalStorageToken || hasAuthCookie) && isMainDomain) {
            console.log('  - Token sources exist, maintaining auth state temporarily');
            return true;
          }
          
          // Do a second session check after delay
          const retryDelay = isMainDomain ? 1000 : 1500;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          // Retry the check
          const { data: retryData } = await supabase.auth.getSession();
          const retryResult = !!retryData.session?.user;
          
          console.log(`  - Retry session check result (check #${checkCount}):`, retryResult);
          
          if (retryResult) {
            setIsAuthenticated(true);
            return true;
          }
        } catch (retryError) {
          console.error('Error during thorough session check:', retryError);
        }
      }
      
      // For non-main domains, be more lenient with session validation
      if (!isMainDomain && isAuthenticated) {
        console.log('On non-main domain with previous authentication, maintaining state');
        return true;
      }
      
      // Update authentication state
      setIsAuthenticated(sessionActive);
      return sessionActive;
    } catch (error) {
      console.error('Error checking session status:', error);
      
      // If there's an error but we previously thought the session was active,
      // give the benefit of the doubt to prevent false logouts
      if (isAuthenticated) {
        console.log('Error during session check but was authenticated before, maintaining state');
        return isAuthenticated;
      }
      return false;
    }
  };

  // Helper function to fetch user role without blocking auth flow
  const fetchUserRole = async (userId: string): Promise<void> => {
    if (!userId) return;
    
    try {
      console.log('Background fetch of user role for:', userId);
      const role = await authService.getUserRole(userId);
      
      if (role) {
        console.log('Successfully fetched role in background:', role);
        setUserRoleState(role);
        setUser(prev => prev ? {...prev, userRole: role} : null);
      } else {
        console.warn('No role found for user in background fetch');
      }
    } catch (error) {
      console.error('Error in background role fetch:', error);
      // Continue without throwing - this is a background operation
    }
  };

  // Function to refresh user role
  const refreshUserRole = async (): Promise<void> => {
    if (!user?.id) {
      console.log('Cannot refresh role: No user ID');
      return;
    }
    
    try {
      console.log('Refreshing role for user:', user.id);
      
      // Add a small delay to ensure Supabase has time to process any recent changes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const role = await authService.getUserRole(user.id);
      console.log('Refreshed role:', role);
      
      setUserRoleState(role);
      setUser(prev => prev ? {...prev, userRole: role} : null);
    } catch (error) {
      console.error('Error refreshing user role:', error);
      // Continue without throwing since this is a non-critical operation
    }
  };

  // Function to refresh the current session
  const refreshSession = async (): Promise<void> => {
    try {
      console.log('AUTH DEBUG: refreshSession called');
      
      // First try to explicitly refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (!refreshError && refreshData.session) {
        console.log('AUTH DEBUG: Session refreshed successfully with refreshSession()');
        
        // Update authentication state
        setSession(refreshData.session);
        setUser(refreshData.session.user);
        setIsAuthenticated(true);
        setLastAuthCheckTime(Date.now());
        
        // Store session timestamp in localStorage for recovery
        try {
          localStorage.setItem('last_session_timestamp', Date.now().toString());
        } catch (err) {
          console.error('Error storing session timestamp:', err);
        }
        
        // Fetch role in background if needed
        if (!userRole) {
          fetchUserRoleInBackground(refreshData.session.user.id);
        }
        
        setLoading(false);
        return;
      }
      
      if (refreshError) {
        console.warn('AUTH DEBUG: Could not refresh session, falling back to getSession()', refreshError);
      }
      
      // Fall back to getting the current session
      const sessionResponse = await authService.getSession();
      
      if (sessionResponse.error) {
        console.error('AUTH DEBUG: Error getting session:', sessionResponse.error);
        
        // Try to recover from local storage if we have evidence of a recent session
        const lastSessionTimestamp = localStorage.getItem('last_session_timestamp');
        const hasLocalStorageToken = !!localStorage.getItem('supabase.auth.token');
        
        if (lastSessionTimestamp && hasLocalStorageToken) {
          const timeSinceLastSession = Date.now() - parseInt(lastSessionTimestamp, 10);
          
          // If we had a session recently (within 1 hour), consider the user still authenticated
          if (timeSinceLastSession < 60 * 60 * 1000) {
            console.log('AUTH DEBUG: Recent session detected, keeping authentication state');
            setIsAuthenticated(true);
            setLastAuthCheckTime(Date.now());
            setLoading(false);
            return;
          }
        }
        
        throw sessionResponse.error;
      }
      
      const session = sessionResponse.session;
      
      console.log('AUTH DEBUG: refreshSession results', { 
        hasSession: !!session,
        userId: session?.user.id, 
        expiresAt: session?.expires_at
      });
      
      // Update state
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setLastAuthCheckTime(Date.now());
      
      // Store session timestamp in localStorage for recovery if we have a session
      if (session) {
        try {
          localStorage.setItem('last_session_timestamp', Date.now().toString());
        } catch (err) {
          console.error('Error storing session timestamp:', err);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('AUTH DEBUG: Fatal error in refreshSession:', error);
      setLoading(false);
      throw error;
    }
  };
  
  // Helper function to fetch user role in background
  const fetchUserRoleInBackground = async (userId: string) => {
    try {
      const role = await authService.getUserRole(userId);
      
      // Update role state
      setUserRoleState(role);
      
      // Update user object with role
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          userRole: role
        };
      });
      
      console.log('User role fetched successfully:', role);
    } catch (error) {
      console.error('Error fetching user role in background:', error);
      // Continue without throwing to maintain authentication state
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log('Initializing auth provider');
    let mounted = true;
    
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, !!currentSession);
        
        if (!mounted) return;
        
        // Always update session state immediately
        setSession(currentSession);
        setLastAuthCheckTime(Date.now());
        
        if (currentSession?.user) {
          const currentUser = currentSession.user;
          console.log('User found in session:', currentUser.id);
          
          // Set authenticated immediately - don't wait for role
          setIsAuthenticated(true);
          setUser(currentUser);
          
          // Store session timestamp in localStorage for recovery
          try {
            localStorage.setItem('last_session_timestamp', Date.now().toString());
          } catch (err) {
            console.error('Error storing session timestamp:', err);
          }
          
          // Fetch role in background - won't block authentication
          fetchUserRoleInBackground(currentUser.id);
          
          // Set loading to false after basic auth is established
          setLoading(false);
        } else {
          if (!mounted) return;
          
          setUser(null);
          setUserRoleState(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    );

    // Get initial session and hydrate auth state
    const initializeSession = useCallback(async () => {
      if (!mounted) return;
      
      console.log('AUTH DEBUG: initializeSession called');
      setLoading(true);
      
      try {
        // Try to recover from hash if present
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log('AUTH DEBUG: Found hash params, handling auth callback');
          // Handle the URL params manually since getSessionFromUrl isn't available
          try {
            // This method handles the URL with the hash
            const { data, error } = await supabase.auth.getSession();
            if (error) {
              console.error('Error getting session after URL hash detected:', error);
            } else if (data?.session) {
              console.log('Successfully retrieved session after URL hash detection');
            }
          } catch (hashError) {
            console.error('Error handling hash params:', hashError);
          }
        }
        
        // Get the current session
        const sessionResponse = await authService.getSession();
        
        // Safe check for session expiry
        const expiresIn = sessionResponse.session && 
          sessionResponse.session.expires_at !== undefined ? 
          new Date(sessionResponse.session.expires_at * 1000) : 
          'none';
        
        console.log('AUTH DEBUG: initializeSession data', { 
          success: !sessionResponse.error, 
          hasSession: !!sessionResponse.session,
          expiresIn,
          localStorageToken: !!localStorage.getItem('supabase.auth.token'),
          cookies: document.cookie
        });
        
        if (sessionResponse.error) {
          console.error('AUTH DEBUG: Error initializing session:', sessionResponse.error);
          
          // Try session recovery if we have local evidence of a recent session
          const lastSessionTimestamp = localStorage.getItem('last_session_timestamp');
          const hasLocalStorageToken = !!localStorage.getItem('supabase.auth.token');
          
          if (lastSessionTimestamp && hasLocalStorageToken) {
            const timeSinceLastSession = Date.now() - parseInt(lastSessionTimestamp, 10);
            
            // If we had a session recently (within 4 hours), try refreshing
            if (timeSinceLastSession < 4 * 60 * 60 * 1000) {
              console.log('AUTH DEBUG: Recent session detected, attempting recovery');
              try {
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                
                if (!refreshError && refreshData.session) {
                  console.log('AUTH DEBUG: Successfully recovered session');
                  setSession(refreshData.session);
                  setUser(refreshData.session.user);
                  setIsAuthenticated(true);
                  
                  // Fetch role in background
                  fetchUserRoleInBackground(refreshData.session.user.id);
                  setLoading(false);
                  return;
                } else {
                  console.error('AUTH DEBUG: Session recovery failed:', refreshError);
                }
              } catch (refreshErr) {
                console.error('AUTH DEBUG: Exception during session recovery:', refreshErr);
              }
            }
          }
          
          setLoading(false);
          return;
        }
        
        // Update state with session data
        setSession(sessionResponse.session);
        setUser(sessionResponse.session?.user ?? null);
        setIsAuthenticated(!!sessionResponse.session);
        
        // If we have a session, try to get user role (with debugging)
        if (sessionResponse.session) {
          console.log('AUTH DEBUG: Getting user role');
          
          // Import from supabaseClient.ts
          const { isVercelPreview } = await import('../lib/supabaseClient');
          const timeoutDuration = isVercelPreview ? 30000 : 5000; // Longer timeout for Vercel preview
          
          const rolePromise = authService.getUserRole(sessionResponse.session.user.id);
          
          // Set a timeout to continue without role if it takes too long
          const timeoutPromise = new Promise<UserRole>((resolve) => {
            setTimeout(() => {
              console.log('AUTH DEBUG: Role fetch timed out!');
              resolve(null);
            }, timeoutDuration);
          });
          
          // Race between role fetch and timeout
          const role = await Promise.race([rolePromise, timeoutPromise]);
          
          console.log('AUTH DEBUG: User role fetched:', { role, userId: sessionResponse.session.user.id });
          setUserRoleState(role);
        } else {
          console.log('AUTH DEBUG: No session found, clearing role');
          setUserRoleState(null);
        }
      } catch (err) {
        console.error('AUTH DEBUG: Unexpected error in initializeSession:', err);
      } finally {
        setLoading(false);
      }
    }, []);
    
    // Always initialize session on mount
    initializeSession();

    return () => {
      console.log('AUTH DEBUG: Cleaning up auth state listener');
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Function to set user role
  const setUserRole = async (role: 'mentor' | 'mentee'): Promise<void> => {
    if (!user?.id) {
      throw new Error('Cannot set role: No user ID');
    }
    
    try {
      setLoading(true);
      
      await authService.storeUserRole(user.id, user.email, role);
      console.log('Role set successfully:', role);
      
      // Update local state
      setUserRoleState(role);
      setUser(prev => prev ? {...prev, userRole: role} : null);
    } catch (error) {
      console.error('Error setting user role:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      console.log('Attempting to sign up with email:', email);
      const { error } = await authService.signUp(email, password);
      
      if (error) throw error;
      
      console.log('Sign up successful, awaiting email verification');
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const signInWithEmailAndPassword = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      console.log('Attempting to sign in with email and password:', email);
      const { error } = await authService.signInWithPassword(email, password);
      
      if (error) throw error;
      
      console.log('Sign in with password successful');
      setLastAuthCheckTime(Date.now());
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error signing in with password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with magic link (OTP)
  const signInWithEmail = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      
      console.log('Attempting to sign in with magic link:', email);
      const { error } = await authService.signInWithOtp(email);
      
      if (error) throw error;
      
      console.log('Sign in with magic link email sent');
    } catch (error) {
      console.error('Error signing in with magic link:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      
      console.log('Attempting to sign out');
      const { error } = await authService.signOut();
      
      if (error) throw error;
      
      // Clear local state
      setSession(null);
      setUser(null);
      setUserRoleState(null);
      setIsAuthenticated(false);
      setLastAuthCheckTime(Date.now());
      
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        userRole,
        isAuthenticated,
        lastAuthCheckTime,
        signUpWithEmail,
        signInWithEmailAndPassword,
        signInWithEmail,
        signOut,
        setUserRole,
        refreshUserRole,
        checkSessionActive,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 