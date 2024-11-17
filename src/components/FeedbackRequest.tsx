import { useState } from 'react';
import { UrgencyLevel, FeedbackRequestFormData } from '../types';
import { useApp } from '../contexts/AppContext';

interface FeedbackRequestProps {
  selectedMentorId?: number;
  creditCost: number;
}

export function FeedbackRequest({ selectedMentorId, creditCost }: FeedbackRequestProps) {
  const { createFeedbackRequest, user } = useApp();
  const [formData, setFormData] = useState<FeedbackRequestFormData>({
    title: '',
    designLink: '',
    description: '',
    background: '',
    deadline: '',
    urgency: 'low',
    isPublic: !selectedMentorId,
    preferredLanguages: [],
    expertise: []
  });

  const expertiseOptions = [
    'UI Design',
    'UX Design',
    'Typography',
    'Color Theory',
    'Layout Design',
    'Design Systems',
    'Mobile Design',
    'Web Design',
    'Branding'
  ];

  const languageOptions = [
    'English',
    'Spanish',
    'Mandarin',
    'French',
    'German'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeedbackRequest({
      menteeId: user?.id || '',
      mentorId: selectedMentorId?.toString(),
      description: formData.description,
      link: formData.designLink,
      status: 'pending',
      urgency: formData.urgency,
      creditsCost: creditCost
    });
  };

  const calculateCost = () => {
    const baseCost = 3;
    return formData.urgency === 'high' ? baseCost * 1.5 : baseCost;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Request Feedback</h2>
          <p className="text-gray-600 mt-1">
            {selectedMentorId 
              ? 'Request feedback from a specific mentor' 
              : 'Post your request to all available mentors'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Cost:</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
            {calculateCost()} Credits
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="E.g., E-commerce Homepage Redesign"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Design Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Design Link
            <span className="ml-1 text-sm text-gray-500">(Figma, Dribbble, etc.)</span>
          </label>
          <input
            type="text"
            value={formData.designLink}
            onChange={(e) => setFormData({ ...formData, designLink: e.target.value })}
            placeholder="Paste your design link here"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Project Background */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Background
          </label>
          <textarea
            value={formData.background}
            onChange={(e) => setFormData({ ...formData, background: e.target.value })}
            placeholder="Describe your project's context, target audience, and goals"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Specific Questions/Areas for Feedback */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            What Would You Like Feedback On?
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="List specific aspects you'd like feedback on (e.g., typography, color scheme, layout)"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* Expertise Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Areas of Expertise Needed
          </label>
          <div className="flex flex-wrap gap-2">
            {expertiseOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  const newExpertise = formData.expertise.includes(skill)
                    ? formData.expertise.filter(s => s !== skill)
                    : [...formData.expertise, skill];
                  setFormData({ ...formData, expertise: newExpertise });
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.expertise.includes(skill)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Languages
          </label>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => {
                  const newLanguages = formData.preferredLanguages.includes(language)
                    ? formData.preferredLanguages.filter(l => l !== language)
                    : [...formData.preferredLanguages, language];
                  setFormData({ ...formData, preferredLanguages: newLanguages });
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.preferredLanguages.includes(language)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>

        {/* Deadline and Urgency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Urgency
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as UrgencyLevel }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {!selectedMentorId && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Make this request visible to all mentors
            </label>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Credit Cost</p>
              <p className="text-xs text-gray-500">
                {formData.urgency === 'high' ? 'High urgency requests cost more credits' : 'Standard request'}
              </p>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {calculateCost()} Credits
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Submit Request ({calculateCost()} Credits)
        </button>
      </form>
    </div>
  );
} 