import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Mentor {
  id: string;
  name: string;
  price_per_feedback: number;
}

export function RequestFeedbackPage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const { user, credits } = useApp();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    link: '',
    description: '',
  });

  useEffect(() => {
    if (mentorId) {
      fetchMentor();
    }
  }, [mentorId]);

  async function fetchMentor() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, name, price_per_feedback')
        .eq('id', mentorId)
        .single();

      if (error) throw error;
      if (!data.price_per_feedback) {
        throw new Error('This mentor has not set their price yet');
      }
      setMentor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentor');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mentor || !user) return;

    if (!formData.link || !formData.description) {
      setError('Please fill in all fields');
      return;
    }

    if (credits < mentor.price_per_feedback) {
      setError(`You need ${mentor.price_per_feedback} credits to request feedback from this mentor. Please purchase more credits.`);
      return;
    }

    try {
      const { error } = await supabase.from('feedback_requests').insert([
        {
          mentee_id: user.id,
          mentor_id: mentor.id,
          description: formData.description,
          link: formData.link,
          status: 'pending',
          credits_cost: mentor.price_per_feedback,
          urgency: 'medium',
        },
      ]);

      if (error) throw error;

      // Deduct credits from mentee
      const { error: creditError } = await supabase
        .from('users')
        .update({ credits: credits - mentor.price_per_feedback })
        .eq('id', user.id);

      if (creditError) throw creditError;

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback request');
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  if (!mentor) {
    return <div>Mentor not found</div>;
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
                disabled={credits < mentor.price_per_feedback}
              >
                Request Feedback ({mentor.price_per_feedback} credits)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 