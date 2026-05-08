import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Gamepad2, MessageCircle, User, Bell, LogOut, Search } from 'lucide-react';

export default function Layout({ user, onLogout }: { user: any, onLogout: () => void }) {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Activities', path: '/activities', icon: CalendarDays },
    { name: 'Mini Games', path: '/minigames', icon: Gamepad2 },
    { name: 'Messages', path: '/messages', icon: MessageCircle },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex bg-neutral-950 text-neutral-50 h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 flex flex-col hidden md:flex shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tighter text-emerald-500">OOGWAY</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center space-x-3">
            {/* Mobile menu could go here */}
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-neutral-400" />}
            </div>
            <span className="font-medium">{user?.firstName} {user?.lastName}</span>
            <span className="text-sm text-neutral-500">@{user?.username}</span>
          </div>

          <div className="flex items-center space-x-4 text-neutral-400">
            <button className="p-2 hover:bg-neutral-900 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>
            <button onClick={onLogout} className="p-2 hover:bg-neutral-900 rounded-full transition-colors text-red-400 hover:text-red-300">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 px-4 py-3 flex justify-between items-center z-50">
         {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`p-2 rounded-xl flex flex-col items-center ${
                  isActive ? 'text-emerald-400' : 'text-neutral-500'
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            )
          })}
      </div>
    </div>
  );
}
