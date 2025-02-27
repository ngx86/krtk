import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, getRedirectUrl } from '../lib/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUserInDatabase: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('AuthContext: Initial session check', { 
          hasSession: !!session,
          userId: session?.user?.id
        });
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('AuthContext: Error getting initial session', error);
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
        setUser(session?.user ?? null);
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
    } catch (error) {
      console.error('AuthContext: Error in signOut', error);
      throw error;
    }
  };

  // Check if user exists in the database
  const checkUserInDatabase = async (userId: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Checking if user exists in database', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        // If the error is about the table not existing, return false
        if (error.message.includes('relation "users" does not exist')) {
          console.log('AuthContext: Users table does not exist');
          return false;
        }
        
        console.error('AuthContext: Error checking user in database', error);
        throw error;
      }
      
      const exists = !!data;
      console.log('AuthContext: User exists in database:', exists);
      return exists;
    } catch (error) {
      console.error('AuthContext: Error in checkUserInDatabase', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      signInWithEmail,
      signOut,
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