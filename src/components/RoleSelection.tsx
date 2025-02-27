import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

// Update role type to match what's expected in OnboardingContext
type UserRole = 'mentor' | 'mentee';

export function RoleSelection() {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading, setUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user already has a role, redirect to dashboard
  useEffect(() => {
    if (!authLoading && userRole) {
      navigate('/dashboard', { replace: true });
    }
  }, [userRole, authLoading, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await setUserRole(selectedRole);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error setting role:', err);
      setError(err instanceof Error ? err.message : 'Failed to set role. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while checking auth or if we're submitting
  if (authLoading || submitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner fullScreen={false} />
        <p className="mt-4 text-muted-foreground">
          {submitting ? 'Setting up your account...' : 'Loading...'}
        </p>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
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
            <CardHeader>
              <CardTitle>Feedback Seeker</CardTitle>
              <CardDescription>I need feedback on my work</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get valuable feedback on your designs from experienced mentors.
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all ${
              selectedRole === 'mentor' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleRoleSelect('mentor')}
          >
            <CardHeader>
              <CardTitle>Mentor</CardTitle>
              <CardDescription>I want to provide feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Share your expertise by providing feedback to designers.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={!selectedRole || submitting}
        >
          {submitting ? <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" /> : 'Continue'}
        </Button>
      </div>
    </div>
  );
} 