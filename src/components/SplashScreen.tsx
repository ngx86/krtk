import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from "./LoadingSpinner";

export function SplashScreen() {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();
  const [status, setStatus] = useState("Initializing...");
  const [delayComplete, setDelayComplete] = useState(false);

  // Ensure we don't redirect too quickly to avoid flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayComplete(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Log the current state for debugging
    console.log('SplashScreen state:', { 
      loading, 
      user: user?.id, 
      userRole, 
      delayComplete 
    });
    
    // Don't redirect until loading is complete and minimum delay has passed
    if (loading || !delayComplete) {
      setStatus(loading ? "Loading your account..." : "Preparing your experience...");
      return;
    }
    
    // Determine where to redirect based on auth state
    if (!user) {
      console.log('SplashScreen: No user found, redirecting to login');
      setStatus("Redirecting to login...");
      navigate('/login', { replace: true });
      return;
    }
    
    if (user && !userRole) {
      console.log('SplashScreen: User has no role, redirecting to role selection');
      setStatus("Redirecting to role selection...");
      navigate('/role-selection', { replace: true });
      return;
    }
    
    if (user && userRole) {
      console.log('SplashScreen: User has role, redirecting to dashboard');
      setStatus("Loading your dashboard...");
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [navigate, user, userRole, loading, delayComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          {/* You can add your logo here */}
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">MF</span>
          </div>
          <LoadingSpinner fullScreen={false} className="absolute -bottom-2 -right-2" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Micro-Mentorship</h1>
          <p className="text-muted-foreground">{status}</p>
        </div>
      </div>
    </div>
  );
} 