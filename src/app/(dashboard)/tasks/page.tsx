/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';
import AddTaskModal from '@/components/AddTaskModal';
import EditTaskModal from '@/components/EditTaskModal';
import { useAuth } from '@/context/AuthContext';

export default function TasksPage() {
  const { user } = useAuth();
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchTasks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data || []);
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user || !confirm('Are you sure you want to delete this task?')) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showToastMessage('Task deleted successfully', 'success');
        fetchTasks();
      } else {
        const error = await res.json();
        showToastMessage(error.error || 'Failed to delete task', 'error');
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to delete task', 'error');
    }
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const handleUpdateTask = async (updatedTask: any) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...updatedTask
        }),
      });

      if (res.ok) {
        showToastMessage('Task updated successfully', 'success');
        setEditModalOpen(false);
        setSelectedTask(null);
        fetchTasks();
      } else {
        const error = await res.json();
        showToastMessage(error.error || 'Failed to update task', 'error');
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to update task', 'error');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...task,
          status: newStatus
        }),
      });

      if (res.ok) {
        showToastMessage(`Task marked as ${newStatus}`, 'success');
        fetchTasks();
      } else {
        showToastMessage('Failed to update task status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to update task status', 'error');
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const approvedTasks = tasks.filter(t => t.status === 'approved');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500';
      case 'approved': return 'bg-emerald-400';
      case 'completed': return 'bg-primary';
      default: return 'bg-slate-500';
    }
  };

  return (
    <>
      <AddTaskModal isOpen={isTaskModalOpen} onClose={() => setTaskModalOpen(false)} onSuccess={fetchTasks} />
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleUpdateTask}
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

      <header className="w-full h-20 sticky top-0 z-40 bg-slate-950/50 dark:bg-slate-950/50 backdrop-blur-lg flex items-center justify-between px-8 font-['Inter'] text-sm font-medium">
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
            <input className="w-full bg-slate-900/40 border-none rounded-full py-2.5 pl-12 pr-4 text-sm text-on-surface-variant placeholder:text-slate-600 focus:ring-1 focus:ring-primary/30 transition-all" placeholder="Search tasks, pipelines, or contacts..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-300 transition-colors active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
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
              <p className="text-xs font-bold text-on-surface">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-slate-500">Sales Director</p>
            </div>
            <img className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 ring-offset-2 ring-offset-surface" src={user?.photoURL || 'https://via.placeholder.com/40'} alt="avatar" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-surface-dim p-8">
        <div className="flex gap-8 h-full min-w-max">

          {/* Pending Column */}
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
                <div key={task.id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10 transition-all cursor-pointer group relative">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                      className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                      className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">{task.title}</span>
                    <span className="material-symbols-outlined text-slate-600 group-hover:text-slate-400 transition-colors">more_horiz</span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-6 italic">{task.description || 'No description'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] font-bold">U</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                      </div>
                      <button
                        onClick={() => handleStatusChange(task.id, 'approved')}
                        className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">No pending tasks</div>
              )}
            </div>
          </div>

          {/* Approved Column */}
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
                <div key={task.id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-emerald-400/30 hover:scale-[1.02] transition-all cursor-pointer group relative">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{task.title}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-6 italic">{task.description || 'No description'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] font-bold">U</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                      </div>
                      <button
                        onClick={() => handleStatusChange(task.id, 'completed')}
                        className="text-[10px] px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {approvedTasks.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">No approved tasks</div>
              )}
            </div>
          </div>

          {/* Completed Column */}
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
                <div key={task.id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-primary/30 hover:scale-[1.02] transition-all cursor-pointer group relative">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{task.title}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-6 italic line-through">{task.description || 'No description'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] font-bold">U</div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
                      <span className="material-symbols-outlined text-[10px]">check_circle</span>
                      Completed
                    </div>
                  </div>
                </div>
              ))}
              {completedTasks.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">No completed tasks</div>
              )}
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