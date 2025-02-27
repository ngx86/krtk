import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, getRedirectUrl } from '../lib/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext: Initial session check', { 
        hasSession: !!session,
        userId: session?.user?.id
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

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

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      signInWithEmail,
      signOut
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