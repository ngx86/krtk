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
  const fetchUserRole = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data?.role || null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  // Function to refresh user role
  const refreshUserRole = async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      const role = await fetchUserRole(user.id);
      setUserRoleState(role as 'mentor' | 'mentee' | null);
      setUser(prev => prev ? {...prev, userRole: role as 'mentor' | 'mentee' | null} : null);
    } catch (error) {
      console.error('Error refreshing user role:', error);
    }
  };

  // Check if user exists in database and get their role
  const checkUserInDatabase = async (userId: string): Promise<{exists: boolean, role: string | null}> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      return { exists: !!data, role: data?.role || null };
    } catch (error) {
      console.error('Error checking user in database:', error);
      return { exists: false, role: null };
    }
  };

  // Initialize auth and fetch user role
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        setSession(session);
        
        if (session?.user) {
          const role = await fetchUserRole(session.user.id);
          setUserRoleState(role as 'mentor' | 'mentee' | null);
          
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
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        
        if (session?.user) {
          const role = await fetchUserRole(session.user.id);
          setUserRoleState(role as 'mentor' | 'mentee' | null);
          
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
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectUrl('/auth/callback')
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error sending magic link:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setUserRoleState(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Set user role in database
  const setUserRole = async (role: 'mentor' | 'mentee'): Promise<void> => {
    if (!user?.id) {
      throw new Error('Cannot set role: User not authenticated');
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          role,
          credits: role === 'mentee' ? 3 : 0, // Give mentees 3 initial credits
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
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