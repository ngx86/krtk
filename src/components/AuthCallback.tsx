import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { LoadingSpinner } from './LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { AlertCircle } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()
  const { checkUserInDatabase, refreshUserRole } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Processing authentication...')
  const [isTimeout, setIsTimeout] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Collect debug info right away
    const collectDebugInfo = () => {
      try {
        const info = {
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
          localStorage: localStorage && Object.keys(localStorage).filter(key => key.includes('supabase')),
          cookies: document.cookie,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
        setDebugInfo(info)
        console.log('Auth callback debug info:', info)
      } catch (e) {
        console.error('Error collecting debug info:', e)
      }
    }
    
    collectDebugInfo()
    
    // Set a timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      setIsTimeout(true)
      console.error('Auth callback: Timeout reached while processing authentication')
    }, 15000) // 15 seconds timeout
    
    const handleCallback = async () => {
      try {
        setStatus('Checking for authentication tokens...')
        console.log('Auth callback: Starting authentication process', { url: window.location.href });
        
        // Extract hash fragment - handle both "#" and "#access_token" format
        const hashFragment = window.location.hash
        
        // Improved hash fragment handling
        let accessToken: string | null = null
        let refreshToken: string | null = null
        
        // Check for tokens in hash fragment (including edge cases)
        if (hashFragment) {
          console.log('Auth callback: Hash fragment found', { hashFragment });
          // Remove the # character
          const hashWithoutPrefix = hashFragment.startsWith('#') 
            ? hashFragment.substring(1) 
            : hashFragment
            
          // Try parsing as URL search params
          try {
            const hashParams = new URLSearchParams(hashWithoutPrefix)
            accessToken = hashParams.get('access_token')
            refreshToken = hashParams.get('refresh_token')
            
            // Log available keys in hash
            console.log('Auth callback: Hash params', { 
              params: Array.from(hashParams.entries()),
              accessToken: !!accessToken,
              refreshToken: !!refreshToken
            });
          } catch (e) {
            console.error('Auth callback: Error parsing hash params', e);
          }
          
          // If we can't parse as URLSearchParams, try direct extraction with regex
          if (!accessToken) {
            try {
              // Try to extract access token with regex
              const accessTokenMatch = hashWithoutPrefix.match(/access_token=([^&]*)/);
              if (accessTokenMatch && accessTokenMatch[1]) {
                accessToken = decodeURIComponent(accessTokenMatch[1]);
              }
              
              // Try to extract refresh token with regex
              const refreshTokenMatch = hashWithoutPrefix.match(/refresh_token=([^&]*)/);
              if (refreshTokenMatch && refreshTokenMatch[1]) {
                refreshToken = decodeURIComponent(refreshTokenMatch[1]);
              }
              
              console.log('Auth callback: Regex extraction', {
                accessToken: !!accessToken,
                refreshToken: !!refreshToken
              });
            } catch (e) {
              console.error('Auth callback: Error with regex extraction', e);
            }
          }
        }
        
        // Check query params if hash params don't have tokens
        if (!accessToken) {
          const queryParams = new URLSearchParams(window.location.search)
          accessToken = queryParams.get('access_token')
          refreshToken = queryParams.get('refresh_token')
          
          console.log('Auth callback: Query params check', { 
            params: Array.from(queryParams.entries()),
            accessToken: !!accessToken,
            refreshToken: !!refreshToken
          });
        }
        
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
            
            // Cancel timeout since we found a session
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
            }
            
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
          throw new Error('No authentication tokens found and no existing session');
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

        // Clear timeout as we're making progress
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Get current session to verify
        setStatus('Verifying session...')
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession()
        
        if (getSessionError) {
          console.error('Auth callback: Error getting session after auth', getSessionError);
          throw getSessionError;
        }
        
        if (!session) {
          console.error('Auth callback: No session after setting tokens');
          throw new Error('No session established after authentication');
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
        // Clear timeout since we've handled the error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Wait a bit before redirecting on error
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate, checkUserInDatabase, refreshUserRole]);

  const handleRetry = () => {
    window.location.href = '/login';
  };

  const handleManualSignIn = () => {
    navigate('/login', { replace: true });
  };
  
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  if (isTimeout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">Authentication Taking Too Long</h2>
          <p className="mb-6 text-muted-foreground">
            The authentication process is taking longer than expected. This might be due to:
          </p>
          <ul className="text-left mb-6 text-sm text-muted-foreground space-y-2">
            <li>• Cookies or local storage being blocked in your browser</li>
            <li>• Network connectivity issues</li>
            <li>• An issue with the authentication service</li>
          </ul>
          <div className="flex flex-col space-y-3">
            <Button onClick={handleRetry}>
              Try Again
            </Button>
            <Button variant="outline" onClick={handleManualSignIn}>
              Return to Login Page
            </Button>
            <Button variant="ghost" onClick={toggleDebugMode} className="mt-4">
              {debugMode ? "Hide Debug Info" : "Show Debug Info"}
            </Button>
            
            {debugMode && (
              <div className="mt-4 text-left bg-muted p-3 rounded-md">
                <h3 className="font-semibold mb-2">Debug Information</h3>
                <div className="text-xs overflow-auto max-h-60">
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-destructive mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex flex-col space-y-3">
            <Button onClick={handleManualSignIn}>
              Return to Login Page
            </Button>
            <Button variant="ghost" onClick={toggleDebugMode} className="mt-2">
              {debugMode ? "Hide Debug Info" : "Show Debug Info"}
            </Button>
            
            {debugMode && (
              <div className="mt-4 text-left bg-muted p-3 rounded-md">
                <h3 className="font-semibold mb-2">Debug Information</h3>
                <div className="text-xs overflow-auto max-h-60">
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <LoadingSpinner fullScreen={false} className="h-10 w-10" />
      <p className="mt-4 text-muted-foreground">{status}</p>
      <p className="mt-2 text-sm text-muted-foreground">This may take a few moments...</p>
      
      <button 
        onClick={toggleDebugMode}
        className="mt-8 flex items-center text-xs text-muted-foreground hover:text-foreground"
      >
        <AlertCircle className="h-3 w-3 mr-1" />
        {debugMode ? "Hide Debug Info" : "Debug"}
      </button>
      
      {debugMode && (
        <div className="mt-4 text-left bg-muted p-3 rounded-md w-full max-w-md">
          <h3 className="font-semibold mb-2 text-sm">Debug Information</h3>
          <div className="text-xs overflow-auto max-h-60">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 