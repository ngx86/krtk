import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from 'react'

const SITE_URL = 'https://krtk-git-feat-mentor-availability-hi-n-gstudios-projects.vercel.app'

export function Login() {
  useEffect(() => {
    // Add auth state change listener for debugging
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event)
      console.log('Session:', session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={`${SITE_URL}/auth/callback`}
            magicLink={false}
            showLinks={true}
            view="sign_in"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign in',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Create a password',
                  button_label: 'Create account',
                },
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
} 