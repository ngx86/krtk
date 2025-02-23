import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../contexts/OnboardingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Users } from "lucide-react";

export function RoleSelection() {
  const { setRole, loading } = useOnboarding();
  const navigate = useNavigate();

  const handleRoleSelect = async (role: 'mentee' | 'mentor') => {
    try {
      await setRole(role);
      navigate('/');
    } catch (error) {
      console.error('Error setting role:', error);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">Choose Your Role</CardTitle>
          <CardDescription className="text-center text-lg">
            How would you like to use the platform?
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 p-6">
          <Card 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleRoleSelect('mentee')}
          >
            <CardContent className="flex flex-col items-center space-y-4 p-6">
              <UserCircle className="h-12 w-12 text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">I need feedback</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Get expert feedback on your designs from experienced mentors
                </p>
              </div>
              <Button disabled={loading} className="w-full">
                {loading ? 'Setting up...' : 'Select'}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleRoleSelect('mentor')}
          >
            <CardContent className="flex flex-col items-center space-y-4 p-6">
              <Users className="h-12 w-12 text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">I want to give feedback</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Share your expertise and help others improve their designs
                </p>
              </div>
              <Button disabled={loading} className="w-full">
                {loading ? 'Setting up...' : 'Select'}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
} 