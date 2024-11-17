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

interface User {
  id: string;
  role: 'mentee' | 'mentor';
  credits: number | null;
}

interface AppContextType {
  credits: number;
  notifications: Notification[];
  feedbackRequests: FeedbackRequest[];
  user: User | null;
  createFeedbackRequest: (data: Omit<FeedbackRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  acceptFeedbackRequest: (requestId: number) => Promise<void>;
  completeFeedbackRequest: (requestId: number, feedback: string) => Promise<void>;
  declineFeedbackRequest: (requestId: number, reason: string) => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
  purchaseCredits: (amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequest[]>([]);

  // Fetch initial data
  useEffect(() => {
    if (user) {
      fetchUserData();
      subscribeToUpdates();
    }
  }, [user]);

  async function fetchUserData() {
    if (!user) return;

    // Fetch credits for mentees
    if (user.role === 'mentee') {
      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
      if (userData) {
        setCredits(userData.credits);
      }
    }

    // Fetch notifications
    const { data: notificationsData } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false });
    if (notificationsData) {
      setNotifications(notificationsData);
    }

    // Fetch feedback requests
    const { data: requestsData } = await supabase
      .from('feedback_requests')
      .select('*')
      .or(`menteeId.eq.${user.id},mentorId.eq.${user.id}`)
      .order('createdAt', { ascending: false });
    if (requestsData) {
      setFeedbackRequests(requestsData);
    }
  }

  function subscribeToUpdates() {
    if (!user) return;

    // Subscribe to notifications
    const notificationsSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `userId=eq.${user.id}`,
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
        filter: `menteeId=eq.${user.id}`,
      }, payload => {
        if (payload.eventType === 'UPDATE') {
          setFeedbackRequests(prev => 
            prev.map(req => req.id === payload.new.id ? payload.new : req)
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
    if (!user) return;

    const { error } = await supabase.from('feedback_requests').insert([{
      ...data,
      menteeId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]);

    if (error) throw error;
    await fetchUserData();
  }

  async function acceptFeedbackRequest(requestId: number) {
    if (!user) return;

    const { error } = await supabase
      .from('feedback_requests')
      .update({
        status: 'accepted',
        mentorId: user.id,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
    await fetchUserData();
  }

  async function completeFeedbackRequest(requestId: number, feedback: string) {
    if (!user) return;

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
    if (!user) return;

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
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    await fetchUserData();
  }

  async function purchaseCredits(amount: number) {
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({ 
        credits: (user.credits || 0) + amount 
      })
      .eq('id', user.id);

    if (error) throw error;
    await fetchUserData();
  }

  const value = {
    credits,
    notifications,
    feedbackRequests,
    user,
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