import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

interface FeedbackRequest {
  id: number;
  menteeId: string;
  mentorId?: string;
  description: string;
  link: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  urgency: 'low' | 'medium' | 'high';
  creditsCost: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: number;
  userId: string;
  message: string;
  type: 'feedback' | 'credits' | 'system';
  read: boolean;
  createdAt: string;
}

interface AppUser {
  id: string;
  role: 'mentee' | 'mentor';
  credits: number | null;
}

interface AppContextType {
  credits: number;
  notifications: Notification[];
  feedbackRequests: FeedbackRequest[];
  user: AppUser | null;
  createFeedbackRequest: (data: Omit<FeedbackRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  acceptFeedbackRequest: (requestId: number) => Promise<void>;
  completeFeedbackRequest: (requestId: number, feedback: string) => Promise<void>;
  declineFeedbackRequest: (requestId: number, reason: string) => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
  purchaseCredits: (amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [credits, setCredits] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequest[]>([]);

  // Fetch initial data
  useEffect(() => {
    if (authUser) {
      // Convert auth user to app user
      const fetchUserProfile = async () => {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (data) {
          setAppUser({
            id: data.id,
            role: data.role,
            credits: data.credits
          });
        }
      };
      
      fetchUserProfile();
    }
  }, [authUser]);

  useEffect(() => {
    if (appUser) {
      fetchUserData();
      subscribeToUpdates();
    }
  }, [appUser]);

  async function fetchUserData() {
    if (!appUser) return;

    // Fetch credits for mentees
    if (appUser.role === 'mentee') {
      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', appUser.id)
        .single();
      if (userData) {
        setCredits(userData.credits);
      }
    }

    // Fetch notifications
    const { data: notificationsData } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', appUser.id)
      .order('createdAt', { ascending: false });
    if (notificationsData) {
      setNotifications(notificationsData);
    }

    // Fetch feedback requests
    const { data: requestsData } = await supabase
      .from('feedback_requests')
      .select('*')
      .or(`menteeId.eq.${appUser.id},mentorId.eq.${appUser.id}`)
      .order('createdAt', { ascending: false });
    if (requestsData) {
      setFeedbackRequests(requestsData);
    }
  }

  function subscribeToUpdates() {
    if (!appUser) return;

    // Subscribe to notifications
    const notificationsSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `userId=eq.${appUser.id}`,
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      })
      .subscribe();

    // Subscribe to feedback requests
    const requestsSubscription = supabase
      .channel('feedback_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'feedback_requests',
        filter: `menteeId=eq.${appUser.id}`,
      }, payload => {
        if (payload.eventType === 'UPDATE') {
          setFeedbackRequests(prev => 
            prev.map(req => req.id === (payload.new as FeedbackRequest).id ? 
              payload.new as FeedbackRequest : 
              req
            )
          );
        }
      })
      .subscribe();

    return () => {
      notificationsSubscription.unsubscribe();
      requestsSubscription.unsubscribe();
    };
  }

  // Context methods
  async function createFeedbackRequest(data: Omit<FeedbackRequest, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!appUser) return;

    const { error } = await supabase.from('feedback_requests').insert([{
      ...data,
      menteeId: appUser.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]);

    if (error) throw error;
    await fetchUserData();
  }

  async function acceptFeedbackRequest(requestId: number) {
    if (!appUser) return;

    const { error } = await supabase
      .from('feedback_requests')
      .update({
        status: 'accepted',
        mentorId: appUser.id,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
    await fetchUserData();
  }

  async function completeFeedbackRequest(requestId: number, feedback: string) {
    if (!appUser) return;

    const { error } = await supabase
      .from('feedback_requests')
      .update({
        status: 'completed',
        feedback,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
    await fetchUserData();
  }

  async function declineFeedbackRequest(requestId: number, reason: string) {
    if (!appUser) return;

    const { error } = await supabase
      .from('feedback_requests')
      .update({
        status: 'declined',
        feedback: reason,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
    await fetchUserData();
  }

  async function markNotificationAsRead(notificationId: number) {
    if (!appUser) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    await fetchUserData();
  }

  async function purchaseCredits(amount: number) {
    if (!appUser) return;

    const { error } = await supabase
      .from('users')
      .update({ 
        credits: (appUser.credits || 0) + amount 
      })
      .eq('id', appUser.id);

    if (error) throw error;
    await fetchUserData();
  }

  const value = {
    credits,
    notifications,
    feedbackRequests,
    user: appUser,
    createFeedbackRequest,
    acceptFeedbackRequest,
    completeFeedbackRequest,
    declineFeedbackRequest,
    markNotificationAsRead,
    purchaseCredits,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 