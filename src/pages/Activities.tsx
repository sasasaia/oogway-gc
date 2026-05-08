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
          <h1 className="text-2xl font-bold tracking-tight">Schedule & Activities</h1>
          <p className="text-neutral-400 text-sm">Track events and calendar items</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 flex items-center space-x-2 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center space-x-2 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800">
          <Filter className="w-4 h-4 text-neutral-500" />
          <select 
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1 flex items-center space-x-2 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800">
          <UserFilterSelect value={filterUser} onChange={setFilterUser} users={users} />
        </div>
      </div>

      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">No activities found matching filters.</div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center group hover:border-neutral-700 transition-colors">
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 shrink-0 text-center min-w-[80px]">
                <div className="text-xs text-emerald-500 font-bold uppercase">{format(parseISO(activity.startTime), 'MMM')}</div>
                <div className="text-2xl font-bold">{format(parseISO(activity.startTime), 'dd')}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-bold text-lg">{activity.title}</h3>
                  {activity.category && <span className="text-xs bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-300">{activity.category}</span>}
                </div>
                <div className="text-neutral-400 text-sm flex items-center space-x-2">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>{format(parseISO(activity.startTime), 'h:mm a')} - {format(parseISO(activity.endTime), 'h:mm a')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <div className="w-6 h-6 rounded-full bg-neutral-800 text-[10px] font-bold flex items-center justify-center shrink-0" title={`${activity.user.firstName} ${activity.user.lastName}`}>
                  {activity.user.firstName[0]}
                </div>
                <span className="text-sm text-neutral-500">{activity.user.firstName}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-md w-full border border-neutral-800 overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="font-bold text-lg">Add Activity</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white p-1"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateActivity} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500" placeholder="E.g., Team Meeting" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Category (Optional)</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500" placeholder="E.g., Work, Social" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm text-neutral-400 mb-1">Start Time</label>
                   <input required type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 [color-scheme:dark]" />
                </div>
                <div>
                   <label className="block text-sm text-neutral-400 mb-1">End Time</label>
                   <input required type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 [color-scheme:dark]" />
                </div>
              </div>
              <div className="mt-6">
                <button type="submit" className="w-full bg-emerald-500 text-white rounded-xl py-2 font-medium hover:bg-emerald-600 transition-colors">Save Activity</button>
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
      <UserPlus className="w-4 h-4 text-neutral-500" />
      <select 
        className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
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
