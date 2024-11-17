import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthChange = async () => {
      try {
        // Wait for auth session to be fully established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Check if user profile exists
          const { error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // User doesn't exist in public.users table
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  role: 'mentee',
                  credits: 5,
                  created_at: new Date().toISOString()
                }
              ])
              .select()
              .single()

            if (insertError) {
              console.error('Error creating user profile:', insertError)
              throw insertError
            }
          } else if (profileError) {
            throw profileError
          }

          // Successfully created/found user profile
          navigate('/', { replace: true })
        } else {
          navigate('/login', { replace: true })
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        navigate('/login', { replace: true })
      }
    }

    handleAuthChange()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
        <p className="text-gray-600">You'll be redirected in a moment.</p>
      </div>
    </div>
  )
} 