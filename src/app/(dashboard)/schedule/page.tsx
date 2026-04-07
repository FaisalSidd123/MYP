/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import AddEventModal from '@/components/AddEventModal';
import EditEventModal from '@/components/EditEventModal';
import { useAuth } from '@/context/AuthContext';

export default function SchedulePage() {
  const { user } = useAuth();
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchEvents = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data || []);
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to fetch events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user || !confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/events?id=${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showToastMessage('Event deleted successfully', 'success');
        fetchEvents();
      } else {
        const error = await res.json();
        showToastMessage(error.error || 'Failed to delete event', 'error');
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to delete event', 'error');
    }
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setEditModalOpen(true);
  };

  const handleUpdateEvent = async (updatedEvent: any) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...updatedEvent
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to update event';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || response.statusText;
        }
        showToastMessage(errorMessage, 'error');
        return;
      }

      showToastMessage('Event updated successfully', 'success');
      setEditModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      console.error('Update error:', err);
      showToastMessage('Failed to update event', 'error');
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event || !user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...event,
          status: newStatus
        }),
      });

      if (response.ok) {
        showToastMessage(`Event marked as ${newStatus}`, 'success');
        fetchEvents();
      } else {
        showToastMessage('Failed to update event status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to update event status', 'error');
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const upcomingEvents = events
    .filter(event => new Date(event.start_time) >= new Date())
    .slice(0, 5);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <>
      <AddEventModal isOpen={isEventModalOpen} onClose={() => setEventModalOpen(false)} onSuccess={fetchEvents} />
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSave={handleUpdateEvent}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className={`px-6 py-3 rounded-xl shadow-lg backdrop-blur-md border ${showToast.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
            : 'bg-red-500/20 border-red-500/50 text-red-200'
            }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                {showToast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span className="text-sm font-medium">{showToast.message}</span>
            </div>
          </div>
        </div>
      )}

      <header className="w-full h-20 sticky top-0 z-40 bg-transparent flex items-center justify-between px-12">
        <div className="flex items-center gap-6 flex-1">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input className="w-full bg-surface-container-lowest border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary transition-all" placeholder="Search events, contacts..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex bg-surface-container-low p-1 rounded-xl">
            <button className="px-4 py-1.5 text-xs font-semibold text-[#c0c1ff] bg-surface-container rounded-lg shadow-sm">Monthly</button>
            <button className="px-4 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">Weekly</button>
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">notifications</span></button>
            <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">calendar_view_month</span></button>
            <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">calendar_view_week</span></button>
          </div>
        </div>
      </header>

      <div className="px-12 py-6 grid grid-cols-12 gap-10">
        <div className="col-span-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <p className="text-on-surface-variant mt-1">
                You have {events.filter(e => new Date(e.start_time).getMonth() === currentMonth.getMonth()).length} events scheduled this month.
              </p>
            </div>
          </div>
          <Calendar
            events={events}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        <div className="col-span-4 space-y-8">
          <div>
            <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
              Upcoming Events
              <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full uppercase tracking-tighter">Next 7 Days</span>
            </h3>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-on-surface-variant/50">
                  <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant/50 bg-surface-container-low border border-dashed border-outline-variant/20 rounded-2xl">
                  <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant/60">No upcoming events</p>
                </div>
              ) : (
                upcomingEvents.map(event => (
                  <div key={event.id} className="glass-panel p-5 rounded-3xl hover:translate-x-2 transition-transform cursor-pointer group relative">
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }}
                        className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-xs">edit</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                        className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                      </button>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-secondary-fixed-dim uppercase tracking-widest">
                        {new Date(event.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${event.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                        {event.status || 'pending'}
                      </span>
                    </div>
                    <h4 className="font-bold text-on-surface mb-1">{event.title}</h4>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined rounded-full p-1 bg-surface-container text-primary text-[10px]">person</span>
                      <span className="text-xs text-on-surface-variant truncate max-w-[150px]">
                        {event.description || 'No description provided.'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-surface-container-high px-2 py-1 rounded-md capitalize">
                        {event.type?.replace('_', ' ') || 'follow up'}
                      </span>
                      {event.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(event.id, 'completed')}
                          className="text-[10px] px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent">
            <h4 className="font-headline font-bold text-primary mb-2">Schedule Tip</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {selectedDate
                ? `You have ${getEventsForDate(selectedDate).length} events on ${selectedDate.toLocaleDateString()}. Click on any date to see details.`
                : 'Click on any date in the calendar to view or add events for that day.'}
            </p>
            <button
              onClick={() => setEventModalOpen(true)}
              className="mt-4 w-full py-2 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              Create New Event
            </button>
          </div>
        </div>
      </div>
    </>
  );
}