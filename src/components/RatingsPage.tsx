import { mockMentor, mockMentors } from '../types';

interface Feedback {
  projectTitle: string;
  feedback: string;
  rating: number;
}

export function RatingsPage() {
  // Mock rating distribution
  const ratingDistribution = {
    5: 75,
    4: 20,
    3: 4,
    2: 1,
    1: 0
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Ratings & Reviews</h1>

      {/* Overall Rating */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Overall Rating</h2>
            <div className="flex items-center mt-2">
              <span className="text-3xl font-bold">{mockMentor.rating}</span>
              <span className="text-yellow-400 text-3xl ml-2">★</span>
              <span className="text-gray-500 ml-2">({mockMentor.totalFeedbackGiven} reviews)</span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="mt-6 space-y-3">
          {Object.entries(ratingDistribution).reverse().map(([rating, percentage]) => (
            <div key={rating} className="flex items-center">
              <div className="w-12">
                <span className="flex items-center">
                  {rating} <span className="text-yellow-400 ml-1">★</span>
                </span>
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 rounded-full h-2" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-gray-500">
                {percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Reviews</h2>
        </div>
        <div className="divide-y">
          {mockMentors.find(m => m.id === mockMentor.id)?.recentFeedback?.map((feedback: Feedback, index: number) => (
            <div key={index} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{feedback.projectTitle}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-sm">{feedback.rating}</span>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-gray-600">{feedback.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 