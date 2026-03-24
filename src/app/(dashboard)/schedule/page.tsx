/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import AddEventModal from '@/components/AddEventModal';
import { useAuth } from '@/context/AuthContext';

export default function SchedulePage() {
  const { user } = useAuth();
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/events?userId=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return (
    <>
      <AddEventModal isOpen={isEventModalOpen} onClose={() => setEventModalOpen(false)} onSuccess={fetchEvents} />
      

<header className="w-full h-20 sticky top-0 z-40 bg-transparent flex items-center justify-between px-12">
<div className="flex items-center gap-6 flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input className="w-full bg-surface-container-lowest border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary transition-all" placeholder="Search events, contacts..." type="text"/>
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
<h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">September 2024</h2>
<p className="text-on-surface-variant mt-1">You have 12 meetings scheduled this month.</p>
</div>
<div className="flex gap-2">
<button className="p-2 glass-panel rounded-lg hover:bg-surface-container-highest transition-all"><span className="material-symbols-outlined">chevron_left</span></button>
<button className="p-2 glass-panel rounded-lg hover:bg-surface-container-highest transition-all"><span className="material-symbols-outlined">chevron_right</span></button>
</div>
</div>
<div className="calendar-grid text-center text-xs font-bold text-on-surface-variant mb-4 px-2 uppercase tracking-widest">
<div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
</div>
<Calendar />
</div>

<div className="col-span-4 space-y-8">
<div>
<h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
                        Upcoming Focus
                        <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full uppercase tracking-tighter">Next 48h</span>
</h3>
<div className="space-y-4">

{loading ? (
  <div className="text-center py-4 text-on-surface-variant/50"><span className="material-symbols-outlined animate-spin text-2xl">refresh</span></div>
) : events.length === 0 ? (
  <div className="text-center py-8 text-on-surface-variant/50 bg-surface-container-low border border-dashed border-outline-variant/20 rounded-2xl"><p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant/60">No upcoming events</p></div>
) : events.map(event => (
<div key={event.id} className="glass-panel p-5 rounded-3xl hover:translate-x-2 transition-transform cursor-pointer relative group">
<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-secondary rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
<div className="flex justify-between items-start mb-3">
<span className="text-[10px] font-bold text-secondary-fixed-dim uppercase tracking-widest">{new Date(event.date).toLocaleDateString()} • {event.time}</span>
<span className="material-symbols-outlined text-sm text-on-surface-variant">more_horiz</span>
</div>
<h4 className="font-bold text-on-surface mb-1">{event.title}</h4>
<div className="flex items-center gap-2 mb-4">
<div className="w-5 h-5 rounded-full bg-surface-container-highest border border-white/5 flex items-center justify-center text-[8px] font-bold text-primary">EV</div>
<span className="text-xs text-on-surface-variant truncate max-w-[150px]">{event.attendees || 'Personal'}</span>
</div>
<div className="flex gap-2">
<span className="text-[10px] bg-surface-container-high px-2 py-1 rounded-md">Meeting</span>
</div>
</div>
))}

</div>
</div>
<div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent">
<h4 className="font-headline font-bold text-primary mb-2">Schedule Tip</h4>
<p className="text-xs text-on-surface-variant leading-relaxed">Most of your high-priority meetings fall on Tuesdays. Consider blocking Monday afternoons for prep work.</p>
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
