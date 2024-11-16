import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabaseClient'
import { useState } from 'react'

export function Login() {
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Micro-Mentorship</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['github', 'google']}
        redirectTo={`${window.location.origin}/dashboard`}
        magicLink
        onAuthError={(error) => {
          console.error('Auth error:', error)
          setError(error.message)
        }}
      />
    </div>
  )
} 