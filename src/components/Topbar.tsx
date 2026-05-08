import React from 'react';
import { Bell, LogOut, User } from 'lucide-react';

export const Topbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-[#0000001a] dark:border-[#ffffff1a] bg-card-bg flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary text-white flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <span className="font-semibold">Current User</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-card-bg"></span>
        </button>
        <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-red-500 hover:text-red-600 dark:text-red-400">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
