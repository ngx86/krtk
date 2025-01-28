import { useApp } from '../contexts/AppContext';

export function NotificationsPage() {
  const { notifications } = useApp();
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="bg-white rounded-lg shadow divide-y">
        {notifications.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).map((notification) => (
          <div key={notification.id} className="p-4 hover:bg-gray-50">
            <p className="text-gray-600">{notification.message}</p>
            <span className="text-sm text-gray-500">
              {new Date(notification.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 