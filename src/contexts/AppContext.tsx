import { createContext, useContext, useState } from 'react';

interface FeedbackRequest {
  id: number;
  mentee_id: string;
  mentor_id?: string;
  description: string;
  link: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  urgency: 'low' | 'medium' | 'high';
  credits_cost: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: number;
  user_id: string;
  message: string;
  type: 'feedback' | 'credits' | 'system';
  read: boolean;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  role: 'mentor' | 'mentee';
  credits?: number;
}

interface AppContextType {
  user: User | null;
  credits: number;
  loading: boolean;
  notifications: Notification[];
  feedbackRequests: FeedbackRequest[];
  createFeedbackRequest: (data: Omit<FeedbackRequest, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  acceptFeedbackRequest: (requestId: number) => Promise<void>;
  completeFeedbackRequest: (requestId: number, feedback: string) => Promise<void>;
  declineFeedbackRequest: (requestId: number, reason: string) => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
  purchaseCredits: (amount: number) => Promise<void>;
  setUserRole: (role: 'mentor' | 'mentee') => void;
  switchUser: (userId: string) => void;
  users: User[];
  mentorProfiles: MentorProfile[];
  updateMentorProfile: (userId: string, updates: Partial<MentorProfile>) => void;
  getAvailableMentors: () => MentorProfile[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock users data
const mockUsers: User[] = [
  {
    id: 'mentor-1',
    email: 'mentor1@example.com',
    role: 'mentor',
    credits: 0,
  },
  {
    id: 'mentor-2',
    email: 'mentor2@example.com',
    role: 'mentor',
    credits: 0,
  },
  {
    id: 'mentee-1',
    email: 'mentee1@example.com',
    role: 'mentee',
    credits: 100,
  },
  {
    id: 'mentee-2',
    email: 'mentee2@example.com',
    role: 'mentee',
    credits: 50,
  },
];

// Mock mentor profiles
export interface MentorProfile {
  userId: string;
  name: string;
  bio: string;
  expertise: string[];
  languages: string[];
  price_per_feedback: number;
  availability: boolean;
  rating: number;
  total_reviews: number;
  image_url?: string;
  job_title?: string;
  company?: string;
  years_of_experience?: number;
}

const mockMentorProfiles: MentorProfile[] = [
  {
    userId: 'mentor-1',
    name: 'Alex Thompson',
    bio: 'Senior UX Designer with 8 years of experience',
    expertise: ['UI Design', 'User Research', 'Design Systems'],
    languages: ['English', 'Spanish'],
    price_per_feedback: 25,
    availability: true,
    rating: 4.8,
    total_reviews: 124,
    image_url: 'https://api.dicebear.com/7.x/avatars/svg?seed=mentor1',
    job_title: 'Senior UX Designer',
    company: 'Design Co',
    years_of_experience: 8
  },
  {
    userId: 'mentor-2',
    name: 'Sarah Chen',
    bio: 'Product Designer specializing in mobile apps',
    expertise: ['Mobile Design', 'Interaction Design', 'Prototyping'],
    languages: ['English', 'Mandarin'],
    price_per_feedback: 20,
    availability: true,
    rating: 4.9,
    total_reviews: 89,
    image_url: 'https://api.dicebear.com/7.x/avatars/svg?seed=mentor2',
    job_title: 'Product Designer',
    company: 'Tech Mobile',
    years_of_experience: 6
  }
];

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 1,
    user_id: 'mentee-1',
    message: 'Welcome to the platform!',
    type: 'system',
    read: false,
    created_at: new Date().toISOString()
  }
];

// Mock feedback requests
const mockFeedbackRequests: FeedbackRequest[] = [
  {
    id: 1,
    mentee_id: 'mentee-1',
    mentor_id: 'mentor-1',
    description: 'Please review my latest design',
    link: 'https://figma.com/example',
    status: 'pending',
    urgency: 'medium',
    credits_cost: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState('mentee-1');
  const [users] = useState(mockUsers);
  const [mentorProfiles, setMentorProfiles] = useState(mockMentorProfiles);
  const [user, setUser] = useState<User | null>(mockUsers.find(u => u.id === currentUserId) || null);
  const [credits, setCredits] = useState(user?.credits || 0);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications.filter(n => n.user_id === currentUserId)
  );
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequest[]>(
    mockFeedbackRequests.filter(
      fr => fr.mentee_id === currentUserId || fr.mentor_id === currentUserId
    )
  );

  // Function to switch between test users
  function switchUser(userId: string) {
    const newUser = users.find(u => u.id === userId);
    if (newUser) {
      setCurrentUserId(userId);
      setUser(newUser);
      setCredits(newUser.credits || 0);
      setNotifications(mockNotifications.filter(n => n.user_id === userId));
      setFeedbackRequests(
        mockFeedbackRequests.filter(
          fr => fr.mentee_id === userId || fr.mentor_id === userId
        )
      );
    }
  }

  // Function to update mentor profile
  function updateMentorProfile(userId: string, updates: Partial<MentorProfile>) {
    setMentorProfiles(prev =>
      prev.map(profile =>
        profile.userId === userId ? { ...profile, ...updates } : profile
      )
    );
  }

  // Get all available mentors
  function getAvailableMentors(): MentorProfile[] {
    return mentorProfiles.filter(profile => profile.availability);
  }

  async function createFeedbackRequest(data: Omit<FeedbackRequest, 'id' | 'created_at' | 'updated_at'>) {
    const newRequest: FeedbackRequest = {
      id: feedbackRequests.length + 1,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setFeedbackRequests(prev => [...prev, newRequest]);
    setCredits(prev => prev - data.credits_cost);

    // Create notification for mentee
    setNotifications(prev => [{
      id: prev.length + 1,
      user_id: data.mentee_id,
      message: `Your feedback request has been submitted successfully`,
      type: 'feedback',
      read: false,
      created_at: new Date().toISOString()
    }, ...prev]);

    // If request is for a specific mentor, create notification for them
    if (data.mentor_id) {
      setNotifications(prev => [{
        id: prev.length + 2,
        user_id: data.mentor_id!,
        message: `New feedback request from ${users.find(u => u.id === data.mentee_id)?.name || 'a mentee'}`,
        type: 'feedback',
        read: false,
        created_at: new Date().toISOString()
      }, ...prev]);
    }
  }

  async function acceptFeedbackRequest(requestId: number) {
    setFeedbackRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'accepted', updated_at: new Date().toISOString() }
          : req
      )
    );
  }

  async function completeFeedbackRequest(requestId: number, feedback: string) {
    setFeedbackRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'completed', feedback, updated_at: new Date().toISOString() }
          : req
      )
    );
  }

  async function declineFeedbackRequest(requestId: number, reason: string) {
    setFeedbackRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'declined', feedback: reason, updated_at: new Date().toISOString() }
          : req
      )
    );
  }

  async function markNotificationAsRead(notificationId: number) {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }

  async function purchaseCredits(amount: number) {
    setCredits(prev => prev + amount);
    setNotifications(prev => [
      {
        id: prev.length + 1,
        user_id: user?.id || '',
        message: `Successfully purchased ${amount} credits`,
        type: 'credits',
        read: false,
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  }

  function setUserRole(role: 'mentor' | 'mentee') {
    setUser(prev => prev ? { ...prev, role } : null);
  }

  const value = {
    user,
    credits,
    loading,
    notifications,
    feedbackRequests,
    createFeedbackRequest,
    acceptFeedbackRequest,
    completeFeedbackRequest,
    declineFeedbackRequest,
    markNotificationAsRead,
    purchaseCredits,
    setUserRole,
    switchUser,
    users,
    mentorProfiles,
    updateMentorProfile,
    getAvailableMentors,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Export the useApp hook from the same file
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 