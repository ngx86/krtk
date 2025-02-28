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
  signInWithEmail: (email: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserRole: (role: 'mentor' | 'mentee') => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

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
        
        if (currentSession?.user) {
          const currentUser = currentSession.user;
          console.log('User found in session:', currentUser.id);
          
          try {
            // Short delay to ensure Supabase has processed any changes
            await new Promise(resolve => setTimeout(resolve, 500));
            
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
          }
        } else {
          if (!mounted) return;
          
          setUser(null);
          setUserRoleState(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    authService.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      
      setSession(initialSession);
      
      if (initialSession?.user) {
        const initialUser = initialSession.user;
        console.log('Initial user found:', initialUser.id);
        
        authService.getUserRole(initialUser.id).then(role => {
          if (!mounted) return;
          
          console.log('Initial user role:', role);
          setUserRoleState(role);
          setUser({
            ...initialUser,
            userRole: role
          });
        }).catch(error => {
          console.error('Error getting initial user role:', error);
          
          if (!mounted) return;
          
          // Set user even if we can't get role
          setUser(initialUser);
        }).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        if (mounted) {
          setLoading(false);
        }
      }
    }).catch(error => {
      console.error('Error getting initial session:', error);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Email OTP (magic link) authentication
  const signInWithEmail = async (email: string) => {
    try {
      console.log('Signing in with magic link:', email);
      setLoading(true);
      
      const { error } = await authService.signInWithOtp(email);
      
      if (error) throw error;
      
      console.log('Magic link sent successfully');
    } catch (error) {
      console.error('Error sending magic link:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      console.log('Signing up with email and password:', email);
      setLoading(true);
      
      const { error } = await authService.signUp(email, password);
      
      if (error) throw error;
      
      console.log('Sign up successful');
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
      console.log('Signing in with email and password:', email);
      setLoading(true);
      
      const { error } = await authService.signInWithPassword(email, password);
      
      if (error) throw error;
      
      console.log('Sign in successful');
    } catch (error) {
      console.error('Error signing in with password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log('Signing out user');
      setLoading(true);
      
      const { error } = await authService.signOut();
      if (error) throw error;
      
      console.log('Sign out successful');
      setSession(null);
      setUser(null);
      setUserRoleState(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Set user role in database
  const setUserRole = async (role: 'mentor' | 'mentee'): Promise<void> => {
    if (!user?.id) {
      console.error('Cannot set role: No authenticated user');
      throw new Error('Cannot set role: User not authenticated');
    }
    
    try {
      console.log('Setting user role:', role, 'for user:', user.id);
      setLoading(true);
      
      // Set local state immediately for better UX
      setUserRoleState(role);
      setUser(prev => prev ? {...prev, userRole: role} : null);
      
      // Then update in the database
      await authService.storeUserRole(user.id, user.email, role);
      
      console.log('User role set successfully');
      
      // Add delay before refreshing to ensure the update has propagated
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUserRole();
      
    } catch (error) {
      console.error('Error setting user role:', error);
      
      // If database update failed, we should still have a working app with the local state
      // Don't revert the local state as this would create a confusing UX
      // The next page refresh will attempt to sync with the database again
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      userRole,
      signInWithEmail,
      signUpWithEmail,
      signInWithEmailAndPassword,
      signOut,
      setUserRole,
      refreshUserRole
    }}>
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