import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Create user profile in database if it doesn't exist
        createUserProfile(session.user.id)
        // Redirect to dashboard
        navigate('/')
      }
    })
  }, [navigate])

  async function createUserProfile(userId: string) {
    // Check if user profile exists
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single()

    if (!existingUser) {
      // Create new user profile
      const { error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            role: 'mentee', // Default role
            credits: 5, // Starting credits
            created_at: new Date().toISOString()
          }
        ])

      if (error) console.error('Error creating user profile:', error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
        <p className="text-gray-600">You'll be redirected in a moment.</p>
      </div>
    </div>
  )
} 