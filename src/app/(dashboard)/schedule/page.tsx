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
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...updatedEvent
        }),
      });

      if (res.ok) {
        showToastMessage('Event updated successfully', 'success');
        setEditModalOpen(false);
        setSelectedEvent(null);
        fetchEvents();
      } else {
        const error = await res.json();
        showToastMessage(error.error || 'Failed to update event', 'error');
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to update event', 'error');
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    if (!user) return;
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...event,
          status: newStatus,
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
    <div className="space-y-8">
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
          <div className={`px-5 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            showToast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            <span className="material-symbols-outlined text-[16px]">
              {showToast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{showToast.message}</span>
          </div>
        </div>
      )}

      {/* Page Header (No duplicate TopNavBar) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            You have {events.filter(e => new Date(e.start_time).getMonth() === currentMonth.getMonth()).length} events scheduled for this month.
          </p>
        </div>
        <button
          onClick={() => setEventModalOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Create Event</span>
        </button>
      </div>

      {/* Calendar & Sidebar Grid (Clean Light Theme) */}
      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Calendar View (8 cols) */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <Calendar
            events={events}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        {/* Upcoming Events (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                Upcoming Events
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                NEXT 7 DAYS
              </span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-6 text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs font-semibold text-slate-600">No upcoming events</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click any date on the calendar to add one</p>
                </div>
              ) : (
                upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-all group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                        {new Date(event.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-semibold ${
                        event.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {event.status || 'pending'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mb-1">{event.title}</h4>
                    {event.description && (
                      <p className="text-xs text-slate-600 line-clamp-1 mb-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px]">
                      <span className="capitalize px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-600">
                        {event.type?.replace('_', ' ') || 'follow up'}
                      </span>
                      {event.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(event.id, 'completed')}
                          className="font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          Mark Complete ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Schedule Tip */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono mb-1">Schedule Tip</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedDate
                ? `You have ${getEventsForDate(selectedDate).length} event(s) on ${selectedDate.toLocaleDateString()}. Click any date in the calendar to view or schedule.`
                : 'Click any date in the calendar to view or add events for that day.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
