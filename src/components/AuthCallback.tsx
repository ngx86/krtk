import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          // Check if user profile exists
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!profile) {
            // Create new user profile
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

            if (insertError) throw insertError
          }

          // Redirect to dashboard
          navigate('/')
        } catch (error) {
          console.error('Error in auth callback:', error)
          // Handle error appropriately
        }
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
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