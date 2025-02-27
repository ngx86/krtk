import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { LoadingSpinner } from './LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'

export function AuthCallback() {
  const navigate = useNavigate()
  const { checkUserInDatabase, refreshUserRole } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Checking for authentication tokens...')
        console.log('Auth callback: Starting authentication process', { url: window.location.href });
        
        // Handle both hash and query parameters for different auth methods
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)
        
        // Get tokens from either hash (OAuth) or query (magic link)
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token')
        
        console.log('Auth callback: Token check', { 
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hashKeys: Array.from(hashParams.keys()),
          queryKeys: Array.from(queryParams.keys())
        });
        
        if (!accessToken) {
          // If no token in URL, check if we already have a session
          setStatus('No token found, checking for existing session...')
          const { data, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Auth callback: Error getting session', sessionError);
            throw sessionError;
          }
          
          const session = data.session;
          
          if (session) {
            console.log('Auth callback: Found existing session', { 
              user: session.user.id,
              expires: session.expires_at
            });
            
            // Check if user has a profile
            setStatus('Checking user profile...')
            const { exists, role } = await checkUserInDatabase(session.user.id);
            console.log('Auth callback: User database check', { exists, role });
            
            // Refresh user role in context
            await refreshUserRole();
              
            if (exists && role) {
              console.log('Auth callback: User exists with role, redirecting to dashboard');
              navigate('/dashboard', { replace: true });
            } else {
              console.log('Auth callback: User needs role selection, redirecting');
              navigate('/role-selection', { replace: true });
            }
            return;
          }
          
          console.error('Auth callback: No access token and no session');
          throw new Error('No access token found and no existing session');
        }

        // Set the session with the tokens from URL
        setStatus('Setting up your session...')
        console.log('Auth callback: Setting session with tokens');
        
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        
        if (sessionError) {
          console.error('Auth callback: Session error', sessionError);
          throw sessionError;
        }
        
        console.log('Auth callback: Session set successfully', {
          hasSession: !!sessionData.session
        });

        // Get current session to verify
        setStatus('Verifying session...')
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession()
        
        if (getSessionError) {
          console.error('Auth callback: Error getting session after auth', getSessionError);
          throw getSessionError;
        }
        
        if (!session) {
          console.error('Auth callback: No session after setting tokens');
          throw new Error('No session after authentication');
        }
        
        console.log('Auth callback: Session verified', { 
          user: session.user.id,
          email: session.user.email,
          expires: session.expires_at
        });

        // Check if user has a profile in the database
        setStatus('Checking your profile...')
        const { exists, role } = await checkUserInDatabase(session.user.id);
        console.log('Auth callback: User database check', { exists, role });
        
        // Refresh user role in context
        await refreshUserRole();
          
        // Redirect based on user existence and role
        if (exists && role) {
          console.log('Auth callback: User exists with role, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log('Auth callback: User needs role selection, redirecting');
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
  }, [navigate, checkUserInDatabase, refreshUserRole]);

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