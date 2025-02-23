import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
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

  function CopyLinkInstructions() {
    return (
      <div className="mt-4 p-4 bg-muted rounded-md">
        <h3 className="font-medium mb-2">When you get the email:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Right-click the magic link</li>
          <li>Select "Copy link address"</li>
          <li>Come back to this window</li>
          <li>Paste the link in the address bar</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in to get started
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
              {message.type === 'success' && <CopyLinkInstructions />}
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