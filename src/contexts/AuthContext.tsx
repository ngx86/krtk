import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
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
  checkUserInDatabase: (userId: string) => Promise<{exists: boolean, role: string | null}>;
  setUserRole: (role: 'mentor' | 'mentee') => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [userRole, setUserRoleState] = useState<'mentor' | 'mentee' | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user role from database
  const fetchUserRole = async (userId: string): Promise<string | null> => {
    try {
      console.log('AuthContext: Fetching user role for', userId);
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        if (error.message.includes('relation "users" does not exist')) {
          console.log('AuthContext: Users table does not exist');
          return null;
        }
        console.error('AuthContext: Error fetching user role', error);
        return null;
      }
      
      console.log('AuthContext: User role fetch result', data);
      return data?.role || null;
    } catch (error) {
      console.error('AuthContext: Error in fetchUserRole', error);
      return null;
    }
  };

  // Function to refresh user role
  const refreshUserRole = async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const role = await fetchUserRole(user.id);
      setUserRoleState(role as 'mentor' | 'mentee' | null);
      
      // Update the user object with the role
      setUser(prev => prev ? {...prev, userRole: role as 'mentor' | 'mentee' | null} : null);
    } catch (error) {
      console.error('AuthContext: Error refreshing user role', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth and fetch user role
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('AuthContext: Initial session check', { 
          hasSession: !!session,
          userId: session?.user?.id
        });
        
        setSession(session);
        
        if (session?.user) {
          // Fetch user role
          const role = await fetchUserRole(session.user.id);
          setUserRoleState(role as 'mentor' | 'mentee' | null);
          
          // Set user with role
          const userWithRole: UserWithRole = {
            ...session.user,
            userRole: role as 'mentor' | 'mentee' | null
          };
          setUser(userWithRole);
        } else {
          setUser(null);
          setUserRoleState(null);
        }
      } catch (error) {
        console.error('AuthContext: Error getting initial session', error);
        setUser(null);
        setUserRoleState(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('AuthContext: Auth state change', { 
          event, 
          hasSession: !!session,
          userId: session?.user?.id
        });
        
        setSession(session);
        
        if (session?.user) {
          // Fetch user role on auth change
          const role = await fetchUserRole(session.user.id);
          setUserRoleState(role as 'mentor' | 'mentee' | null);
          
          // Set user with role
          const userWithRole: UserWithRole = {
            ...session.user,
            userRole: role as 'mentor' | 'mentee' | null
          };
          setUser(userWithRole);
        } else {
          setUser(null);
          setUserRoleState(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string) => {
    console.log(`AuthContext: Sending magic link to ${email}`);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectUrl('/auth/callback')
        }
      });
      
      if (error) {
        console.error('AuthContext: Error sending magic link', error);
        throw error;
      }
      
      console.log('AuthContext: Magic link sent successfully');
    } catch (error) {
      console.error('AuthContext: Error in signInWithEmail', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('AuthContext: Signing out user', user?.id);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthContext: Error signing out', error);
        throw error;
      }
      
      console.log('AuthContext: User signed out successfully');
      // Clear local state
      setSession(null);
      setUser(null);
      setUserRoleState(null);
    } catch (error) {
      console.error('AuthContext: Error in signOut', error);
      throw error;
    }
  };

  // Check if user exists in the database and get their role
  const checkUserInDatabase = async (userId: string): Promise<{exists: boolean, role: string | null}> => {
    try {
      console.log('AuthContext: Checking if user exists in database', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        // If the error is about the table not existing, return false
        if (error.message.includes('relation "users" does not exist')) {
          console.log('AuthContext: Users table does not exist');
          return { exists: false, role: null };
        }
        
        console.error('AuthContext: Error checking user in database', error);
        throw error;
      }
      
      const exists = !!data;
      console.log('AuthContext: User exists in database:', exists, 'with role:', data?.role);
      return { exists, role: data?.role || null };
    } catch (error) {
      console.error('AuthContext: Error in checkUserInDatabase', error);
      return { exists: false, role: null };
    }
  };

  // Set user role in database
  const setUserRole = async (role: 'mentor' | 'mentee'): Promise<void> => {
    if (!user?.id) {
      throw new Error('Cannot set role: User not authenticated');
    }
    
    try {
      console.log(`AuthContext: Setting role to ${role} for user ${user.id}`);
      setLoading(true);
      
      // Create user data with role
      const userData = {
        id: user.id,
        email: user.email || '',
        role,
        credits: role === 'mentee' ? 3 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Upsert user data
      const { error } = await supabase
        .from('users')
        .upsert(userData);
      
      if (error) {
        console.error('AuthContext: Error setting role', error);
        throw error;
      }
      
      // Update local state
      setUserRoleState(role);
      setUser(prev => prev ? {...prev, userRole: role} : null);
      
      console.log(`AuthContext: Successfully set role to ${role} for user ${user.id}`);
    } catch (error) {
      console.error('AuthContext: Error in setUserRole', error);
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
      checkUserInDatabase,
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