/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';
import AddTaskModal from '@/components/AddTaskModal';
import { useAuth } from '@/context/AuthContext';

export default function TasksPage() {
  const { user } = useAuth();
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?userId=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const reviewTasks = tasks.filter(t => t.status === 'review');
  const approvedTasks = tasks.filter(t => t.status === 'approved');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <>
      <AddTaskModal isOpen={isTaskModalOpen} onClose={() => setTaskModalOpen(false)} onSuccess={fetchTasks} />
      

<header className="w-full h-20 sticky top-0 z-40 bg-slate-950/50 dark:bg-slate-950/50 backdrop-blur-lg flex items-center justify-between px-8 w-full font-['Inter'] text-sm font-medium">
<div className="flex items-center flex-1 max-w-xl">
<div className="relative w-full">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
<input className="w-full bg-slate-900/40 border-none rounded-full py-2.5 pl-12 pr-4 text-sm text-on-surface-variant placeholder:text-slate-600 focus:ring-1 focus:ring-primary/30 transition-all" placeholder="Search tasks, pipelines, or contacts..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4">
<button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-300 transition-colors active:scale-95 transition-all">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button 
  onClick={() => setTaskModalOpen(true)}
  className="hidden lg:flex items-center gap-2 py-2 px-5 bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-all active:scale-95"
>
<span className="material-symbols-outlined text-sm">bolt</span>
<span className="font-semibold text-xs uppercase tracking-wider">+ New Task</span>
</button>
</div>
<div className="flex items-center gap-3 pl-6 border-l border-white/5">
<div className="text-right hidden sm:block">
<p className="text-xs font-bold text-on-surface">Alex Mercer</p>
<p className="text-[10px] text-slate-500">Sales Director</p>
</div>
<img className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 ring-offset-2 ring-offset-surface" data-alt="close-up portrait of professional male executive with confident expression in studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlmbj24d6p7jtmTcMNlrQZfRltOVZtIeo3Bz4ii1yDOkLFT2WsPrBwHJEMjWm7kaaPChUIflk2GSgmpFUOGxOpqcBW7h141uiyahcBl5Gy7egAsncgaJ1OK_iqPCtla5J9-5k28nbk5N3EGEbfnhupyhuNFJ6qHBX7tbwAG8SIkwizQ23SYSoWayxm4UlyuyhFHMTWky_hw3ze_T-9kpkNzSk6BoqZ0PgU-5YxzkOuhPAdGxTIryQ2BJMwswCqVsDNocKzRwH6vhAJ"/>
</div>
</div>
</header>

<div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-surface-dim p-8">
<div className="flex gap-8 h-full min-w-max">

<div className="w-80 flex flex-col h-full">
<div className="flex items-center justify-between mb-6 px-2">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
<h3 className="font-bold text-sm tracking-tight text-on-surface">Pending</h3>
</div>
<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500">{pendingTasks.length}</span>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
{pendingTasks.map(task => (
  <div key={task.id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10 transition-all cursor-pointer group">
  <div className="flex justify-between items-start mb-4">
  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">{task.title}</span>
  <span className="material-symbols-outlined text-slate-600 group-hover:text-slate-400 transition-colors">more_horiz</span>
  </div>
  <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-6 italic">{task.description}</p>
  <div className="flex items-center justify-between">
  <div className="flex -space-x-2">
  <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] font-bold">U</div>
  </div>
  <div className="flex items-center gap-3">
  <div className="flex items-center gap-1 text-[10px] text-slate-500">
  <span className="material-symbols-outlined text-xs">calendar_today</span>
                                          {new Date(task.due_date).toLocaleDateString()}
                                      </div>
  <span className="w-2 h-2 rounded-full bg-error shadow-[0_0_8px_rgba(255,180,171,0.4)]"></span>
  </div>
  </div>
  </div>
))}
</div>
</div>

<div className="w-80 flex flex-col h-full">
<div className="flex items-center justify-between mb-6 px-2">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(123,208,255,0.6)]"></div>
<h3 className="font-bold text-sm tracking-tight text-on-surface">In Review</h3>
</div>
<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-tertiary/10 text-tertiary">{reviewTasks.length}</span>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
{reviewTasks.map(task => (
<div key={task.id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-tertiary/30 hover:scale-[1.02] transition-all cursor-pointer">
<div className="flex justify-between items-start mb-4">
<span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">{task.title}</span>
</div>
<p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-6 italic">{task.description}</p>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] font-bold">U</div>
</div>
<div className="flex items-center gap-3">
<div className="flex items-center gap-1 text-[10px] text-slate-500">
<span className="material-symbols-outlined text-xs">calendar_today</span>
                                        {new Date(task.due_date).toLocaleDateString()}
                                    </div>
<span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"></span>
</div>
</div>
</div>
))}
</div>
</div>

<div className="w-80 flex flex-col h-full">
<div className="flex items-center justify-between mb-6 px-2">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
<h3 className="font-bold text-sm tracking-tight text-on-surface">Approved</h3>
</div>
<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-400">{approvedTasks.length}</span>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
{approvedTasks.map(task => (
<div key={task.id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-emerald-400/30 hover:scale-[1.02] transition-all cursor-pointer">
<div className="flex justify-between items-start mb-4">
<span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{task.title}</span>
</div>
<p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-6 italic">{task.description}</p>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] font-bold">U</div>
</div>
<div className="flex items-center gap-1 text-[10px] text-slate-500">
<span className="material-symbols-outlined text-xs">calendar_today</span>
                                    {new Date(task.due_date).toLocaleDateString()}
                                </div>
</div>
</div>
))}
</div>
</div>

<div className="w-80 flex flex-col h-full">
<div className="flex items-center justify-between mb-6 px-2">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(192,193,255,0.6)]"></div>
<h3 className="font-bold text-sm tracking-tight text-on-surface">Completed</h3>
</div>
<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">{completedTasks.length}</span>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 opacity-60 grayscale-[0.2]">
{completedTasks.map(task => (
<div key={task.id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-primary/30 hover:scale-[1.02] transition-all cursor-pointer">
<div className="flex justify-between items-start mb-4">
<span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{task.title}</span>
</div>
<p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-6 italic line-through">{task.description}</p>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] font-bold">U</div>
</div>
<div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
<span className="material-symbols-outlined text-[10px]">check_circle</span>
                                    Archived
                                </div>
</div>
</div>
))}
</div>
</div>

</div>
</div>

<button 
  onClick={() => setTaskModalOpen(true)}
  className="w-full py-3 px-4 mb-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
>
<span className="material-symbols-outlined text-sm">add</span>
                New Task
            </button>
    </>
  );
}
