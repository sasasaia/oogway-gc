import React, { useState, useEffect } from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../AuthContext';

export const Topbar: React.FC = () => {
  const { user, logout, token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      if (!token) return;
      const res = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleReadNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      try {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      } catch(err) {
        console.error(err);
      }
    }
  };

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <header className="h-16 border-b border-[#0000001a] dark:border-[#ffffff1a] bg-[var(--color-card-bg)] flex items-center justify-between px-6 shrink-0 relative">
      <div className="flex items-center gap-3">
        {user?.avatar ? (
          <img src={user.avatar} alt="User Avatar" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--color-secondary)] text-white flex items-center justify-center">
            {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>
        )}
        <span className="font-semibold">{user?.username}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={handleReadNotifications}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {hasUnread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full border-2 border-[var(--color-card-bg)]"></span>}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--color-card-bg)] border border-[#0000001a] dark:border-[#ffffff1a] shadow-xl rounded-xl overflow-hidden z-50">
              <div className="p-3 font-semibold border-b border-[#0000001a] dark:border-[#ffffff1a]">Notifications</div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center opacity-60 text-sm">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-3 border-b border-[#0000000a] dark:border-[#ffffff0a] text-sm ${!n.isRead ? 'bg-black/5 dark:bg-white/5' : ''}`}>
                      <p>{n.content}</p>
                      <p className="text-xs opacity-60 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={logout}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-red-500 hover:text-red-600 dark:text-red-400"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
