import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Mentor {
  id: string;
  name: string | null;
  avatar_url: string | null;
  expertise: string[];
  rating: number;
  review_count: number;
  bio: string | null;
  portfolio: string | null;
  languages: string[];
  available: boolean;
}

interface MentorListProps {
  onSelectMentor: (mentorId: string) => void;
}

export function MentorList({ onSelectMentor }: MentorListProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    expertise: '',
    language: '',
    minRating: 0,
  });

  useEffect(() => {
    fetchMentors();
  }, []);

  async function fetchMentors() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'mentor')
        .order('rating', { ascending: false });

      if (error) throw error;

      setMentors(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  }

  // Get unique expertise and languages from all mentors
  const allExpertise = Array.from(new Set(mentors.flatMap(m => m.expertise || [])));
  const allLanguages = Array.from(new Set(mentors.flatMap(m => m.languages || [])));

  // Filter mentors based on criteria
  const filteredMentors = mentors.filter(mentor => {
    const matchesExpertise = !filters.expertise || 
      mentor.expertise?.includes(filters.expertise);
    const matchesLanguage = !filters.language || 
      mentor.languages?.includes(filters.language);
    const matchesRating = mentor.rating >= filters.minRating;
    return matchesExpertise && matchesLanguage && matchesRating;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Loading mentors...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchMentors}
          className="mt-2 text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

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
            {allExpertise.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
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
            {allLanguages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
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
        {filteredMentors.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No mentors found matching your criteria
          </p>
        ) : (
          filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="block border rounded-lg p-6 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={mentor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name || '')}`}
                  alt={mentor.name || 'Mentor'}
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
                        <span className="text-sm text-gray-500">{mentor.review_count} reviews</span>
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
                      {mentor.expertise?.filter(Boolean).map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">
                      Languages: {mentor.languages?.filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 