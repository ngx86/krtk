import { useNavigate, useSearchParams } from 'react-router-dom';
import { FeedbackRequest } from './FeedbackRequest';
import { useApp } from '../contexts/AppContext';

export function RequestFeedbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedMentorId = searchParams.get('mentor');
  const { createFeedbackRequest, user } = useApp();

  const handleSubmit = async (data: {
    designLink: string;
    description: string;
    mentorId?: number;
    isPublic: boolean;
  }) => {
    try {
      await createFeedbackRequest({
        menteeId: user?.id || '',
        mentorId: data.mentorId?.toString(),
        description: data.description,
        link: data.designLink,
        status: 'pending',
        urgency: 'low',
        creditsCost: 3
      });
      navigate('/');
    } catch (error) {
      console.error('Error submitting feedback request:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <FeedbackRequest
        selectedMentorId={selectedMentorId ? Number(selectedMentorId) : undefined}
        creditCost={3}
      />
    </div>
  );
} 