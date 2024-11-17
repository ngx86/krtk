export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'mentee' | 'mentor';
          credits: number;
          name: string | null;
          bio: string | null;
          avatar_url: string | null;
          rating: number;
          review_count: number;
          expertise: string[];
          languages: string[];
          portfolio_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'mentee' | 'mentor';
          credits?: number;
          name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          rating?: number;
          review_count?: number;
          expertise?: string[];
          languages?: string[];
          portfolio_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
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
        Insert: Omit<Database['public']['Tables']['feedback_requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['feedback_requests']['Insert']>;
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
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      reviews: {
        Row: {
          id: number;
          mentor_id: string;
          mentee_id: string;
          feedback_request_id: number;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      credit_transactions: {
        Row: {
          id: number;
          user_id: string;
          amount: number;
          type: 'purchase' | 'spend' | 'refund' | 'earn';
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['credit_transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['credit_transactions']['Insert']>;
      };
    };
  };
} 