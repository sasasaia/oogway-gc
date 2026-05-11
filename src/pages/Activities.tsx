import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, subMonths, addMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-4">
          Activities
          <div className="flex items-center gap-1 text-base font-normal bg-black/5 dark:bg-white/5 rounded-full px-2 py-1 ml-4 border border-[#0000001a] dark:border-[#ffffff1a]">
            <button onClick={prevMonth} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="min-w-[120px] text-center font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all"
        >
          + Add Event
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEEE';
    const days = [];
    let startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="py-3 text-center text-sm font-semibold opacity-60 uppercase tracking-wider" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 border-b border-[#0000001a] dark:border-[#ffffff1a]">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        
        const dayEvents = events.filter(e => {
          // Keep parsing date strings so timezones match
          const eventDate = new Date(e.date);
          return isSameDay(eventDate, cloneDay);
        });

        days.push(
          <div
            className={`min-h-[120px] border-r border-b border-[#0000001a] dark:border-[#ffffff1a] p-2 flex flex-col transition-colors ${
              !isSameMonth(day, monthStart)
                ? 'opacity-30 bg-black/5 dark:bg-white/5'
                : isSameDay(day, new Date()) ? 'bg-[var(--color-primary)]/10' : 'bg-[var(--color-card-bg)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            key={day.toString()}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? 'bg-[var(--color-primary)] text-white' : ''}`}>
                {formattedDate}
              </span>
            </div>
            
            <div className="mt-2 flex-1 flex flex-col gap-1 overflow-y-auto max-h-[80px]">
              {dayEvents.map(event => (
                <div key={event.id} className="text-xs p-1.5 rounded bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-medium leading-tight truncate">
                  {format(new Date(event.date), 'p')} - {event.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="flex flex-col border-l border-[#0000001a] dark:border-[#ffffff1a]">{rows}</div>;
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto h-full overflow-y-auto flex flex-col">
      {renderHeader()}

      <div className="bg-[var(--color-card-bg)] rounded-2xl shadow-md border border-[#0000001a] dark:border-[#ffffff1a] overflow-hidden flex-1 flex flex-col">
        {renderDays()}
        {renderCells()}
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

