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
        
        console.log('2. Got tokens:', { hasAccessToken: !!accessToken })

        if (accessToken) {
          console.log('3. Setting session...')
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('4. Session check:', { hasSession: !!session, error })
        
        if (error || !session) {
          throw new Error('No session after auth')
        }

        const userRole = session.user.user_metadata.role
        console.log('5. User role from metadata:', userRole)

        // Update or create user profile
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            role: userRole,
            credits: userRole === 'mentee' ? 3 : 0,
            created_at: new Date().toISOString(),
          })
        
        console.log('6. Profile upsert:', { error: profileError })

        if (profileError) throw profileError

        // Verify profile was created
        const { data: profile, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        console.log('7. Profile verification:', { hasProfile: !!profile, error: fetchError })

        if (!profile) throw new Error('Profile not found after creation')

        sessionStorage.removeItem('selectedRole')
        
        // Add longer delay and more explicit logging
        console.log('8. Waiting to ensure DB consistency...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        console.log('9. Redirecting to dashboard...')
        navigate('/', { replace: true })
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  return null
} 