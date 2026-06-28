import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ThemeToggle } from '@/components/common';
import { Avatar } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export function DashboardNavbar({ onMenuClick, title = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data, markRead, markAllRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md p-2 hover:bg-accent lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative rounded-md p-2 hover:bg-accent"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button type="button" onClick={() => markAllRead()} className="text-xs text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        if (!n.isRead) markRead(n.id);
                        if (n.link) navigate(n.link);
                        setShowNotifs(false);
                      }}
                      className={cn(
                        'block w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent',
                        !n.isRead && 'bg-primary/5',
                      )}
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent"
          >
            <Avatar src={user?.avatar?.url} name={user?.firstName} size="sm" />
            <span className="hidden text-sm font-medium sm:inline">{user?.firstName}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="p-1">
                <Link to="/profile" className="block rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setShowUserMenu(false)}>
                  Edit Profile
                </Link>
                <Link to="/profile/preview" className="block rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setShowUserMenu(false)}>
                  Preview Profile
                </Link>
                <button type="button" onClick={handleLogout} className="block w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-accent">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
