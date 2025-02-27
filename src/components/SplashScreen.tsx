import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from "./LoadingSpinner";

export function SplashScreen() {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading, refreshUserRole } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authLoading) return;

        console.log('SplashScreen: Auth check', { 
          hasUser: !!user,
          userRole,
          authLoading
        });

        // Refresh user role to ensure it's up to date
        await refreshUserRole();
        
        if (user) {
          if (userRole) {
            console.log('SplashScreen: User has role, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('SplashScreen: User has no role, redirecting to role selection');
            navigate('/role-selection', { replace: true });
          }
        } else {
          console.log('SplashScreen: No user, redirecting to login');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('SplashScreen: Error', error);
        navigate('/login', { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate, user, userRole, authLoading, refreshUserRole]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner fullScreen={false} />
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
} 