import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('SplashScreen: Checking auth...')
      const { data: { session } } = await supabase.auth.getSession();
      console.log('SplashScreen: Session:', { hasSession: !!session })

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('SplashScreen: Profile check:', { 
          hasProfile: !!profile,
          userId: session.user.id,
          profileId: profile?.id
        })

        if (profile) {
          console.log('SplashScreen: Redirecting to dashboard...')
          navigate('/', { replace: true });
        } else {
          console.log('SplashScreen: No profile found')
        }
      }
    };
    
    checkAuth();
  }, [navigate, user]);

  const handleRoleSelect = (role: 'mentee' | 'mentor') => {
    // Store the selected role in sessionStorage
    sessionStorage.setItem('selectedRole', role);
    navigate('/login');
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">Welcome to Krtk</CardTitle>
          <CardDescription className="text-center text-lg">
            Choose how you'd like to use the platform
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
              <Button className="w-full">Select</Button>
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
              <Button className="w-full">Select</Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
} 