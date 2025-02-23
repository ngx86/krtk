import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const navigate = useNavigate();
  
  // Get the selected role from sessionStorage
  const selectedRole = sessionStorage.getItem('selectedRole') as 'mentee' | 'mentor' | null;

  useEffect(() => {
    // If no role is selected, redirect to splash screen
    if (!selectedRole) {
      navigate('/');
      return;
    }

    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkAuth();
  }, [selectedRole, navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedRole) {
      setMessage({
        text: 'Please select a role first',
        type: 'error'
      });
      navigate('/');
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: selectedRole
          }
        }
      });

      if (error) throw error;

      setMessage({
        text: 'Check your email for the login link!',
        type: 'success'
      });
      
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Failed to send login link',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            {selectedRole === 'mentee' 
              ? 'Sign in to get feedback on your designs'
              : 'Sign in to provide feedback to others'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 text-sm rounded-md ${
              message.type === 'error' 
                ? 'bg-destructive/10 text-destructive'
                : 'bg-green-100 text-green-800'
            }`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending magic link...' : 'Send magic link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 