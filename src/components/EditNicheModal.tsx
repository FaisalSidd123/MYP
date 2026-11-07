/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface EditNicheModalProps {
  isOpen: boolean;
  onClose: () => void;
  niche: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    target_deal_size?: number;
  } | null;
  onSuccess?: (updatedNiche?: any) => void;
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

export default function EditNicheModal({ isOpen, onClose, niche, onSuccess }: EditNicheModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'indigo',
    icon: 'category',
    target_deal_size: ''
  });

  useEffect(() => {
    if (niche) {
      setFormData({
        name: niche.name || '',
        description: niche.description || '',
        color: niche.color || 'indigo',
        icon: niche.icon || 'category',
        target_deal_size: niche.target_deal_size ? String(niche.target_deal_size) : ''
      });
      setError('');
    }
  }, [niche, isOpen]);

  if (!isOpen || !niche) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/niches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          id: niche.id,
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
          target_deal_size: Number(formData.target_deal_size) || 0
        })
      });

      if (res.ok) {
        const updated = await res.json();
        if (onSuccess) onSuccess(updated);
        onClose();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to update niche');
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
              Edit Niche Details
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Modify branding, target benchmark size, and positioning for this market segment.
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Niche Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
              Niche / Industry Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Real Estate Investors, SaaS Startups"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
              Positioning & Strategy Notes
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of ICP (Ideal Customer Profile) or pitch angle for this niche..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
            />
          </div>

          {/* Target Deal Size */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
              Target Deal Size Benchmark ($ USD)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="e.g. 5000"
              value={formData.target_deal_size}
              onChange={(e) => setFormData({ ...formData, target_deal_size: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-mono"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
              Icon Symbol
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_ICONS.map((item) => (
                <button
                  type="button"
                  key={item.icon}
                  onClick={() => setFormData({ ...formData, icon: item.icon })}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    formData.icon === item.icon
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="text-[9px] font-semibold truncate max-w-full">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
              Color Theme
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setFormData({ ...formData, color: c.id })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    formData.color === c.id
                      ? `${c.border} ring-2 ring-slate-900 shadow-xs`
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                  <span className="text-slate-700 text-[11px]">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-5 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

