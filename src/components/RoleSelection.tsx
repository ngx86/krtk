import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Update role type to match what's expected in OnboardingContext
type UserRole = 'mentor' | 'mentee';

export function RoleSelection() {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading, setUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('RoleSelection: Component loaded', { 
      user: user?.id, 
      userRole, 
      authLoading 
    });
    
    // If user already has a role, redirect to dashboard
    if (!authLoading && userRole) {
      console.log('RoleSelection: User already has role, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [userRole, authLoading, navigate, user]);

  const handleRoleSelect = (role: UserRole) => {
    console.log('RoleSelection: Role selected', { role });
    setSelectedRole(role);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    if (!user) {
      setError('You must be logged in to select a role');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
      return;
    }

    try {
      console.log('RoleSelection: Submitting role', { 
        role: selectedRole, 
        userId: user.id 
      });
      setSubmitting(true);
      setError(null);
      
      await setUserRole(selectedRole);
      console.log('RoleSelection: Role set successfully');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('RoleSelection: Error setting role:', err);
      setError(err instanceof Error 
        ? err.message 
        : 'Failed to set role. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while checking auth or if we're submitting
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner fullScreen={false} />
        <p className="mt-4 text-muted-foreground">
          Checking your account...
        </p>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            You must be logged in to select a role. Redirecting to login...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Our Platform</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h2 className="font-semibold mb-2">Important Note:</h2>
          <p className="text-sm text-muted-foreground">
            Your role selection is permanent and cannot be changed later. Please choose the role that best describes your goals on the platform.
          </p>
        </div>
        
        <p className="text-center mb-6 text-muted-foreground">
          Please select your role to continue:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card 
            className={`cursor-pointer transition-all ${
              selectedRole === 'mentee' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleRoleSelect('mentee')}
          >
            <CardHeader className="relative">
              {selectedRole === 'mentee' && (
                <CheckCircle2 className="h-5 w-5 absolute top-3 right-3 text-primary" />
              )}
              <CardTitle>Feedback Seeker</CardTitle>
              <CardDescription>I need feedback on my work</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get valuable feedback on your designs from experienced mentors.
                <strong className="block mt-2">You'll receive 3 free credits to start.</strong>
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all ${
              selectedRole === 'mentor' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleRoleSelect('mentor')}
          >
            <CardHeader className="relative">
              {selectedRole === 'mentor' && (
                <CheckCircle2 className="h-5 w-5 absolute top-3 right-3 text-primary" />
              )}
              <CardTitle>Mentor</CardTitle>
              <CardDescription>I want to provide feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Share your expertise by providing feedback to designers.
                <strong className="block mt-2">You'll earn credits for each feedback.</strong>
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={!selectedRole || submitting}
        >
          {submitting ? (
            <>
              <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" /> 
              Setting up your account...
            </>
          ) : (
            `Continue as ${selectedRole === 'mentor' ? 'Mentor' : selectedRole === 'mentee' ? 'Feedback Seeker' : '...'}`
          )}
        </Button>
      </div>
    </div>
  );
} 