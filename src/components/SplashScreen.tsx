import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function SplashScreen() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authLoading) return;

        const { data: { session } } = await supabase.auth.getSession();
        console.log('SplashScreen: Session check', { hasSession: !!session });
        
        if (session?.user) {
          // Check if user has a role
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          console.log('SplashScreen: Profile check', { hasProfile: !!profile, role: profile?.role });

          if (profile?.role) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/role-selection', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('SplashScreen: Error', error);
        navigate('/login', { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate, user, authLoading]);

  return <LoadingSpinner />;
} 