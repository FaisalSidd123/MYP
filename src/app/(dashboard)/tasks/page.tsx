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
    if (!task) return;
    await handleUpdateTask({ ...task, status: newStatus });
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

  return (
    <div className="space-y-8">
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
            Task Board
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Visual Kanban workflow for task approval, progress, and execution.
          </p>
        </div>
        <button
          onClick={() => setTaskModalOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Task</span>
        </button>
      </div>

      {/* Kanban Board Container (Clean Light Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Pending Column */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-mono">Pending Review</h3>
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
              {pendingTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all group relative"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400 font-mono flex items-center gap-1 text-[10px]">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                  </span>
                  <button
                    onClick={() => handleStatusChange(task.id, 'approved')}
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    Approve →
                  </button>
                </div>
              </div>
            ))}

            {pendingTasks.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs bg-white/60 border border-dashed border-slate-200 rounded-xl">
                No pending tasks
              </div>
            )}
          </div>
        </div>

        {/* Approved Column */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-mono">Approved / Active</h3>
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
              {approvedTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {approvedTasks.map(task => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all group relative"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400 font-mono flex items-center gap-1 text-[10px]">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                  </span>
                  <button
                    onClick={() => handleStatusChange(task.id, 'completed')}
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    Complete ✓
                  </button>
                </div>
              </div>
            ))}

            {approvedTasks.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs bg-white/60 border border-dashed border-slate-200 rounded-xl">
                No approved tasks
              </div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-mono">Completed</h3>
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
              {completedTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {completedTasks.map(task => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs opacity-80"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-xs font-bold text-slate-800 line-through leading-snug">{task.title}</h4>
                  <span className="text-emerald-600 text-xs font-bold">✓</span>
                </div>
                {task.description && (
                  <p className="text-xs text-slate-400 mb-2 line-clamp-1">
                    {task.description}
                  </p>
                )}
                <div className="text-[10px] text-slate-400 font-mono">
                  Finished on {task.updated_at ? new Date(task.updated_at).toLocaleDateString() : 'Today'}
                </div>
              </div>
            ))}

            {completedTasks.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs bg-white/60 border border-dashed border-slate-200 rounded-xl">
                No completed tasks
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
