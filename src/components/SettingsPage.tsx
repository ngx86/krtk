import { useState } from 'react';

export function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: false,
    push: false
  });

  return (
    <div>
      <input
        type="checkbox"
        checked={notifications.email}
        onChange={(e) => setNotifications(prev => ({
          ...prev,
          email: e.target.checked
        }))}
      />
      {/* Rest of the component */}
    </div>
  );
} 