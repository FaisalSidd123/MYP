/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: any;
  onSave: (contact: any) => void;
}

export default function EditContactModal({ isOpen, onClose, contact, onSave }: EditContactModalProps) {
  const { user } = useAuth();
  const [niches, setNiches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    status: 'new',
    niche_id: '',
    deal_value: '',
    pitch: [] as string[],
    pitch_notes: '',
    avatar_url: ''
  });
  const [pitchInput, setPitchInput] = useState('');

  // Fetch niches
  useEffect(() => {
    async function loadNiches() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/niches', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          setNiches(list || []);
        }
      } catch (err) {
        console.error('Failed to load niches in EditContactModal', err);
      }
    }
    if (isOpen) {
      loadNiches();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (contact) {
      setFormData({
        id: contact.id || '',
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        source: contact.source || '',
        status: contact.status || 'new',
        niche_id: contact.niche_id || '',
        deal_value: contact.deal_value !== undefined ? String(contact.deal_value) : '',
        pitch: contact.pitch || [],
        pitch_notes: contact.pitch_notes || '',
        avatar_url: contact.avatar_url || ''
      });
    }
  }, [contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddPitch = () => {
    if (pitchInput.trim() && !formData.pitch.includes(pitchInput.trim())) {
      setFormData({
        ...formData,
        pitch: [...formData.pitch, pitchInput.trim()]
      });
      setPitchInput('');
    }
  };

  const handleRemovePitch = (service: string) => {
    setFormData({
      ...formData,
      pitch: formData.pitch.filter(p => p !== service)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedNicheObj = niches.find(n => n.id === formData.niche_id);
    onSave({
      ...formData,
      niche_name: selectedNicheObj ? selectedNicheObj.name : null,
      deal_value: Number(formData.deal_value) || 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
              Edit Lead Details
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Update contact, niche segment, and pipeline valuation.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Source
              </label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="Referral, Inbound, etc."
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Niche & Deal Value */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200/90 rounded-xl">
            <div>
              <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-1">
                Assigned Niche
              </label>
              <select
                name="niche_id"
                value={formData.niche_id}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
              >
                <option value="">General / Unassigned</option>
                {niches.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-1">
                Deal Value ($)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">$</span>
                <input
                  type="number"
                  name="deal_value"
                  value={formData.deal_value}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
              Lead Stage / Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
            >
              <option value="new">New Lead</option>
              <option value="contacted">Contacted</option>
              <option value="negotiation">In Negotiation</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed / Won</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
              Pitch Themes / Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={pitchInput}
                onChange={(e) => setPitchInput(e.target.value)}
                placeholder="e.g. Cloud Migration"
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPitch())}
              />
              <button
                type="button"
                onClick={handleAddPitch}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 text-xs font-semibold transition-colors border border-slate-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.pitch.map((service, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-slate-700 text-xs font-mono">
                  {service}
                  <button type="button" onClick={() => handleRemovePitch(service)} className="text-slate-400 hover:text-red-600">
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
              Pitch Notes
            </label>
            <textarea
              name="pitch_notes"
              value={formData.pitch_notes}
              onChange={handleChange}
              rows={3}
              placeholder="Strategy notes, meeting notes, action items..."
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
