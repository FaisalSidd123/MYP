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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start mb-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>New Event</h2>
            <p className="text-xs text-slate-500 mt-0.5">Schedule a client call, review, or milestone.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Event Title *</label>
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" placeholder="e.g. Discovery Sync with Lumon" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Date *</label>
              <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Time *</label>
              <input required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} type="time" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Event Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400">
                <option value="meeting">Meeting</option>
                <option value="call">Call</option>
                <option value="follow_up">Follow Up</option>
              </select>
            </div>
            <div className="space-y-1">
               <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Description</label>
               <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" placeholder="Agenda or location..." />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-semibold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
