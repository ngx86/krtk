import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Clock, Users } from "lucide-react"

interface FeedbackRequest {
  id: number;
  description: string;
  link: string;
  status: 'pending' | 'completed' | 'accepted' | 'declined';
  urgency: 'low' | 'medium' | 'high';
  creditsCost: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
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
                {request.creditsCost} Credits
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
  const { feedbackRequests, completeFeedbackRequest, declineFeedbackRequest } = useApp();
  const [expandedRequest, setExpandedRequest] = useState<{ id: number | null; view: 'sidebar' | 'fullpage' | null }>({ 
    id: null, 
    view: null 
  });

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