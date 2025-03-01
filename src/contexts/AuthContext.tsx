import { createContext, useContext, useEffect, useState } from 'react';
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
    // If we're on the main domain, be more strict with session validation
    // For other domains (like Vercel previews), be more lenient
    const isVercelPreview = typeof window !== 'undefined' && 
      window.location.hostname.includes('vercel.app');
    
    // Count how many times we've checked the session
    setSessionChecks(prev => prev + 1);
    const checkCount = sessionChecks + 1;
    
    // Use different timeout durations based on domain
    const timeoutDuration = isMainDomain 
      ? SESSION_NAVIGATION_TIMEOUT // Standard timeout for main domain
      : (isVercelPreview ? SESSION_NAVIGATION_TIMEOUT * 2 : SESSION_NAVIGATION_TIMEOUT * 1.5); // Adjust timeout based on domain
    
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
      console.log('Refreshing session');
      
      // Get current session
      const { session: currentSession, error } = await authService.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      if (!currentSession) {
        console.log('No session found during refresh');
        setUser(null);
        setUserRoleState(null);
        setIsAuthenticated(false);
        return;
      }
      
      // Update the session state
      setSession(currentSession);
      setLastAuthCheckTime(Date.now());
      setIsAuthenticated(true);
      
      // Get user data and role
      try {
        const currentUser = currentSession.user;
        
        // Get user role
        const role = await authService.getUserRole(currentUser.id);
        
        setUserRoleState(role);
        setUser({
          ...currentUser,
          userRole: role
        });
        
        console.log('Session refreshed successfully');
      } catch (error) {
        console.error('Error getting user data during refresh:', error);
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
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
        
        setSession(currentSession);
        setLastAuthCheckTime(Date.now());
        
        if (currentSession?.user) {
          const currentUser = currentSession.user;
          console.log('User found in session:', currentUser.id);
          
          setIsAuthenticated(true);
          
          try {
            // Short delay to ensure Supabase has processed any changes
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Get user role
            const role = await authService.getUserRole(currentUser.id);
            console.log('User role after auth change:', role);
            
            if (!mounted) return;
            
            setUserRoleState(role);
            setUser({
              ...currentUser,
              userRole: role
            });
          } catch (error) {
            console.error('Error fetching user role:', error);
            
            if (!mounted) return;
            
            // Still set the user even if we can't get the role
            setUser(currentUser);
          } finally {
            if (mounted) setLoading(false);
          }
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
    const initializeSession = async () => {
      try {
        // Attempt to get session from localstorage first
        const storedSession = localStorage.getItem('supabase.auth.token');
        if (storedSession) {
          console.log('Found stored session data');
        }
        
        // Get the actual session from Supabase
        const { session: initialSession, error } = await authService.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (!mounted) return;
        
        setSession(initialSession);
        setLastAuthCheckTime(Date.now());
        
        if (initialSession?.user) {
          const initialUser = initialSession.user;
          console.log('Initial user found:', initialUser.id);
          
          setIsAuthenticated(true);
          
          try {
            // Get user role
            const role = await authService.getUserRole(initialUser.id);
            console.log('Initial user role:', role);
            
            if (!mounted) return;
            
            setUserRoleState(role);
            setUser({
              ...initialUser,
              userRole: role
            });
          } catch (error) {
            console.error('Error fetching initial user role:', error);
            
            if (!mounted) return;
            
            // Still set the user even if we can't get the role
            setUser(initialUser);
          }
        } else {
          console.log('No initial session found');
          
          if (!mounted) return;
          
          setUser(null);
          setUserRoleState(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        
        if (!mounted) return;
        
        setUser(null);
        setUserRoleState(null);
        setIsAuthenticated(false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    // Initialize session
    initializeSession();

    return () => {
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