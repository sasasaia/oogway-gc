import { useState, useEffect } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Plus, X, Calendar as CalendarIcon, Filter, UserPlus } from 'lucide-react';

export default function Activities({ user }: { user: any }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/activities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setActivities(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: '', category: '', startTime: '', endTime: '' });
        fetchActivities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredActivities = activities.filter(a => {
    if (filterUser !== 'all' && a.user.id.toString() !== filterUser) return false;
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    return true;
  });

  // Unique categories for filter
  const categories = Array.from(new Set(activities.map(a => a.category).filter(Boolean)));
  // Unique users for filter
  const users = Array.from(new Map(activities.map(a => [a.user.id, a.user])).values());

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Schedule & Activities</h1>
          <p className="text-slate-500 font-medium mt-1">Track your fun events and calendar items</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-5 py-2.5 flex items-center space-x-2 rounded-full font-bold transition-all shadow-md shadow-violet-200 transform hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          <span>Add Activity</span>
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-4 mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center space-x-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-slate-700 font-semibold cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1 flex items-center space-x-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
          <UserFilterSelect value={filterUser} onChange={setFilterUser} users={users} />
        </div>
      </div>

      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
            <p className="text-slate-800 font-bold text-lg mb-2">No activities found.</p>
            <p className="text-slate-500">Wait, are we not doing anything fun?</p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id} className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center group hover:shadow-md transition-all">
              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-3 shrink-0 text-center min-w-[80px]">
                <div className="text-xs text-violet-600 font-bold uppercase tracking-wider">{format(parseISO(activity.startTime), 'MMM')}</div>
                <div className="text-2xl font-black text-violet-700">{format(parseISO(activity.startTime), 'dd')}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1.5">
                  <h3 className="font-bold text-xl text-slate-800">{activity.title}</h3>
                  {activity.category && <span className="text-xs bg-fuchsia-100 px-2.5 py-1 rounded-full text-fuchsia-700 font-bold">{activity.category}</span>}
                </div>
                <div className="text-slate-500 text-sm font-medium flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  <span>{format(parseISO(activity.startTime), 'h:mm a')} - {format(parseISO(activity.endTime), 'h:mm a')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4 md:mt-0 bg-slate-50 pl-2 pr-4 py-2 rounded-full border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-violet-100 text-sm text-violet-600 font-black flex items-center justify-center shrink-0" title={`${activity.user.firstName} ${activity.user.lastName}`}>
                  {activity.user.firstName[0]}
                </div>
                <span className="text-sm font-bold text-slate-700">{activity.user.firstName}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden transform transition-all">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-black text-xl text-slate-800">Add Activity</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateActivity} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all placeholder:text-slate-400" placeholder="E.g., Pizza Party" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Category (Optional)</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all placeholder:text-slate-400" placeholder="E.g., Social, Work" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Start Time</label>
                   <input required type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">End Time</label>
                   <input required type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all" />
                </div>
              </div>
              <div className="mt-8 pt-2">
                <button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl py-3.5 font-bold hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg shadow-violet-200 transform hover:scale-[1.02]">Save Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UserFilterSelect({ value, onChange, users }: { value: string, onChange: (val:string)=>void, users: any[] }) {
  return (
    <>
      <UserPlus className="w-5 h-5 text-slate-400" />
      <select 
        className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-slate-700 font-semibold cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">All Users</option>
        {users.map(u => (
          <option key={u.id} value={u.id.toString()}>{u.firstName} {u.lastName}</option>
        ))}
      </select>
    </>
  )
}
