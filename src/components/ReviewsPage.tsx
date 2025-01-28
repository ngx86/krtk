import { useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export function ReviewsPage() {
  const { mentorId } = useParams();
  const { feedbackRequests, user } = useApp();

  const reviews = feedbackRequests.filter(
    request => request.mentor_id === user?.id && request.status === 'completed'
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Reviews</h1>
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white p-4 rounded-lg shadow">
            <p>{review.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 