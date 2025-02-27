import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface OnboardingContextType {
  setRole: (role: 'mentor' | 'mentee') => Promise<void>;
  isComplete: boolean;
  loading: boolean;
  checkOnboardingStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const checkOnboardingStatus = async (): Promise<void> => {
    if (!user?.id) {
      console.log('OnboardingContext: No user, onboarding incomplete');
      setIsComplete(false);
      return;
    }

    setLoading(true);
    try {
      console.log('OnboardingContext: Checking role for user', user.id);
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('OnboardingContext: Error checking role', error);
        throw error;
      }

      const hasRole = !!data?.role;
      console.log('OnboardingContext: Role check result', { 
        hasRole,
        role: data?.role,
        userId: user.id 
      });

      setIsComplete(hasRole);
    } catch (error) {
      console.error('OnboardingContext: Error checking onboarding:', error);
      setIsComplete(false);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has completed onboarding when user changes
  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  async function setRole(role: 'mentor' | 'mentee'): Promise<void> {
    if (!user?.id) {
      console.error('OnboardingContext: Cannot set role, no user ID');
      throw new Error('User not authenticated');
    }
    
    console.log(`OnboardingContext: Setting role to ${role} for user ${user.id}`);
    setLoading(true);
    
    try {
      // First check if user already exists in the database
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      console.log('OnboardingContext: User exists check', { 
        exists: !!existingUser,
        userId: user.id 
      });
      
      // Upsert the user record
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          role,
          credits: role === 'mentee' ? 3 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('OnboardingContext: Error setting role', error);
        throw error;
      }
      
      console.log(`OnboardingContext: Successfully set role to ${role} for user ${user.id}`);
      setIsComplete(true);
    } catch (error) {
      console.error('OnboardingContext: Error setting role:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    setRole,
    isComplete,
    loading,
    checkOnboardingStatus
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