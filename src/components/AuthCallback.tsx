import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Setting up your account</CardTitle>
          <CardDescription className="text-center">
            Please wait while we get everything ready...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    </div>
  )
} 