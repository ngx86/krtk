import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function MentorProfilePage() {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentor() {
      if (!mentorId) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select(`
            *,
            reviews (
              id,
              rating,
              comment,
              created_at,
              mentee:mentee_id (
                name
              )
            )
          `)
          .eq('id', mentorId)
          .single();

        if (error) throw error;
        setMentor(data);
      } catch (error) {
        console.error('Error fetching mentor:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMentor();
  }, [mentorId]);

  if (loading) return <div>Loading...</div>;
  if (!mentor) return <div>Mentor not found</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          <img
            src={mentor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name || '')}`}
            alt={mentor.name}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{mentor.name}</h1>
            <div className="flex items-center mt-2">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 font-medium">{mentor.rating.toFixed(1)}</span>
              <span className="mx-1 text-gray-400">·</span>
              <span className="text-gray-600">{mentor.review_count} reviews</span>
            </div>
            <p className="mt-4 text-gray-600">{mentor.bio}</p>
          </div>
        </div>
      </div>

      {/* Expertise */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Expertise</h2>
        <div className="flex flex-wrap gap-2">
          {mentor.expertise?.filter(Boolean).map((skill: string) => (
            <span
              key={skill}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Reviews</h2>
        <div className="space-y-4">
          {mentor.reviews?.map((review: any) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">{review.mentee?.name || 'Anonymous'}</span>
                  <span className="mx-2">·</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">{review.rating}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 