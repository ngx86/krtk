import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, Bell, LogOut } from "lucide-react"
import { supabase } from '../lib/supabaseClient';

interface HeaderProps {
  role: 'mentee' | 'mentor';
  credits: number;
  onMenuClick: () => void;
}

export function Header({ role, credits, onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { notifications } = useApp();
  const unreadNotifications = notifications.filter((n: { read: boolean }) => !n.read).length;

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {role === 'mentee' && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">Credits:</div>
              <div className="font-bold text-primary">{credits}</div>
              <Button size="sm" variant="outline">
                Buy Credits
              </Button>
            </div>
          )}

          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-black ring-opacity-5">
                <div className="p-4 border-b">
                  <h3 className="text-sm font-medium">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-muted">
                      <p className="text-sm">{notification.message}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <Link
                    to="/notifications"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileMenuRef}>
            <Button
              variant="ghost"
              className="relative"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {role === 'mentee' ? 'M' : 'T'}
                </AvatarFallback>
              </Avatar>
            </Button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 