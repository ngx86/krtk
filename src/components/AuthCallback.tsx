import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('AuthCallback: Starting...')
      console.log('URL:', window.location.href)
      
      // First handle the URL hash if present
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      
      console.log('Hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken })

      if (accessToken) {
        console.log('Setting session with tokens...')
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        })
      }

      // Then get the current session
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('Got session:', { session: !!session, error })
      
      if (error || !session) {
        console.error('Error during auth callback:', error)
        navigate('/login')
        return
      }

      try {
        // Get the role from user metadata
        const userRole = session.user.user_metadata.role
        console.log('User role:', userRole)
        
        if (!userRole) {
          throw new Error('No role specified')
        }

        // Update or create user profile in public.users table
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            role: userRole,
            credits: userRole === 'mentee' ? 3 : 0,
            created_at: new Date().toISOString(),
          })

        if (profileError) throw profileError

        // Clear the role from sessionStorage
        sessionStorage.removeItem('selectedRole')

        console.log('Successfully set up user, redirecting to home...')
        // Redirect to home - AppLayout will handle showing the correct dashboard
        navigate('/', { replace: true })
      } catch (err) {
        console.error('Error setting up user profile:', err)
        navigate('/login')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
} 