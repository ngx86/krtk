import { useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export function MentorReviewsPage() {
  const { mentorId } = useParams();
  const { feedbackRequests } = useApp();

  const mentorReviews = feedbackRequests
    .filter(request => request.mentorId === mentorId && request.status === 'completed');

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Mentor Reviews</h1>
      <div className="space-y-4">
        {mentorReviews.map(review => (
          <div key={review.id} className="bg-white p-4 rounded-lg shadow">
            <p>{review.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 