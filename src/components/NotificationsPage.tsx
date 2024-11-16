import { mockNotifications } from '../types';

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Notifications</h1>
      <div className="bg-white rounded-lg shadow">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className="p-4 border-b last:border-b-0 hover:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-900">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                notification.type === 'feedback' 
                  ? 'bg-blue-100 text-blue-800'
                  : notification.type === 'credit'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {notification.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 