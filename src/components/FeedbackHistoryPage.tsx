import { useApp } from '../contexts/AppContext';

export function FeedbackHistoryPage() {
  const { feedbackRequests } = useApp();
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Feedback History</h1>
        <div className="flex space-x-4">
          <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option>All Time</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
          <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option>All Status</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y">
          {feedbackRequests.map((request) => (
            <div key={request.id} className="p-6">
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
                    {request.created_at && (
                      <span className="text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-sm rounded-full ${
                  request.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
              {request.feedback && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback</h4>
                  <p className="text-gray-600">{request.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 