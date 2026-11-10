/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';

interface AddNicheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdNiche?: any) => void;
}

const COLOR_OPTIONS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-300' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-300' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-300' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-300' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-300' },
  { id: 'violet', label: 'Violet', bg: 'bg-violet-500', text: 'text-violet-700', border: 'border-violet-300' },
  { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-300' },
  { id: 'orange', label: 'Orange', bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-300' },
];

const PRESET_ICONS = [
  { icon: 'domain', label: 'Real Estate' },
  { icon: 'computer', label: 'SaaS / Tech' },
  { icon: 'medical_services', label: 'Healthcare' },
  { icon: 'shopping_bag', label: 'E-commerce' },
  { icon: 'campaign', label: 'Marketing' },
  { icon: 'gavel', label: 'Legal' },
  { icon: 'account_balance', label: 'Finance' },
  { icon: 'fitness_center', label: 'Fitness' },
  { icon: 'category', label: 'General' },
];

export default function AddNicheModal({ isOpen, onClose, onSuccess }: AddNicheModalProps) {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'indigo',
    icon: 'category',
    target_deal_size: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/niches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
          target_deal_size: Number(formData.target_deal_size) || 0,
          org_id: currentOrg?.id || null,
        })
      });

      if (res.ok) {
        const created = await res.json();
        if (onSuccess) onSuccess(created);
        onClose();
        setFormData({ name: '', description: '', color: 'indigo', icon: 'category', target_deal_size: '' });
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to create niche');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Network error occurred.');
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
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start mb-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
              Create New Niche
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Define a market vertical or industry segment to organize and track your leads.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Niche Name */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
              Niche Name *
            </label>
            <input 
              required 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" 
              placeholder="e.g. Real Estate, SaaS Startups, Dental Clinics" 
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
              Target Profile & Description
            </label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              rows={2} 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none" 
              placeholder="Key value proposition, target decision makers, or criteria..." 
            />
          </div>

          {/* Target Deal Size */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
              Average / Target Deal Size ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">$</span>
              <input 
                type="number"
                min="0"
                step="50"
                value={formData.target_deal_size} 
                onChange={e => setFormData({ ...formData, target_deal_size: e.target.value })} 
                className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 font-mono" 
                placeholder="2500" 
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
              Select Icon
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PRESET_ICONS.map(item => (
                <button
                  type="button"
                  key={item.icon}
                  onClick={() => setFormData({ ...formData, icon: item.icon })}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    formData.icon === item.icon
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="text-[9px] font-medium truncate w-full text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Tag Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
              Badge Color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setFormData({ ...formData, color: opt.id })}
                  className={`h-7 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    formData.color === opt.id
                      ? 'border-slate-900 ring-2 ring-slate-900/10 font-bold'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${opt.bg}`} />
                  <span className="text-slate-800 text-[11px]">{opt.label}</span>
                </button>
              ))}
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
              className="px-5 py-2 rounded-xl font-semibold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>{loading ? 'Creating...' : 'Create Niche'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
