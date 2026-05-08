import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, getMonth, startOfMonth, getDaysInMonth } from 'date-fns';
import { useAuth } from '../AuthContext';

interface Event {
  id: number;
  title: string;
  date: string;
  visibility: string;
  author: string;
}

export const Activities: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', visibility: 'public' });
  const { token } = useAuth();

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchEvents();
  }, [token]);

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newEvent),
      });
      setShowModal(false);
      setNewEvent({ title: '', date: '', visibility: 'public' });
      await fetchEvents();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 w-full max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Activities</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all"
        >
          + Add Event
        </button>
      </div>

      {/* Very Simple List View for calendar representing activities */}
      <div className="bg-[var(--color-card-bg)] rounded-2xl shadow-sm border border-[#0000001a] dark:border-[#ffffff1a] overflow-hidden">
        {events.length === 0 ? (
          <div className="p-12 text-center opacity-60">No upcoming events.</div>
        ) : (
          <div className="divide-y divide-[#0000001a] dark:divide-[#ffffff1a]">
            {events.map(event => (
              <div key={event.id} className="p-5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{event.title}</span>
                  <span className="text-sm opacity-70 mt-1">
                    {format(new Date(event.date), 'PPP p')} &bull; by {event.author}
                  </span>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-black/5 dark:bg-white/10">
                  {event.visibility}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[var(--color-card-bg)] rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add New Event</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium opacity-80 mb-1">Event Title</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 rounded-lg border border-[#00000033] dark:border-[#ffffff33] bg-transparent outline-none focus:border-[var(--color-primary)] transition-colors"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium opacity-80 mb-1">Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full p-2.5 rounded-lg border border-[#00000033] dark:border-[#ffffff33] bg-transparent outline-none focus:border-[var(--color-primary)] transition-colors"
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium opacity-80 mb-1">Visibility</label>
                <select 
                  className="w-full p-2.5 rounded-lg border border-[#00000033] dark:border-[#ffffff33] bg-transparent outline-none focus:border-[var(--color-primary)] transition-colors"
                  value={newEvent.visibility}
                  onChange={e => setNewEvent({...newEvent, visibility: e.target.value})}
                >
                  <option value="public" className="text-black">Public</option>
                  <option value="friends" className="text-black">Friends Only</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-8">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddEvent}
                className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
