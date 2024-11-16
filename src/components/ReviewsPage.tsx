import { useParams, Link } from 'react-router-dom';
import { mockMentors } from '../types';

export function ReviewsPage() {
  const { mentorId } = useParams();
  const mentor = mockMentors.find(m => m.id === Number(mentorId));

  if (!mentor) return <div>Mentor not found</div>;

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      projectTitle: 'E-commerce Homepage Redesign',
      feedback: 'Excellent feedback! Sarah provided detailed insights about the typography and color choices.',
      rating: 5,
      date: '2024-03-15',
      mentee: 'John D.',
      designLink: 'https://figma.com/file/123'
    },
    // Add more mock reviews...
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/mentor/${mentorId}`} className="text-blue-500 hover:underline mb-2 inline-block">
            ← Back to Profile
          </Link>
          <h1 className="text-2xl font-bold">Reviews for {mentor.name}</h1>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold flex items-center">
            {mentor.rating}
            <span className="text-yellow-400 ml-1">★</span>
          </div>
          <div className="text-gray-600">{mentor.reviewCount} reviews</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">All Reviews</h2>
            <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option>Most Recent</option>
              <option>Highest Rated</option>
              <option>Lowest Rated</option>
            </select>
          </div>
        </div>
        <div className="divide-y">
          {reviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{review.projectTitle}</h3>
                  <p className="text-sm text-gray-500">by {review.mentee}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="font-medium">{review.rating}</span>
                </div>
              </div>
              <p className="mt-4 text-gray-600">{review.feedback}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <a 
                  href={review.designLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Project
                </a>
                <span className="text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 