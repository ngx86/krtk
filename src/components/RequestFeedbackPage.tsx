import { useNavigate, useSearchParams } from 'react-router-dom';
import { FeedbackRequest } from './FeedbackRequest';
import { useApp } from '../contexts/AppContext';

export function RequestFeedbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedMentorId = searchParams.get('mentor');
  const { createFeedbackRequest, user } = useApp();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createFeedbackRequest({
        menteeId: user?.id || '',
        mentorId: selectedMentorId || undefined,
        description: formData.get('description') as string,
        link: formData.get('designLink') as string,
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
      <form onSubmit={handleSubmit}>
        <FeedbackRequest
          selectedMentorId={selectedMentorId ? Number(selectedMentorId) : undefined}
          creditCost={3}
        />
      </form>
    </div>
  );
} 