"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AddTaskModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess?: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', due_date: '', status: 'pending'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData })
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
        setFormData({ title: '', description: '', due_date: '', status: 'pending' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#070d1f]/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="glass-card relative z-10 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">New Task</h2>
            <p className="text-sm text-on-surface-variant mt-1">Add a new item to your Kanban pipeline.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Task Title</label>
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="Deploy updated architecture" />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none" placeholder="Details regarding the task..."></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Due Date</label>
              <input required value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} type="date" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 hover:cursor-pointer" style={{ colorScheme: 'dark' }} />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 appearance-none hover:cursor-pointer">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-br from-primary to-primary-dim text-on-primary-fixed shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
