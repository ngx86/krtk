import { useState, useEffect } from 'react';
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

interface Mentor {
  id: string;
  name: string;
  price_per_feedback: number;
}

export function RequestFeedbackPage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const { user: appUser, credits } = useApp();
  const { user: authUser } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    link: '',
    description: '',
  });

  // Check authentication on component mount
  useEffect(() => {
    if (!authUser || !appUser) {
      console.error('RequestFeedbackPage: No authenticated user found');
      setError('You must be logged in to request feedback. Please log in and try again.');
    }
  }, [authUser, appUser]);

  useEffect(() => {
    if (mentorId) {
      console.log('Fetching mentor with ID:', mentorId);
      fetchMentor();
    } else {
      setError('No mentor ID provided');
      console.error('RequestFeedbackPage: No mentor ID in URL params');
    }
  }, [mentorId]);

  async function fetchMentor() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="ml-3">Loading mentor data...</span>
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