import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface OnboardingContextType {
  setRole: (role: 'mentor' | 'mentee') => Promise<void>;
  isComplete: boolean;
  loading: boolean;
  error: string | null;
  checkOnboardingStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkOnboardingStatus = async (): Promise<void> => {
    if (!user?.id) {
      console.log('OnboardingContext: No user, onboarding incomplete');
      setIsComplete(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('OnboardingContext: Checking role for user', user.id);
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('OnboardingContext: Error checking role', error);
        // Log the error but don't expose technical details to the user
        setIsComplete(false);
        return;
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
      setError('Please sign in to continue.');
      throw new Error('User not authenticated');
    }
    
    console.log(`OnboardingContext: Setting role to ${role} for user ${user.id}`);
    setLoading(true);
    setError(null);
    
    try {
      // Create a minimal user object without the updated_at field
      const userData = {
        id: user.id,
        email: user.email || '',
        role,
        credits: role === 'mentee' ? 3 : 0,
        created_at: new Date().toISOString()
      };
      
      console.log('OnboardingContext: Upserting user with data', userData);
      
      // Upsert the user record
      const { error: upsertError } = await supabase
        .from('users')
        .upsert(userData);

      if (upsertError) {
        console.error('OnboardingContext: Error setting role', upsertError);
        
        // Log the actual error for debugging but show a user-friendly message
        setError('We encountered an issue setting your role. Please try again later or contact support.');
        
        // Still throw an error for the component to handle, but with a user-friendly message
        throw new Error('We encountered an issue setting your role. Please try again later.');
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
    error,
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