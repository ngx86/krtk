import { useState, useEffect, useRef } from 'react';
import { mockNotifications } from '../types';
import { Link } from 'react-router-dom';

interface HeaderProps {
  role: 'mentee' | 'mentor';
  credits: number;
  setRole: (role: 'mentee' | 'mentor') => void;
  onMenuClick: () => void;
}

export function Header({ role, credits, setRole, onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const unreadNotifications = mockNotifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md lg:ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <button
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="ml-auto flex items-center space-x-4">
            {role === 'mentee' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Credits:</span>
                <span className="font-bold text-blue-600">{credits}</span>
                <button className="bg-green-500 text-white px-3 py-1 rounded-full text-sm hover:bg-green-600">
                  Buy Credits
                </button>
              </div>
            )}

            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                  </div>
                  {mockNotifications.slice(0, 5).map((notification, index) => (
                    <div key={index} className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm">{notification.message}</p>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t border-gray-100">
                    <Link 
                      to="/notifications"
                      className="text-sm text-blue-500 hover:text-blue-600"
                      onClick={() => setShowNotifications(false)}
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" data-popup>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {role === 'mentee' ? 'M' : 'T'}
                  </span>
                </div>
              </button>

              {showProfileMenu && (
                <div 
                  ref={profileMenuRef} 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setRole('mentee')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      role === 'mentee' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    } hover:bg-gray-50`}
                  >
                    Switch to Mentee
                  </button>
                  <button
                    onClick={() => setRole('mentor')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      role === 'mentor' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    } hover:bg-gray-50`}
                  >
                    Switch to Mentor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 