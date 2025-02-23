import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error during auth callback:', error)
        navigate('/login')
        return
      }

      if (!session) {
        navigate('/login')
        return
      }

      try {
        // Get the role from user metadata
        const role = session.user.user_metadata.role as 'mentor' | 'mentee'
        
        if (!role) {
          throw new Error('No role specified')
        }

        // Update or create user profile in public.users table
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            role: role,
            credits: role === 'mentee' ? 3 : 0, // Give new mentees some starter credits
            created_at: new Date().toISOString(),
          })

        if (profileError) throw profileError

        // Clear the role from sessionStorage as it's no longer needed
        sessionStorage.removeItem('selectedRole')

        // Redirect based on role
        navigate(`/${role}/dashboard`)
      } catch (err) {
        console.error('Error setting up user profile:', err)
        // Handle error appropriately
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