import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { FeedbackRequest } from '../types';

interface ExpandedRequest {
  id: number | null;
  view: 'sidebar' | 'fullpage' | null;
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
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold">{request.description}</h3>
          <div className="flex items-center mt-2 space-x-4">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {request.creditsCost} Credits
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              {request.urgency}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700">Request Details</h4>
          <p className="text-gray-600 mt-1">{request.description}</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700">Design Link</h4>
          <a
            href={request.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mt-1 block"
          >
            View Design
          </a>
        </div>

        <div className="mt-6">
          <label className="block font-semibold text-gray-700 mb-2">
            Your Feedback
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Enter your feedback here..."
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={6}
          />
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={() => onDecline()}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Decline Request
            </button>
            <button
              onClick={() => onSubmit(feedbackText)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function MentorDashboard(): JSX.Element {
  const { feedbackRequests, completeFeedbackRequest, declineFeedbackRequest } = useApp();
  const [expandedRequest, setExpandedRequest] = useState<ExpandedRequest>({ id: null, view: null });

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Feedback Given</h3>
          <p className="text-2xl font-bold text-gray-900">{completedRequests.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Pending Requests</h3>
          <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Available Earnings</h3>
          <p className="text-2xl font-bold text-green-600">$0</p>
        </div>
      </div>

      {expandedRequest.id && expandedRequest.view === 'sidebar' && (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl">
          <RequestDetails 
            request={feedbackRequests.find(r => r.id === expandedRequest.id)!}
            onClose={() => setExpandedRequest({ id: null, view: null })}
            onSubmit={(feedback) => handleSubmitFeedback(expandedRequest.id!, feedback)}
            onDecline={() => handleDeclineRequest(expandedRequest.id!)}
          />
        </div>
      )}

      {expandedRequest.id && expandedRequest.view === 'fullpage' && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
          <RequestDetails 
            request={feedbackRequests.find(r => r.id === expandedRequest.id)!}
            onClose={() => setExpandedRequest({ id: null, view: null })}
            onSubmit={(feedback) => handleSubmitFeedback(expandedRequest.id!, feedback)}
            onDecline={() => handleDeclineRequest(expandedRequest.id!)}
          />
        </div>
      )}
    </div>
  );
} 