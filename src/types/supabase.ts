export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: 'mentee' | 'mentor';
          credits: number;
          name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: 'mentee' | 'mentor';
          credits?: number;
          name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: 'mentee' | 'mentor';
          credits?: number;
          name?: string | null;
          email?: string | null;
          created_at?: string;
        };
      };
      feedback_requests: {
        Row: {
          id: number;
          mentee_id: string;
          mentor_id: string | null;
          description: string;
          link: string;
          status: 'pending' | 'accepted' | 'completed' | 'declined';
          urgency: 'low' | 'medium' | 'high';
          credits_cost: number;
          feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          mentee_id: string;
          mentor_id?: string | null;
          description: string;
          link: string;
          status?: 'pending' | 'accepted' | 'completed' | 'declined';
          urgency?: 'low' | 'medium' | 'high';
          credits_cost?: number;
          feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          mentee_id?: string;
          mentor_id?: string | null;
          description?: string;
          link?: string;
          status?: 'pending' | 'accepted' | 'completed' | 'declined';
          urgency?: 'low' | 'medium' | 'high';
          credits_cost?: number;
          feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          message: string;
          type: 'feedback' | 'credits' | 'system';
          read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          message: string;
          type: 'feedback' | 'credits' | 'system';
          read?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          message?: string;
          type?: 'feedback' | 'credits' | 'system';
          read?: boolean;
          created_at?: string;
        };
      };
    };
  };
} 