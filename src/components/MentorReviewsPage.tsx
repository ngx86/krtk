import { useParams } from 'react-router-dom';
import { mockMentors } from '../types';

export function MentorReviewsPage() {
  const { mentorId } = useParams();
  const mentor = mockMentors.find(m => m.id === Number(mentorId));

  if (!mentor) return <div>Mentor not found</div>;

  // Mock reviews data (would come from API)
  const reviews = [
    {
      id: 1,
      projectTitle: 'E-commerce Homepage Redesign',
      feedback: 'Great use of whitespace and typography. Consider increasing contrast for better accessibility.',
      rating: 5,
      date: '2024-03-15',
      mentee: 'John D.'
    },
    // ... more reviews
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reviews for {mentor.name}</h1>
        <div className="flex items-center">
          <span className="text-yellow-400 text-2xl">★</span>
          <span className="ml-2 text-2xl font-bold">{mentor.rating}</span>
          <span className="ml-2 text-gray-600">({mentor.reviewCount} reviews)</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{review.projectTitle}</h3>
                <p className="text-sm text-gray-500 mt-1">by {review.mentee}</p>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1">{review.rating}</span>
              </div>
            </div>
            <p className="mt-4 text-gray-600">{review.feedback}</p>
            <p className="mt-2 text-sm text-gray-500">
              {new Date(review.date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 