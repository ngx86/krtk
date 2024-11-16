import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockMentors } from '../types';

interface MentorListProps {
  onSelectMentor: (mentorId: number) => void;
}

export function MentorList({ onSelectMentor }: MentorListProps) {
  const [filters, setFilters] = useState({
    expertise: '',
    language: '',
    minRating: 0,
  });
  const navigate = useNavigate();

  const handleMentorClick = (e: React.MouseEvent, mentorId: number) => {
    const target = e.target as HTMLElement;
    // If clicking the "Request Feedback" button, don't navigate to profile
    if (target.closest('button')) {
      e.preventDefault();
      onSelectMentor(mentorId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expertise
          </label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.expertise}
            onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
          >
            <option value="">All Skills</option>
            <option value="ui">UI Design</option>
            <option value="typography">Typography</option>
            <option value="branding">Branding</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
          >
            <option value="">Any Language</option>
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="mandarin">Mandarin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Rating
          </label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
          >
            <option value="0">Any Rating</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
            <option value="4.8">4.8+</option>
          </select>
        </div>
      </div>

      {/* Mentor List */}
      <div className="space-y-6">
        {mockMentors.map((mentor) => (
          <Link
            key={mentor.id}
            to={`/mentor/${mentor.id}`}
            onClick={(e) => handleMentorClick(e, mentor.id)}
            className="block border rounded-lg p-6 hover:border-blue-500 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{mentor.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm font-medium">{mentor.rating}</span>
                      <span className="mx-1 text-gray-400">·</span>
                      <span className="text-sm text-gray-500">{mentor.reviewCount} reviews</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectMentor(mentor.id);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Request Feedback
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">{mentor.bio}</p>
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700">Expertise</h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-4">
                  <a
                    href={mentor.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Portfolio
                  </a>
                  <span className="text-sm text-gray-500">
                    Languages: {mentor.languages.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 