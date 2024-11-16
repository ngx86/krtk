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

// Add to existing types
export type UrgencyLevel = 'normal' | 'urgent';

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
  createdAt: string;
  updatedAt: string;
}

// Mock Data
export const mockNotifications: Notification[] = [
  {
    id: 1,
    message: "Feedback completed for 'Logo Design'",
    read: false,
    createdAt: '2024-03-15T10:00:00Z',
    type: 'feedback'
  },
  {
    id: 2,
    message: "Low credits alert - only 2 credits remaining",
    read: false,
    createdAt: '2024-03-15T09:30:00Z',
    type: 'credit'
  }
];

export const mockFeedbackRequests: FeedbackRequest[] = [
  {
    id: 1,
    description: 'Review my logo design',
    status: 'pending',
    link: 'https://figma.com/file/123',
    createdAt: '2024-03-15'
  },
  {
    id: 2,
    description: 'Help with my landing page layout',
    status: 'completed',
    feedback: 'Consider increasing the contrast between text and background. The hero section could be more impactful with larger typography.',
    link: 'https://figma.com/file/456',
    createdAt: '2024-03-14'
  }
];

export const mockMentors = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson',
    expertise: ['UI Design', 'Typography', 'Branding'],
    rating: 4.8,
    reviewCount: 124,
    bio: '10+ years of experience in UI/UX design. Previously at Google and Facebook.',
    portfolio: 'https://www.behance.net/sarahjohnson',
    available: true,
    languages: ['English', 'Spanish'],
    recentFeedback: [
      {
        projectTitle: 'E-commerce Homepage Redesign',
        feedback: 'Great use of whitespace and typography. Consider increasing contrast for better accessibility.',
        rating: 5
      }
    ]
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen',
    expertise: ['Product Design', 'Design Systems', 'Mobile UI'],
    rating: 4.9,
    reviewCount: 89,
    bio: 'Design Systems Lead with focus on scalable design solutions.',
    portfolio: 'https://www.dribbble.com/michaelchen',
    available: true,
    languages: ['English', 'Mandarin'],
    recentFeedback: [
      {
        projectTitle: 'Mobile App UI Kit',
        feedback: 'Excellent component consistency. The design system is well thought out.',
        rating: 5
      }
    ]
  }
];

export const mockMentee = {
  id: 1,
  role: 'mentee' as const,
  credits: 10,
  name: 'John Doe',
  email: 'john@example.com'
};

export const mockMentor = {
  id: 2,
  role: 'mentor' as const,
  totalFeedbackGiven: 15,
  rating: 4.8,
  earnings: {
    total: 1250,
    pending: 300,
    available: 950,
    recentTransactions: [
      { id: 1, amount: 150, status: 'completed', date: '2024-03-15' },
      { id: 2, amount: 300, status: 'pending', date: '2024-03-14' }
    ]
  }
};

// Mock data store for testing
export const mockDataStore = {
  feedbackSessions: [] as FeedbackSession[],
  notifications: [...mockNotifications],
  menteeCredits: 10,

  // Actions
  createFeedbackRequest(data: {
    menteeId: number;
    mentorId?: number;
    creditsCost: number;
    urgency: UrgencyLevel;
    deadline: string;
  }): FeedbackSession {
    const session: FeedbackSession = {
      id: this.feedbackSessions.length + 1,
      menteeId: data.menteeId,
      mentorId: data.mentorId || 0, // 0 means open request
      requestId: mockFeedbackRequests.length + 1,
      status: 'pending',
      creditsCost: data.urgency === 'urgent' ? data.creditsCost * 1.5 : data.creditsCost,
      urgency: data.urgency,
      deadline: data.deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Deduct credits
    this.menteeCredits -= session.creditsCost;

    // Add notification for mentor
    if (data.mentorId) {
      this.notifications.unshift({
        id: this.notifications.length + 1,
        message: `New feedback request from ${mockMentee.name}`,
        type: 'feedback',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    this.feedbackSessions.push(session);
    return session;
  },

  acceptFeedbackRequest(sessionId: number, mentorId: number) {
    const session = this.feedbackSessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'accepted';
      session.mentorId = mentorId;
      session.updatedAt = new Date().toISOString();

      // Notify mentee
      this.notifications.unshift({
        id: this.notifications.length + 1,
        message: `${mockMentors.find(m => m.id === mentorId)?.name} accepted your feedback request`,
        type: 'feedback',
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  },

  completeFeedbackRequest(sessionId: number, feedback: string) {
    const session = this.feedbackSessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'completed';
      session.updatedAt = new Date().toISOString();

      // Add to mentor's earnings
      const mentor = mockMentors.find(m => m.id === session.mentorId);
      if (mentor) {
        mockMentor.earnings.pending += session.creditsCost * 10; // $10 per credit
      }

      // Notify mentee
      this.notifications.unshift({
        id: this.notifications.length + 1,
        message: `Feedback received for your request`,
        type: 'feedback',
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  },

  declineFeedbackRequest(sessionId: number, reason: string) {
    const session = this.feedbackSessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'declined';
      session.updatedAt = new Date().toISOString();

      // Refund credits to mentee
      this.menteeCredits += session.creditsCost;

      // Notify mentee
      this.notifications.unshift({
        id: this.notifications.length + 1,
        message: `Your feedback request was declined: ${reason}`,
        type: 'feedback',
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  }
}; 