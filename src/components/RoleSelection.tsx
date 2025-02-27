import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../contexts/OnboardingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Users } from "lucide-react";
import { useState } from 'react';

export function RoleSelection() {
  const { setRole, loading: onboardingLoading } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = async (role: 'mentee' | 'mentor') => {
    try {
      setLoading(true);
      setError(null);
      console.log(`RoleSelection: Setting role to ${role}`);
      await setRole(role);
      console.log('RoleSelection: Role set successfully, navigating to dashboard');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error setting role:', error);
      setError('Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || onboardingLoading;

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">Choose Your Role</CardTitle>
          <CardDescription className="text-center text-lg">
            How would you like to use the platform?
          </CardDescription>
        </CardHeader>
        
        {error && (
          <div className="mx-6 mb-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}
        
        <CardContent className="grid gap-6 md:grid-cols-2 p-6">
          <Card 
            className={`cursor-pointer hover:bg-accent transition-colors ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
            onClick={() => !isLoading && handleRoleSelect('mentee')}
          >
            <CardContent className="flex flex-col items-center space-y-4 p-6">
              <UserCircle className="h-12 w-12 text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">I need feedback</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Get expert feedback on your designs from experienced mentors
                </p>
              </div>
              <Button disabled={isLoading} className="w-full">
                {isLoading ? 'Setting up...' : 'Select'}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:bg-accent transition-colors ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
            onClick={() => !isLoading && handleRoleSelect('mentor')}
          >
            <CardContent className="flex flex-col items-center space-y-4 p-6">
              <Users className="h-12 w-12 text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">I want to give feedback</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Share your expertise and help others improve their designs
                </p>
              </div>
              <Button disabled={isLoading} className="w-full">
                {isLoading ? 'Setting up...' : 'Select'}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
} 