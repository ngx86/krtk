import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingSpinner } from './LoadingSpinner';

interface Mentor {
  id: string;
  name: string;
  price_per_feedback: number;
}

export function RequestFeedbackPage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const { user: appUser, credits } = useApp();
  const { user: authUser, loading: authLoading, isAuthenticated, checkSessionActive } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    link: '',
    description: '',
  });

  // Log component state for debugging
  useEffect(() => {
    console.log('RequestFeedbackPage state:', {
      mentorId,
      hasAuthUser: !!authUser,
      hasAppUser: !!appUser,
      authLoading,
      loading,
      error,
      authChecked,
      isAuthenticated,
      sessionValid
    });
  }, [mentorId, authUser, appUser, authLoading, loading, error, authChecked, isAuthenticated, sessionValid]);

  // Check session status without redirecting immediately
  const validateSession = useCallback(async () => {
    try {
      console.log('RequestFeedbackPage: Validating session');
      
      // If auth state is explicitly true, trust it
      if (isAuthenticated && authUser) {
        console.log('RequestFeedbackPage: Already authenticated in memory');
        setSessionValid(true);
        return true;
      }
      
      // Otherwise check with Supabase
      const isSessionActive = await checkSessionActive();
      console.log('RequestFeedbackPage: Session active check:', isSessionActive);
      
      // If session check fails but we have user data, do one retry
      if (!isSessionActive && authUser) {
        console.log('RequestFeedbackPage: Session check failed but user exists, retrying');
        // Short delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try one more time
        const retryCheck = await checkSessionActive();
        console.log('RequestFeedbackPage: Retry session check:', retryCheck);
        setSessionValid(retryCheck);
        return retryCheck;
      }
      
      setSessionValid(isSessionActive);
      return isSessionActive;
    } catch (err) {
      console.error('RequestFeedbackPage: Session check error', err);
      // If we have a user despite the error, give benefit of the doubt
      if (authUser) {
        console.log('RequestFeedbackPage: Error during check but user exists, assuming valid');
        setSessionValid(true);
        return true;
      }
      setSessionValid(false);
      return false;
    }
  }, [checkSessionActive, isAuthenticated, authUser]);

  // Check authentication on component mount - don't redirect immediately
  useEffect(() => {
    // Only check auth after loading is complete
    if (!authLoading) {
      const checkAuth = async () => {
        try {
          console.log('RequestFeedbackPage: Checking auth state');
          
          // Add small delay to allow auth state to sync
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const isValid = await validateSession();
          setAuthChecked(true);
          
          // Give UI time to render before potentially redirecting
          setTimeout(() => {
            if (!isValid && !authUser) {
              // Only redirect if definitely not logged in
              console.warn('RequestFeedbackPage: No valid session, redirecting to login');
              navigate('/login', { 
                replace: true, 
                state: { from: `/dashboard/request-feedback/${mentorId}` } 
              });
            }
          }, 500);
        } catch (err) {
          console.error('RequestFeedbackPage: Auth check error', err);
          setAuthChecked(true);
        }
      };
      
      // Start auth check
      checkAuth();
    }
  }, [authLoading, authUser, validateSession, navigate, mentorId]);

  // Load mentor data and persist auth state
  useEffect(() => {
    if (!mentorId) {
      setLoading(false);
      setError('No mentor specified');
      return;
    }
    
    // If we've already checked auth and session is not valid, don't fetch mentor
    if (authChecked && sessionValid === false && !authUser) {
      setLoading(false);
      return;
    }
    
    // Add a recovery mechanism for cases where auth state might be inconsistent
    // This helps maintain auth state even if initial checks fail
    const persistAuthState = async () => {
      try {
        if (!isAuthenticated || !authUser) {
          const storedToken = localStorage.getItem('supabase.auth.token');
          
          if (storedToken) {
            console.log('RequestFeedbackPage: Found auth token in storage, refreshing session');
            await checkSessionActive();
          }
        }
      } catch (err) {
        console.error('RequestFeedbackPage: Error in auth state persistence', err);
      }
    };
    
    persistAuthState();
    
    const fetchMentor = async () => {
      try {
        setLoading(true);
        console.log('Fetching mentor data for ID:', mentorId);
        
        const { data, error } = await supabase
          .from('users')
          .select('id, name, price_per_feedback')
          .eq('id', mentorId)
          .single();

        if (error) {
          console.error('Error fetching mentor:', error);
          throw error;
        }
        
        if (!data) {
          console.error('No mentor found with ID:', mentorId);
          throw new Error('Mentor not found');
        }
        
        if (!data.price_per_feedback) {
          console.error('Mentor has no price set:', data);
          throw new Error('This mentor has not set their price yet');
        }
        
        console.log('Successfully fetched mentor:', data);
        setMentor(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load mentor';
        console.error('RequestFeedbackPage error:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentor();
  }, [mentorId, authChecked, sessionValid, isAuthenticated, authUser, checkSessionActive]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // First check if session is still valid before proceeding
    const isValid = await validateSession();
    if (!isValid) {
      setError('Your session has expired. Please log in again.');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
      return;
    }
    
    if (!mentor || !appUser) {
      console.error('Cannot submit: Missing mentor or user data');
      setError('Missing required data. Please try again.');
      return;
    }

    if (!formData.link || !formData.description) {
      setError('Please fill in all fields');
      return;
    }

    if (credits < mentor.price_per_feedback) {
      setError(`You need ${mentor.price_per_feedback} credits to request feedback from this mentor. Please purchase more credits.`);
      return;
    }

    try {
      setSubmitting(true);
      console.log('Submitting feedback request to mentor:', mentor.id);
      
      const { error } = await supabase.from('feedback_requests').insert([
        {
          mentee_id: appUser.id,
          mentor_id: mentor.id,
          description: formData.description,
          link: formData.link,
          status: 'pending',
          credits_cost: mentor.price_per_feedback,
          urgency: 'medium',
        },
      ]);

      if (error) {
        console.error('Error creating feedback request:', error);
        throw error;
      }

      // Deduct credits from mentee
      const { error: creditError } = await supabase
        .from('users')
        .update({ credits: credits - mentor.price_per_feedback })
        .eq('id', appUser.id);

      if (creditError) {
        console.error('Error updating credits:', creditError);
        throw creditError;
      }

      console.log('Feedback request submitted successfully');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback request';
      console.error('RequestFeedbackPage submission error:', errorMessage);
      setError(errorMessage);
      setSubmitting(false);
    }
  }

  // Display loading spinner during auth check
  if (authLoading || (loading && !error) || sessionValid === null) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoadingSpinner fullScreen={false} />
        <span className="mt-4 text-center">
          {!authChecked ? 'Verifying your authentication...' : 'Loading mentor data...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>We encountered a problem:</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  if (!mentor) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Mentor Not Found</CardTitle>
          <CardDescription>We couldn't find the mentor you're looking for.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/mentors')}>Browse Mentors</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Request Feedback from {mentor.name}</CardTitle>
          <CardDescription>
            This will cost {mentor.price_per_feedback} credits. You currently have {credits} credits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="link">Design Link</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://www.figma.com/..."
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                required
              />
              <CardDescription>
                Link to your design (Figma, Dribbble, etc.)
              </CardDescription>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please describe what specific aspects you'd like feedback on..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                className="min-h-[150px]"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={credits < mentor.price_per_feedback || submitting}
              >
                {submitting ? 'Submitting...' : `Request Feedback (${mentor.price_per_feedback} credits)`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 