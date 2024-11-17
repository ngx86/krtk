import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Mentor {
  id: string;
  name: string;
  // ... other fields
}

export function MentorProfilePage() {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    const fetchMentor = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', mentorId)
        .single();
      
      if (data) setMentor(data);
    };

    fetchMentor();
  }, [mentorId]);

  if (!mentor) return <div>Loading...</div>;

  // ... rest of component
} 