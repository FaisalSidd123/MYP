"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AddEventModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess?: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', date: '', time: '', type: 'meeting', description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const start_time = new Date(`${formData.date}T${formData.time}`).toISOString();
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        start_time
      };
      const token = await user.getIdToken();
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
        setFormData({ title: '', date: '', time: '', type: 'meeting', description: '' });
      } else {
        console.error('Failed to save event:', await res.text());
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
            <h2 className="text-2xl font-bold text-on-surface">New Event</h2>
            <p className="text-sm text-on-surface-variant mt-1">Schedule a new meeting or focus block.</p>
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
            <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Event Title</label>
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="Product Sync" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Date</label>
              <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="date" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 hover:cursor-pointer" style={{ colorScheme: 'dark' }} />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Time</label>
              <input required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} type="time" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 hover:cursor-pointer" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Event Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 appearance-none hover:cursor-pointer">
                <option value="meeting">Meeting</option>
                <option value="call">Call</option>
                <option value="follow_up">Follow Up</option>
              </select>
            </div>
            <div className="space-y-2">
               <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Description</label>
               <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="Notes..." />
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
              {loading ? 'Scheduling...' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
