import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockMentors } from '../types';
import { BackButton } from './BackButton';

export function MentorProfilePage() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const mentor = mockMentors.find(m => m.id === Number(mentorId));
  
  if (!mentor) {
    return <div>Mentor not found</div>;
  }

  const [formData, setFormData] = useState({
    name: mentor.name,
    bio: mentor.bio,
    expertise: mentor.expertise,
    languages: mentor.languages,
    portfolio: mentor.portfolio,
    avatar: mentor.avatar
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here you would normally upload to a storage service
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Here you would normally save to your backend
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton to="/mentors" label="Back to Mentors" />
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header/Banner */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 text-white hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative group">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer group-hover:opacity-100 opacity-0 transition-opacity">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <span className="text-white text-sm">Change Photo</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-bold w-full border-b border-gray-300 focus:border-blue-500 focus:ring-0"
                />
              ) : (
                <h2 className="text-2xl font-bold">{formData.name}</h2>
              )}
              <div className="flex items-center mt-1">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 font-medium">{mentor.rating}</span>
                <span className="mx-1 text-gray-400">·</span>
                <span className="text-gray-600">{mentor.reviewCount} reviews</span>
              </div>
            </div>
            
            {mentor.id === 2 ? ( // Assuming ID 2 is the logged-in mentor
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            ) : (
              <button
                onClick={() => navigate(`/request-feedback?mentor=${mentor.id}`)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Request Feedback
              </button>
            )}
          </div>

          {/* Bio */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">About</h3>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full h-32 border rounded-lg p-2 focus:border-blue-500 focus:ring-0"
              />
            ) : (
              <p className="text-gray-600">{formData.bio}</p>
            )}
          </div>

          {/* Expertise */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {formData.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
            <div className="space-y-4">
              {mentor.recentFeedback?.map((feedback, index) => (
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

          {/* Portfolio Link */}
          <div className="mt-6">
            {isEditing ? (
              <input
                type="text"
                value={formData.portfolio}
                onChange={e => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                className="w-full border rounded-lg p-2 focus:border-blue-500 focus:ring-0"
                placeholder="Portfolio URL"
              />
            ) : (
              <a
                href={formData.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Portfolio
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 