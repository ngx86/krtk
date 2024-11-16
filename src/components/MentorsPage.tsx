import { useNavigate } from 'react-router-dom';
import { MentorList } from './MentorList';

export function MentorsPage() {
  const navigate = useNavigate();

  const handleSelectMentor = (mentorId: number) => {
    navigate(`/request-feedback?mentor=${mentorId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Find a Mentor</h1>
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-900"
        >
          Back to Dashboard
        </button>
      </div>
      <MentorList onSelectMentor={handleSelectMentor} />
    </div>
  );
} 