import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function AuthCallback() {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('1. AuthCallback: Starting...')
        setIsProcessing(true)
        
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          
          if (sessionError) throw sessionError;
          
          // Get session
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) throw new Error('No session after auth');

          // Check if user already has a role
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profile?.role) {
            // User already has a role, go to dashboard
            navigate('/', { replace: true });
          } else {
            // User needs to select a role
            navigate('/role-selection', { replace: true });
          }
        }
      } catch (err) {
        console.error('AuthCallback error:', err)
        navigate('/login')
      } finally {
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [navigate])

  if (isProcessing) {
    return <div>Processing authentication...</div>
  }

  return null
} 