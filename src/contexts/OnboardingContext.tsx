import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface OnboardingContextType {
  setRole: (role: 'mentor' | 'mentee') => Promise<void>;
  isComplete: boolean;
  loading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    async function checkOnboarding() {
      if (!user?.id) {
        setIsComplete(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        console.log('OnboardingContext: Role check', { 
          hasRole: !!data?.role,
          error,
          userId: user.id 
        });

        setIsComplete(!!data?.role);
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setIsComplete(false);
      }
    }

    checkOnboarding();
  }, [user]);

  async function setRole(role: 'mentor' | 'mentee') {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          role,
          credits: role === 'mentee' ? 3 : 0,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      setIsComplete(true);
    } catch (error) {
      console.error('Error setting role:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    setRole,
    isComplete,
    loading
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
} 