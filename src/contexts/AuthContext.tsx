import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getRedirectUrl } from '../lib/supabaseClient';

// Define a type for user with role
interface UserWithRole extends User {
  userRole?: 'mentor' | 'mentee' | null;
}

interface AuthContextType {
  session: Session | null;
  user: UserWithRole | null;
  loading: boolean;
  userRole: 'mentor' | 'mentee' | null;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserRole: (role: 'mentor' | 'mentee') => Promise<void>;
  refreshUserRole: () => Promise<void>;
  checkUserInDatabase: (userId: string) => Promise<{exists: boolean, role: string | null}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [userRole, setUserRoleState] = useState<'mentor' | 'mentee' | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user role from database
  const fetchUserRole = async (userId: string): Promise<'mentor' | 'mentee' | null> => {
    try {
      console.log('Fetching user role for user:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error.message);
        return null;
      }
      
      console.log('User role data:', data);
      return data?.role || null;
    } catch (error) {
      console.error('Unexpected error fetching user role:', error);
      return null;
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
      const role = await fetchUserRole(user.id);
      console.log('Refreshed role:', role);
      
      setUserRoleState(role);
      setUser(prev => prev ? {...prev, userRole: role} : null);
    } catch (error) {
      console.error('Error refreshing user role:', error);
    }
  };

  // Check if user exists in database and get their role
  const checkUserInDatabase = async (userId: string): Promise<{exists: boolean, role: string | null}> => {
    try {
      console.log('Checking user in database:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found
          console.log('User not found in database');
          return { exists: false, role: null };
        }
        throw error;
      }
      
      console.log('User data from database:', data);
      return { exists: !!data, role: data?.role || null };
    } catch (error) {
      console.error('Error checking user in database:', error);
      return { exists: false, role: null };
    }
  };

  // Initialize auth and fetch user role
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization');
        setLoading(true);
        
        // Get session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        console.log('Session retrieved:', !!session);
        
        if (mounted) {
          setSession(session);
          
          if (session?.user) {
            console.log('User found in session:', session.user.id);
            
            // Get user role
            const role = await fetchUserRole(session.user.id);
            console.log('User role:', role);
            
            if (mounted) {
              setUserRoleState(role);
              setUser({
                ...session.user,
                userRole: role
              });
            }
          } else {
            console.log('No user in session');
            if (mounted) {
              setUser(null);
              setUserRoleState(null);
            }
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        if (mounted) {
          setSession(session);
          
          if (session?.user) {
            // Get user role on auth change
            const role = await fetchUserRole(session.user.id);
            console.log('User role after auth change:', role);
            
            if (mounted) {
              setUserRoleState(role);
              setUser({
                ...session.user,
                userRole: role
              });
            }
          } else {
            if (mounted) {
              setUser(null);
              setUserRoleState(null);
            }
          }
          
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string) => {
    try {
      console.log('Signing in with email:', email);
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectUrl('/auth/callback')
        }
      });
      
      if (error) throw error;
      
      console.log('Magic link sent successfully');
    } catch (error) {
      console.error('Error sending magic link:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
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
      
      // Check if user record exists
      const { exists } = await checkUserInDatabase(user.id);
      
      const userData = {
        id: user.id,
        email: user.email,
        role,
        credits: role === 'mentee' ? 3 : 0, // Give mentees 3 initial credits
        created_at: new Date().toISOString()
      };
      
      let error;
      
      if (exists) {
        console.log('User exists, updating role');
        const result = await supabase
          .from('users')
          .update({ role })
          .eq('id', user.id);
          
        error = result.error;
      } else {
        console.log('User does not exist, creating new record');
        const result = await supabase
          .from('users')
          .insert([userData]);
          
        error = result.error;
      }
      
      if (error) throw error;
      
      console.log('User role set successfully');
      
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

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      userRole,
      signInWithEmail,
      signOut,
      setUserRole,
      refreshUserRole,
      checkUserInDatabase
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