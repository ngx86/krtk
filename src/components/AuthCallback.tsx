import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { LoadingSpinner } from './LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'

export function AuthCallback() {
  const navigate = useNavigate()
  const { checkUserInDatabase } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Checking for authentication tokens...')
        
        // Handle both hash and query parameters for different auth methods
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)
        
        // Get tokens from either hash (OAuth) or query (magic link)
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token')
        
        console.log('Auth callback: Token check', { 
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          url: window.location.href
        });
        
        if (!accessToken) {
          // If no token in URL, check if we already have a session
          setStatus('No token found, checking for existing session...')
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            console.log('Auth callback: Found existing session', { 
              user: session.user.id 
            });
            
            // Check if user has a profile
            setStatus('Checking user profile...')
            const userExists = await checkUserInDatabase(session.user.id);
              
            if (userExists) {
              console.log('Auth callback: User exists in database, redirecting to dashboard');
              navigate('/dashboard', { replace: true });
            } else {
              console.log('Auth callback: User does not exist in database, redirecting to role selection');
              navigate('/role-selection', { replace: true });
            }
            return;
          }
          
          throw new Error('No access token found and no existing session');
        }

        // Set the session with the tokens from URL
        setStatus('Setting up your session...')
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        
        if (sessionError) {
          console.error('Auth callback: Session error', sessionError);
          throw sessionError;
        }

        // Get current session to verify
        setStatus('Verifying session...')
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          console.error('Auth callback: No session after setting tokens');
          throw new Error('No session after authentication');
        }
        
        console.log('Auth callback: Session verified', { 
          user: session.user.id 
        });

        // Check if user has a profile in the database
        setStatus('Checking your profile...')
        const userExists = await checkUserInDatabase(session.user.id);
          
        // Redirect based on user existence
        if (userExists) {
          console.log('Auth callback: User exists in database, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log('Auth callback: User does not exist in database, redirecting to role selection');
          navigate('/role-selection', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Wait a bit before redirecting on error
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate, checkUserInDatabase]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Authentication Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner />
      <p className="mt-4 text-muted-foreground">{status}</p>
    </div>
  );
} 