import { useApp } from '../contexts/AppContext';

export function NotificationsPage() {
  const { notifications } = useApp();
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="bg-white rounded-lg shadow divide-y">
        {notifications.map((notification) => (
          <div key={notification.id} className="p-4 hover:bg-gray-50">
            <p className="text-gray-600">{notification.message}</p>
            <span className="text-sm text-gray-500">
              {new Date(notification.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 