"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface DashboardStats {
  totalContacts: number;
  schedulesToday: number;
  pendingTasks: number;
  completedTasks: number;
}

interface ScheduleItem {
  id: string;
  title: string;
  start_time: string;
  type: string;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{
    stats: DashboardStats;
    upcomingSchedules: ScheduleItem[];
    recentActivity: TaskItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
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
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, upcomingSchedules, recentActivity } = data;

  // Formatting utilities
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return {
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[0],
      ampm: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[1] || 'AM',
    };
  };

  const getRelativeTime = (isoString: string) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(isoString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return rtf.format(daysDifference, 'day');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
            Morning, {user?.displayName ? user.displayName.split(' ')[0] : 'Faisal'}.
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s what&apos;s happening across your client pipeline today.
          </p>
        </div>
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Contact</span>
        </Link>
      </div>

      {/* KPI Stat Cards (Crisp Light Theme, High Contrast) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Contacts */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              <span>LIVE</span>
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Contacts</h3>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{stats?.totalContacts ?? 0}</p>
        </div>

        {/* Card 2: Scheduled Today */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">event_available</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
              TODAY
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Scheduled Today</h3>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{stats?.schedulesToday ?? 0}</p>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
              PENDING
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Approvals</h3>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{stats?.pendingTasks ?? 0}</p>
        </div>

        {/* Card 4: Completed Tasks */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
              ALL TIME
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Completed Tasks</h3>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{stats?.completedTasks ?? 0}</p>
        </div>

      </div>

      {/* Main Dashboard Split (Clean White Cards, No Pitch Black Boxes) */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Recent Activity Feed (8 cols) */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
                Recent Task Updates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Chronological audit stream of client pipeline actions</p>
            </div>
            <Link href="/tasks" className="text-xs font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
              View All Tasks →
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <div key={activity.id || idx} className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">fact_check</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{activity.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono uppercase font-medium shrink-0">
                        {activity.status}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-xs text-slate-600 line-clamp-1 mb-1.5">
                        {activity.description}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      <span>{getRelativeTime(activity.created_at)}</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">inbox</span>
                <p className="text-xs font-medium text-slate-600">No recent tasks found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tasks created on the board will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Schedule Widget (4 cols) */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
                Upcoming Schedule
              </h3>
              <Link href="/schedule" className="text-xs font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                Calendar →
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingSchedules && upcomingSchedules.length > 0 ? (
                upcomingSchedules.map((schedule) => {
                  const { time, ampm } = formatTime(schedule.start_time);
                  return (
                    <div key={schedule.id} className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-center min-w-[44px] py-1 px-1.5 rounded-lg bg-white border border-slate-200 shrink-0">
                        <p className="text-[11px] font-bold text-slate-900 font-mono">{time}</p>
                        <p className="text-[9px] text-slate-500 font-mono uppercase">{ampm}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{schedule.title}</p>
                        <p className="text-[11px] text-slate-500 capitalize">{schedule.type ? schedule.type.replace('_', ' ') : 'Appointment'}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                  <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">event</span>
                  <p className="text-xs font-medium text-slate-600">No upcoming events</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Appointments will be listed here</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 text-center">
            <Link
              href="/schedule"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              <span>View Full Agenda</span>
              <span>→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
