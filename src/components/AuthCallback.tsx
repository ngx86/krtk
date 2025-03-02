import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * AuthCallback component handles the redirect after a user signs in with Supabase Auth.
 * It processes the URL parameters, completes the authentication, and redirects to the appropriate page.
 */
const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing authentication callback');
        setLoading(true);
        
        // Check for hash parameters that might indicate an auth callback
        const hasHashParams = window.location.hash && 
          (window.location.hash.includes('access_token') || 
           window.location.hash.includes('error_description'));
           
        // Check for error in hash
        if (hasHashParams && window.location.hash.includes('error')) {
          const errorMessage = decodeURIComponent(
            window.location.hash.match(/error_description=([^&]*)/)?.[1] || 'Authentication error'
          );
          console.error('AuthCallback: Error in hash params:', errorMessage);
          setError(errorMessage);
          navigate('/login');
          return;
        }
        
        // Allow a bit of time for Supabase to process the hash
        if (hasHashParams) {
          console.log('AuthCallback: Hash params detected, allowing time for processing');
          await new Promise(resolve => setTimeout(resolve, 500));
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
          
          // Extra fallback recovery attempt
          try {
            console.log('AuthCallback: Attempting fallback session recovery');
            // Try to refresh the session as a last resort
            const { data: refreshData } = await supabase.auth.refreshSession();
            
            if (refreshData.session) {
              console.log('AuthCallback: Session successfully recovered via refresh');
              // Store session timestamp in localStorage for recovery
              try {
                localStorage.setItem('last_session_timestamp', Date.now().toString());
              } catch (err) {
                console.error('Error storing session timestamp:', err);
              }
              
              await refreshSession();
              navigate('/dashboard');
              return;
            }
          } catch (fallbackError) {
            console.error('AuthCallback: Fallback recovery failed:', fallbackError);
          }
          
          navigate('/login');
          return;
        }

        console.log('AuthCallback: Session found, refreshing auth context');
        
        // Store session timestamp in localStorage for recovery
        try {
          localStorage.setItem('last_session_timestamp', Date.now().toString());
        } catch (err) {
          console.error('Error storing session timestamp:', err);
        }
        
        await refreshSession();
        
        // Navigate to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('AuthCallback: Unexpected error:', err);
        setError('An unexpected error occurred during authentication');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    handleAuthCallback();
  }, [navigate, refreshSession]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <LoadingSpinner />
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
      <LoadingSpinner />
      <p className="mt-4 text-lg text-gray-600">Redirecting...</p>
    </div>
  );
};

export default AuthCallback;
