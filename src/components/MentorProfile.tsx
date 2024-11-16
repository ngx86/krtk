import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

interface MentorProfileProps {
  mentor: {
    id: number;
    name: string;
    avatar: string;
    expertise: string[];
    rating: number;
    reviewCount: number;
    bio: string;
    portfolio: string;
    languages: string[];
    available: boolean;
    recentFeedback?: {
      projectTitle: string;
      feedback: string;
      rating: number;
    }[];
  };
  onRequestFeedback: (mentorId: number) => void;
}

export function MentorProfile({ mentor, onRequestFeedback }: MentorProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="absolute -bottom-12 left-8">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-24 h-24 rounded-full border-4 border-white"
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 px-8 pb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{mentor.name}</h2>
            <div className="flex items-center mt-1">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 font-medium">{mentor.rating}</span>
              <span className="mx-1 text-gray-400">·</span>
              <span className="text-gray-600">{mentor.reviewCount} reviews</span>
            </div>
          </div>
          <button
            onClick={() => onRequestFeedback(mentor.id)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            disabled={!mentor.available}
          >
            {mentor.available ? 'Request Feedback' : 'Currently Unavailable'}
          </button>
        </div>

        {/* Bio */}
        <p className="mt-4 text-gray-600">{mentor.bio}</p>

        {/* Expertise */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Languages</h3>
          <div className="flex gap-2">
            {mentor.languages.map((language) => (
              <span
                key={language}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {language}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        {mentor.recentFeedback && mentor.recentFeedback.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold mb-4">Recent Feedback</h3>
            <div className="space-y-4">
              {mentor.recentFeedback.map((feedback, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{feedback.projectTitle}</h4>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm">{feedback.rating}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{feedback.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Link */}
        <div className="mt-6">
          <a
            href={mentor.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Portfolio
          </a>
        </div>

        {/* Reviews Section */}
        <Link 
          to={`/mentor/${mentor.id}/reviews`} 
          className="mt-8 block"
        >
          <div className="flex items-center justify-between bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-lg font-semibold">Reviews</h3>
              <div className="flex items-center mt-1">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 font-medium">{mentor.rating}</span>
                <span className="mx-1 text-gray-400">·</span>
                <span className="text-gray-600">{mentor.reviewCount} reviews</span>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
} 