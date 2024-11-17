// Types
export interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'feedback' | 'credit' | 'system';
}

export interface FeedbackRequest {
  id: number;
  menteeId: string;
  mentorId?: string;
  description: string;
  link: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  urgency: 'low' | 'medium' | 'high';
  creditsCost: number;
  createdAt: string;
  updatedAt: string;
  feedback?: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface FeedbackRequestFormData {
  title: string;
  designLink: string;
  description: string;
  background: string;
  deadline: string;
  urgency: UrgencyLevel;
  mentorId?: number;
  isPublic: boolean;
  preferredLanguages: string[];
  expertise: string[];
}

export interface FeedbackSession {
  id: number;
  menteeId: number;
  mentorId: number;
  requestId: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  creditsCost: number;
  urgency: UrgencyLevel;
  deadline: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
} 