import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, MessageCircle, Gamepad2, User, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Activities', path: '/activities', icon: Calendar },
  { name: 'Messages', path: '/messages', icon: MessageCircle },
  { name: 'Minigames', path: '/minigames', icon: Gamepad2 },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#0000001a] dark:border-[#ffffff1a] bg-card-bg flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[#0000001a] dark:border-[#ffffff1a]">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">O</div>
        <h1 className="text-2xl font-bold tracking-tight">Orb</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-base-text hover:bg-black/5 dark:hover:bg-white/10"
                )
              }
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
