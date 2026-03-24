"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AddContactModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess?: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', company: '', status: 'Active'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.uid })
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
        setFormData({ first_name: '', last_name: '', email: '', company: '', status: 'Active' });
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
            <h2 className="text-2xl font-bold text-on-surface">New Contact</h2>
            <p className="text-sm text-on-surface-variant mt-1">Add a new connection to your enterprise network.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">First Name</label>
              <input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="Jane" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Last Name</label>
              <input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="Doe" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Email Address</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="jane.doe@company.com" />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Company</label>
            <input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="Lumon Industries" />
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
              {loading ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
