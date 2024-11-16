import { useState } from 'react';
import { mockFeedbackRequests, mockMentor } from '../types';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

interface ExpandedRequest {
  id: number | null;
  view: 'sidebar' | 'fullpage' | null;
}

export function MentorDashboard() {
  const { feedbackRequests, completeFeedbackRequest, declineFeedbackRequest } = useApp();
  const [expandedRequest, setExpandedRequest] = useState<ExpandedRequest>({ id: null, view: null });
  const [feedback, setFeedback] = useState('');

  const pendingRequests = feedbackRequests.filter(r => r.status === 'pending');
  const completedRequests = feedbackRequests.filter(r => r.status === 'completed');

  const handleExpandRequest = (requestId: number, view: 'sidebar' | 'fullpage') => {
    setExpandedRequest({ id: requestId, view });
  };

  const RequestDetails = ({ request }: { request: typeof mockFeedbackRequests[0] }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold">Logo Design Project</h3>
          <div className="flex items-center mt-2 space-x-4">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              3 Credits
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              Urgent
            </span>
            <span className="text-sm text-gray-500">
              Due in 2 days
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpandedRequest({ id: null, view: null })}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Design Preview */}
      <div className="mb-6">
        <img
          src="https://via.placeholder.com/600x300"
          alt="Design Preview"
          className="w-full rounded-lg"
        />
      </div>

      {/* Project Details */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700">Project Background</h4>
          <p className="text-gray-600 mt-1">
            This is a logo for a startup focused on sustainable products. The audience is eco-conscious millennials.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700">Request Message</h4>
          <p className="text-gray-600 mt-1">
            {request.description}
          </p>
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

        {/* Feedback Form */}
        <div className="mt-6">
          <label className="block font-semibold text-gray-700 mb-2">
            Your Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback here..."
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={6}
          />
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={() => setExpandedRequest({ id: null, view: null })}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Decline Request
            </button>
            <button
              onClick={() => {
                console.log('Submitting feedback:', feedback);
                setExpandedRequest({ id: null, view: null });
                setFeedback('');
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSubmitFeedback = (sessionId: number, feedback: string) => {
    completeFeedbackRequest(sessionId, feedback);
    setExpandedRequest({ id: null, view: null });
    setFeedback('');
  };

  const handleDeclineRequest = (sessionId: number) => {
    const reason = prompt('Please provide a reason for declining:');
    if (reason) {
      declineFeedbackRequest(sessionId, reason);
      setExpandedRequest({ id: null, view: null });
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/feedback-history"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-gray-500 text-sm font-medium">Total Feedback Given</h3>
          <p className="text-2xl font-bold text-gray-900">{mockMentor.totalFeedbackGiven}</p>
        </Link>
        <Link
          to="/ratings"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-gray-500 text-sm font-medium">Average Rating</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold text-gray-900">{mockMentor.rating}</p>
            <span className="ml-2 text-yellow-400">★</span>
          </div>
        </Link>
        <Link
          to="/earnings"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-gray-500 text-sm font-medium">Available Earnings</h3>
          <p className="text-2xl font-bold text-green-600">${mockMentor.earnings.available}</p>
        </Link>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Pending Requests ({pendingRequests.length})</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{request.description}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        3 Credits
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        Urgent
                      </span>
                    </div>
                    <div className="mt-2 space-x-4">
                      <a
                        href={request.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View Design
                      </a>
                      <span className="text-sm text-gray-500">
                        Submitted on {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Due in 2 days
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleExpandRequest(request.id, 'sidebar')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleExpandRequest(request.id, 'fullpage')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Provide Feedback
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {completedRequests.map((request) => (
              <div key={request.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{request.description}</h3>
                    <div className="mt-1 space-x-4">
                      <a
                        href={request.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View Design
                      </a>
                      <span className="text-sm text-gray-500">
                        Completed on {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
                {request.feedback && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Your Feedback</h4>
                    <p className="text-gray-600">{request.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Request Sidebar */}
      {expandedRequest.id && expandedRequest.view === 'sidebar' && (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl transform transition-transform duration-300">
          <div className="h-full overflow-y-auto p-6">
            <RequestDetails request={mockFeedbackRequests.find(r => r.id === expandedRequest.id)!} />
          </div>
        </div>
      )}

      {/* Expanded Request Full Page */}
      {expandedRequest.id && expandedRequest.view === 'fullpage' && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
          <RequestDetails request={mockFeedbackRequests.find(r => r.id === expandedRequest.id)!} />
        </div>
      )}
    </div>
  );
} 