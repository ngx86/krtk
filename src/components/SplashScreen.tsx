import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user has a role
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role) {
          navigate('/', { replace: true });
        } else {
          navigate('/role-selection', { replace: true });
        }
      } else {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate, user]);

  return <LoadingSpinner />;
} 