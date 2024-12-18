import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabaseClient'

export function Login() {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Micro-Mentorship</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        redirectTo={`${window.location.origin}/auth/callback`}
        magicLink={false}
        showLinks={true}
        view="sign_in"
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email',
              password_label: 'Password',
            }
          }
        }}
      />
    </div>
  )
} 