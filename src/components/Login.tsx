import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LoadingSpinner } from './LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithEmailAndPassword, signUpWithEmail, userRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const resetForm = () => {
    setPassword('');
    setConfirmPassword('');
    // Don't reset email to make it easier to try different methods
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      await signInWithEmail(email);
      setMessage({ 
        type: 'success', 
        text: 'Check your email for the login link!' 
      });
      resetForm();
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to send login link' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    if (!password) {
      setMessage({ type: 'error', text: 'Please enter your password' });
      return;
    }

    if (authMode === 'signup' && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      
      if (authMode === 'signin') {
        await signInWithEmailAndPassword(email, password);
        
        // Navigate user based on role
        if (userRole) {
          navigate('/dashboard');
        } else {
          navigate('/role-selection');
        }
      } else {
        // Sign up flow
        await signUpWithEmail(email, password);
        setMessage({ 
          type: 'success', 
          text: 'Account created successfully! Check your email to confirm your account.' 
        });
        resetForm();
        setAuthMode('signin');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Authentication failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    setMessage(null);
    resetForm();
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            {authMode === 'signin' ? 'Sign in to get started' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-4">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" /> : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </Button>
                <div className="text-center text-sm">
                  <button 
                    type="button"
                    onClick={toggleAuthMode}
                    className="text-blue-600 hover:underline focus:outline-none"
                  >
                    {authMode === 'signin' 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="magic-link" className="space-y-4">
              <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" /> : 'Send Magic Link'}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  We'll email you a magic link for a password-free sign in
                </p>
              </form>
            </TabsContent>
          </Tabs>
          
          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 