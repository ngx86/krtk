import { createContext, useContext, useState, useEffect } from 'react';
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
  const { user, userRole, loading: authLoading, setUserRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkOnboardingStatus = async (): Promise<void> => {
    if (!user?.id) {
      console.log('OnboardingContext: No user, onboarding incomplete');
      setIsComplete(false);
      return;
    }

    try {
      console.log('OnboardingContext: Checking role for user', user.id);
      
      // Use the userRole from AuthContext
      const hasRole = !!userRole;
      
      console.log('OnboardingContext: Role check result', { 
        hasRole,
        role: userRole,
        userId: user.id 
      });

      setIsComplete(hasRole);
    } catch (error) {
      console.error('OnboardingContext: Error checking onboarding:', error);
      setIsComplete(false);
    }
  };

  // Check if user has completed onboarding when user or userRole changes
  useEffect(() => {
    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [user, userRole, authLoading]);

  async function setRole(role: 'mentor' | 'mentee'): Promise<void> {
    if (!user?.id) {
      console.error('OnboardingContext: Cannot set role, no user ID');
      setError('Please sign in to continue.');
      throw new Error('User not authenticated');
    }
    
    console.log(`OnboardingContext: Setting role to ${role} for user ${user.id}`);
    setLoading(true);
    setError(null);
    
    // Set a timeout to prevent infinite loading state
    const timeoutId = setTimeout(() => {
      console.log('OnboardingContext: Role setting operation timed out');
      setLoading(false);
      setError('The operation timed out. Please try again.');
    }, 15000); // 15 second timeout
    
    try {
      // Use the setUserRole function from AuthContext
      await setUserRole(role);
      
      // Clear the timeout since the operation completed
      clearTimeout(timeoutId);
      
      console.log(`OnboardingContext: Successfully set role to ${role} for user ${user.id}`);
      setIsComplete(true);
    } catch (error) {
      // Clear the timeout since the operation completed with an error
      clearTimeout(timeoutId);
      
      console.error('OnboardingContext: Error setting role:', error);
      
      // Provide a user-friendly error message
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('We encountered an issue setting your role. Please try again later or contact support.');
      }
      
      // Still throw an error for the component to handle, but with a user-friendly message
      throw new Error('We encountered an issue setting your role. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const value = {
    setRole,
    isComplete,
    loading: loading || authLoading,
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