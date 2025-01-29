import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthChange = async () => {
      try {
        console.log('Starting auth callback...')
        
        // Get the URL hash if present
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken) {
          console.log('Found access token in URL, setting session...')
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          
          if (setSessionError) throw setSessionError
        }
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw sessionError
        }

        console.log('Session:', session)
        
        if (session?.user) {
          console.log('User found in session:', session.user)
          
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          console.log('Profile check result:', { profile, profileError })

          if (profileError && profileError.code === 'PGRST116') {
            console.log('Creating new user profile...')
            // User doesn't exist in public.users table
            const { data: newProfile, error: insertError } = await supabase
              .from('users')
              .upsert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  role: 'mentee',
                  credits: 5,
                  created_at: new Date().toISOString()
                }
              ], {
                onConflict: 'id'
              })
              .select()
              .single()

            if (insertError) {
              console.error('Error creating user profile:', insertError)
              throw insertError
            }

            console.log('New profile created:', newProfile)
          } else if (profileError) {
            console.error('Profile error:', profileError)
            throw profileError
          }

          // Successfully created/found user profile
          console.log('Redirecting to dashboard...')
          navigate('/', { replace: true })
        } else {
          console.log('No session found, redirecting to login...')
          navigate('/login', { replace: true })
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        setError(error instanceof Error ? error.message : 'An error occurred during authentication')
        // Don't redirect immediately on error, show the error to the user
      }
    }

    handleAuthChange()
  }, [navigate])

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {error ? 'Authentication Error' : 'Setting up your account'}
          </CardTitle>
          <CardDescription className="text-center">
            {error ? error : 'Please wait while we get everything ready...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          {error ? (
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              Return to Login
            </button>
          ) : (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          )}
        </CardContent>
      </Card>
    </div>
  )
} 