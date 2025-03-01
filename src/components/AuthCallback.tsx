import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * AuthCallback component handles the authentication callback process
 * This component is rendered when the user is redirected back from Supabase auth
 */
const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing authentication callback');
        setLoading(true);

        // Check if we already have a session
        if (user) {
          console.log('AuthCallback: User already authenticated, redirecting to dashboard');
          navigate('/dashboard');
          return;
        }

        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthCallback: Error getting session:', error);
          setError(error.message);
          navigate('/login');
          return;
        }

        if (!data.session) {
          console.log('AuthCallback: No session found, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('AuthCallback: Session found, refreshing auth context');
        await refreshSession();

        // Check if the user has a role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        if (userData?.role) {
          console.log('AuthCallback: User has role, redirecting to dashboard');
          navigate('/dashboard');
        } else {
          console.log('AuthCallback: User needs to select role, redirecting');
          navigate('/role-selection');
        }
      } catch (err) {
        console.error('AuthCallback: Unexpected error:', err);
        setError('An unexpected error occurred during authentication');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, refreshSession, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <LoadingSpinner fullScreen={false} />
        <p className="mt-4 text-lg text-gray-600">Completing authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          <p>Authentication error: {error}</p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <LoadingSpinner fullScreen={false} />
      <p className="mt-4 text-lg text-gray-600">Redirecting...</p>
    </div>
  );
};

export default AuthCallback; 