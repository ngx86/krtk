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
      const isSessionActive = await checkSessionActive();
      console.log('RequestFeedbackPage: Session active:', isSessionActive);
      setSessionValid(isSessionActive);
      return isSessionActive;
    } catch (err) {
      console.error('RequestFeedbackPage: Session check error', err);
      setSessionValid(false);
      return false;
    }
  }, [checkSessionActive]);

  // Check authentication on component mount - don't redirect immediately
  useEffect(() => {
    // Only check auth after loading is complete
    if (!authLoading) {
      const checkAuth = async () => {
        // If already authenticated, mark as checked and continue
        if (isAuthenticated && authUser && appUser) {
          console.log('RequestFeedbackPage: Already authenticated, continuing');
          setAuthChecked(true);
          setSessionValid(true);
          return;
        }
        
        // Not authenticated yet, check session
        console.warn('RequestFeedbackPage: Not authenticated, checking session');
        const validSession = await validateSession();
        
        if (!validSession) {
          // If session isn't valid, delay redirect briefly to allow for potential auth state recovery
          console.error('RequestFeedbackPage: Invalid session, preparing to redirect');
          setError('You must be logged in to request feedback. Please wait while we confirm your authentication...');
          
          // Add a short delay before redirecting
          setTimeout(() => {
            if (!isAuthenticated) {
              console.error('RequestFeedbackPage: Still not authenticated after delay, redirecting to login');
              navigate('/login', { replace: true });
            } else {
              console.log('RequestFeedbackPage: Authentication restored during delay, continuing');
              setError(null);
              setAuthChecked(true);
              setSessionValid(true);
            }
          }, 1500);
        } else {
          // Session is valid
          console.log('RequestFeedbackPage: Session valid, continuing');
          setAuthChecked(true);
          setSessionValid(true);
          setError(null);
        }
      };
      
      checkAuth();
    }
  }, [authUser, appUser, authLoading, isAuthenticated, navigate, validateSession]);

  // Fetch mentor data after auth check
  useEffect(() => {
    if (authChecked && sessionValid && mentorId) {
      console.log('Fetching mentor with ID:', mentorId);
      fetchMentor();
    } else if (authChecked && sessionValid && !mentorId) {
      setError('No mentor ID provided');
      console.error('RequestFeedbackPage: No mentor ID in URL params');
      setLoading(false);
    }
  }, [mentorId, authChecked, sessionValid]);

  async function fetchMentor() {
    if (!mentorId) return;
    
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
  }

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