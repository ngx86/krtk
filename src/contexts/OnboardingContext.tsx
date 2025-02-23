import { createContext, useContext, useState } from 'react';
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

  async function setRole(role: 'mentor' | 'mentee') {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          role,
          credits: role === 'mentee' ? 3 : 0,
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    setRole,
    isComplete: !!user?.user_metadata?.role,
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