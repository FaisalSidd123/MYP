"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, upcomingSchedules, recentActivity } = data;

  // Formatting utilities
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return {
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[0],
      ampm: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[1],
    };
  };

  const getRelativeTime = (isoString: string) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(isoString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return rtf.format(daysDifference, 'day');
  };

  return (
    <>
      {/* Welcome Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)] mb-1">
            Morning, {user?.displayName ? user.displayName.split(' ')[0] : 'Architect'}.
          </h2>
          <p className="text-[var(--color-on-surface-variant)]">Here's what's happening in your network today.</p>
        </div>
        <button className="primary-gradient text-[var(--color-on-primary)] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
          <span className="material-symbols-outlined">add</span>
          New Contact
        </button>
      </header>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Card 1 */}
        <div className="glass-card ghost-border p-6 rounded-2xl group hover:bg-[var(--color-surface-bright)]/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-green-400">trending_up</span>
            </span>
          </div>
          <h3 className="text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider mb-1">Total Contacts</h3>
          <p className="text-3xl font-black text-[var(--color-on-surface)] tracking-tighter">{stats?.totalContacts}</p>
        </div>

        {/* Card 2 */}
        <div className="glass-card ghost-border p-6 rounded-2xl group hover:bg-[var(--color-surface-bright)]/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[var(--color-tertiary)]/10 rounded-xl text-[var(--color-tertiary)]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Live Today</span>
          </div>
          <h3 className="text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider mb-1">Scheduled Today</h3>
          <p className="text-3xl font-black text-[var(--color-on-surface)] tracking-tighter">{stats?.schedulesToday}</p>
        </div>

        {/* Card 3 */}
        <div className="glass-card ghost-border p-6 rounded-2xl group hover:bg-[var(--color-surface-bright)]/40 transition-all duration-300 border-l-4 border-l-[var(--color-error)]/30">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[var(--color-error)]/10 rounded-xl text-[var(--color-error)]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-error-dim)]">Urgent</span>
          </div>
          <h3 className="text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider mb-1">Pending Approvals</h3>
          <p className="text-3xl font-black text-[var(--color-on-surface)] tracking-tighter">{stats?.pendingTasks}</p>
        </div>

        {/* Card 4 */}
        <div className="glass-card ghost-border p-6 rounded-2xl group hover:bg-[var(--color-surface-bright)]/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-400/10 rounded-xl text-green-400">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">All Time</span>
          </div>
          <h3 className="text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider mb-1">Completed Tasks</h3>
          <p className="text-3xl font-black text-[var(--color-on-surface)] tracking-tighter">{stats?.completedTasks}</p>
        </div>
      </div>

      {/* Main Dashboard Split */}
      <div className="grid grid-cols-12 gap-8">
        {/* Recent Activity Feed (8 cols) */}
        <div className="col-span-12 lg:col-span-8 bg-[var(--color-surface-container-low)] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-bold text-[var(--color-on-surface)]">Recent Task Updates</h3>
            <button className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-8 relative z-10">
            {recentActivity && recentActivity.length > 0 ? recentActivity.map((activity: any, idx: number) => (
              <div key={activity.id} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[var(--color-primary)]/20 group-hover:ring-[var(--color-primary)] transition-all duration-500 bg-[var(--color-surface-bright)] flex items-center justify-center">
                     <span className="material-symbols-outlined text-[var(--color-primary)]">fact_check</span>
                  </div>
                  {idx !== recentActivity.length - 1 && <div className="w-[2px] flex-1 activity-line mt-4"></div>}
                </div>
                <div className="pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[var(--color-on-surface)]">{activity.title}</span>
                    <span className="px-2 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-wider">
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-[var(--color-on-surface-variant)] text-sm mb-3">
                    {activity.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]/60 uppercase tracking-widest flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {getRelativeTime(activity.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
               <p className="text-sm text-[var(--color-on-surface-variant)]">No recent tasks found.</p>
            )}
          </div>
        </div>

        {/* Mini Calendar & Sidebar Widget (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Upcoming Widget */}
          <div className="bg-[var(--color-surface-container-high)] rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--color-primary)]/10 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/20 transition-all"></div>
            <h3 className="font-bold text-[var(--color-on-surface)] mb-6">Upcoming Schedule</h3>
            <div className="space-y-4 relative z-10">
              {upcomingSchedules && upcomingSchedules.length > 0 ? upcomingSchedules.map((schedule: any) => {
                const { time, ampm } = formatTime(schedule.start_time);
                return (
                  <div key={schedule.id} className="flex items-center gap-4 p-3 bg-[var(--color-surface-container-lowest)]/50 rounded-xl ghost-border">
                    <div className="text-center min-w-[40px]">
                      <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase">{time}</p>
                      <p className="text-[8px] text-[var(--color-on-surface-variant)]">{ampm}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[var(--color-on-surface)]">{schedule.title}</p>
                      <p className="text-[10px] text-[var(--color-on-surface-variant)] capitalize">{schedule.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-[var(--color-on-surface-variant)]">No upcoming events.</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
