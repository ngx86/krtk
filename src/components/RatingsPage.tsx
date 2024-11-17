import { useApp } from '../contexts/AppContext';

export function RatingsPage() {
  const { feedbackRequests } = useApp();
  
  const completedRequests = feedbackRequests.filter(r => r.status === 'completed');
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Ratings & Reviews</h1>
      <div className="space-y-4">
        {completedRequests.map(request => (
          <div key={request.id} className="bg-white p-4 rounded-lg shadow">
            <p>{request.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 