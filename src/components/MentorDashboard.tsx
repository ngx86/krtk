import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DollarSign, Clock, Users } from "lucide-react"
import { supabase } from '../lib/supabaseClient';

interface FeedbackRequest {
  id: number;
  description: string;
  link: string;
  status: 'pending' | 'completed' | 'accepted' | 'declined';
  urgency: 'low' | 'medium' | 'high';
  credits_cost: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

interface RequestDetailsProps {
  request: FeedbackRequest;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  onDecline: () => void;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ request, onClose, onSubmit, onDecline }) => {
  const [feedbackText, setFeedbackText] = useState('');

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{request.description}</CardTitle>
            <div className="flex items-center mt-2 space-x-2">
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                {request.credits_cost} Credits
              </span>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80">
                {request.urgency}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h4 className="font-medium">Request Details</h4>
          <p className="text-sm text-muted-foreground">{request.description}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Design Link</h4>
          <a
            href={request.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            View Design
          </a>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Your Feedback</h4>
          <Textarea
            value={feedbackText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackText(e.target.value)}
            placeholder="Enter your feedback here..."
            className="min-h-[150px]"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            onClick={() => onDecline()}
          >
            Decline Request
          </Button>
          <Button
            onClick={() => onSubmit(feedbackText)}
          >
            Submit Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export function MentorDashboard(): JSX.Element {
  const { feedbackRequests, completeFeedbackRequest, declineFeedbackRequest, user } = useApp();
  const [expandedRequest, setExpandedRequest] = useState<{ id: number | null; view: 'sidebar' | 'fullpage' | null }>({ 
    id: null, 
    view: null 
  });
  const [price, setPrice] = useState<string>('');
  const [priceError, setPriceError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMentorStatus();
    }
  }, [user]);

  async function fetchMentorStatus() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('price_per_feedback, available')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setPrice(data.price_per_feedback?.toString() || '');
        setIsAvailable(data.available || false);
      }
    } catch (err) {
      console.error('Error fetching mentor status:', err);
    }
  }

  async function updateAvailability(available: boolean) {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ available })
        .eq('id', user.id);

      if (error) throw error;
      setIsAvailable(available);
    } catch (err) {
      console.error('Error updating availability:', err);
    }
  }

  async function updatePrice() {
    if (!user) return;
    
    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum < 1) {
      setPriceError('Please enter a valid price (minimum 1 credit)');
      return;
    }

    setLoading(true);
    setPriceError(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({ price_per_feedback: priceNum })
        .eq('id', user.id);

      if (error) throw error;
    } catch (err) {
      setPriceError(err instanceof Error ? err.message : 'Failed to update price');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitFeedback = async (requestId: number, feedback: string) => {
    try {
      await completeFeedbackRequest(requestId, feedback);
      setExpandedRequest({ id: null, view: null });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      await declineFeedbackRequest(requestId, 'Request declined');
      setExpandedRequest({ id: null, view: null });
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const pendingRequests = feedbackRequests.filter(r => r.status === 'pending');
  const completedRequests = feedbackRequests.filter(r => r.status === 'completed');

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback Given</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$0</div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Card */}
      <Card>
        <CardHeader>
          <CardTitle>Availability Status</CardTitle>
          <CardDescription>
            Control whether you're available to receive new feedback requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Switch
              checked={isAvailable}
              onCheckedChange={updateAvailability}
            />
            <Label>Available for new requests</Label>
          </div>
        </CardContent>
      </Card>

      {/* Price Setting Card */}
      <Card>
        <CardHeader>
          <CardTitle>Set Your Price</CardTitle>
          <CardDescription>
            Set how many credits you charge for each piece of feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per feedback (in credits)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="price"
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setPriceError(null);
                  }}
                  placeholder="Enter price in credits"
                  className="max-w-[200px]"
                />
                <Button 
                  onClick={updatePrice}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Price'}
                </Button>
              </div>
              {priceError && (
                <p className="text-sm text-destructive">{priceError}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Set a competitive price that reflects your expertise and the value of your feedback.
                Remember that mentees will see this price when browsing for mentors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {expandedRequest.id && expandedRequest.view === 'sidebar' && (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-background border-l">
          <RequestDetails 
            request={feedbackRequests.find(r => r.id === expandedRequest.id)!}
            onClose={() => setExpandedRequest({ id: null, view: null })}
            onSubmit={(feedback) => handleSubmitFeedback(expandedRequest.id!, feedback)}
            onDecline={() => handleDeclineRequest(expandedRequest.id!)}
          />
        </div>
      )}

      {expandedRequest.id && expandedRequest.view === 'fullpage' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <RequestDetails 
              request={feedbackRequests.find(r => r.id === expandedRequest.id)!}
              onClose={() => setExpandedRequest({ id: null, view: null })}
              onSubmit={(feedback) => handleSubmitFeedback(expandedRequest.id!, feedback)}
              onDecline={() => handleDeclineRequest(expandedRequest.id!)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 