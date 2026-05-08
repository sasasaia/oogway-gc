import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Gamepad2, MessageCircle, User, Bell, LogOut, Settings as SettingsIcon } from 'lucide-react';

export default function Layout({ user, onLogout }: { user: any, onLogout: () => void }) {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Activities', path: '/activities', icon: CalendarDays },
    { name: 'Mini Games', path: '/minigames', icon: Gamepad2 },
    { name: 'Messages', path: '/messages', icon: MessageCircle },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex bg-slate-50 text-slate-900 h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col hidden md:flex shrink-0 shadow-sm z-10 relative">
        <div className="p-6 pb-2">
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">OOGWAY</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const activeClasses = isActive
              ? 'bg-violet-100 text-violet-700 font-bold shadow-sm shadow-violet-100/50'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold';
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${activeClasses}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-violet-600" />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 leading-tight">{user?.firstName} {user?.lastName}</span>
              <span className="text-xs font-semibold text-slate-400">@{user?.username}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-fuchsia-500 border-2 border-white rounded-full"></span>
            </button>
            <button onClick={onLogout} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors shadow-sm">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
         {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex-1 p-2 rounded-2xl flex flex-col items-center transition-all ${
                  isActive ? 'text-violet-600 scale-110' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-violet-50 stroke-violet-600' : ''}`} />
                <span className={`text-[10px] font-semibold ${isActive ? 'opacity-100' : 'opacity-0 h-0 w-0 overflow-hidden'}`}>{item.name}</span>
              </Link>
            )
          })}
      </div>
    </div>
  );
}
