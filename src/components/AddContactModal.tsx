/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AddNicheModal from '@/components/AddNicheModal';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialNicheId?: string;
}

export default function AddContactModal({ isOpen, onClose, onSuccess, initialNicheId }: AddContactModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [niches, setNiches] = useState<any[]>([]);
  const [isNicheModalOpen, setIsNicheModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    status: 'new',
    niche_id: initialNicheId || '',
    deal_value: '',
    pitch: '',
    pitch_notes: ''
  });

  const [rawText, setRawText] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiError, setAiError] = useState('');

  // Load available niches
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
        console.error('Failed to load niches in AddContactModal', err);
      }
    }
    if (isOpen) {
      loadNiches();
      if (initialNicheId) {
        setFormData(prev => ({ ...prev, niche_id: initialNicheId }));
      }
    }
  }, [user, isOpen, initialNicheId]);

  const handleParseAI = async () => {
    if (!rawText.trim() || !user) return;
    setIsAiParsing(true);
    setAiError('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/ai/parse-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rawText })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to parse');
      }
      const data = await res.json();
      
      setFormData(prev => ({
        ...prev,
        ...data,
      }));
      setRawText('');
    } catch (err: unknown) {
      console.error(err);
      setAiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleNicheCreated = (newNiche: any) => {
    if (newNiche) {
      setNiches(prev => [...prev, newNiche]);
      setFormData(prev => ({ ...prev, niche_id: newNiche.id }));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const pitchArray = formData.pitch ? formData.pitch.split(',').map(p => p.trim()).filter(p => p) : [];
      const selectedNicheObj = niches.find(n => n.id === formData.niche_id);

      const token = await user.getIdToken();
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          niche_id: formData.niche_id || null,
          niche_name: selectedNicheObj ? selectedNicheObj.name : null,
          deal_value: Number(formData.deal_value) || 0,
          pitch: pitchArray
        })
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          source: '',
          status: 'new',
          niche_id: '',
          deal_value: '',
          pitch: '',
          pitch_notes: ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AddNicheModal
        isOpen={isNicheModalOpen}
        onClose={() => setIsNicheModalOpen(false)}
        onSuccess={handleNicheCreated}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Card */}
        <div className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
                Add New Lead / Contact
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record contact credentials, target niche vertical, and deal value.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* AI Parse Section */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5 font-mono">
                  <span className="material-symbols-outlined text-[15px] text-indigo-600">auto_awesome</span>
                  <span>AI Magic Parse</span>
                </label>
                <span className="text-[10px] text-slate-400">Paste signature or messy notes</span>
              </div>
              <textarea 
                value={rawText} 
                onChange={(e) => setRawText(e.target.value)} 
                rows={2} 
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-900/10 resize-none font-mono" 
                placeholder="e.g. Faisal Sidd, faisal@acme.com, +1-555-0199, Lumon Industries"
              />
              
              {aiError && <p className="text-red-600 text-xs">{aiError}</p>}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParseAI}
                  disabled={isAiParsing || !rawText.trim()}
                  className="px-3 py-1.5 rounded-lg font-semibold bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs shadow-xs"
                >
                  {isAiParsing ? (
                    <><span className="material-symbols-outlined text-[14px] animate-spin">refresh</span> Parsing...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[14px] text-indigo-600">bolt</span> Auto-Extract Fields</>
                  )}
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Full Name *
                </label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" 
                  placeholder="Jane Doe" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Phone Number
                </label>
                <input 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 font-mono" 
                  placeholder="+1 (555) 000-0000" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" 
                  placeholder="jane.doe@company.com" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Company / Organization
                </label>
                <input 
                  value={formData.company} 
                  onChange={e => setFormData({ ...formData, company: e.target.value })} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" 
                  placeholder="Lumon Industries" 
                />
              </div>
            </div>

            {/* Niche & Deal Value (Key New Integration) */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200/90 rounded-xl">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Niche / Vertical
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNicheModalOpen(true)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    + New Niche
                  </button>
                </div>
                <select 
                  value={formData.niche_id} 
                  onChange={e => setFormData({ ...formData, niche_id: e.target.value })} 
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

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Deal Value ($)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">$</span>
                  <input 
                    type="number"
                    min="0"
                    step="100"
                    value={formData.deal_value} 
                    onChange={e => setFormData({ ...formData, deal_value: e.target.value })} 
                    className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 font-mono" 
                    placeholder="3500" 
                  />
                </div>
              </div>
            </div>

            {/* Status & Source */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Lead Stage / Status
                </label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({ ...formData, status: e.target.value })} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                >
                  <option value="new">New Lead</option>
                  <option value="contacted">Contacted</option>
                  <option value="negotiation">In Negotiation</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed / Won</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Lead Source
                </label>
                <input 
                  value={formData.source} 
                  onChange={e => setFormData({ ...formData, source: e.target.value })} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" 
                  placeholder="Website, LinkedIn, Referral" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                Key Topics / Pitch Themes
              </label>
              <input 
                value={formData.pitch} 
                onChange={e => setFormData({ ...formData, pitch: e.target.value })} 
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" 
                placeholder="Cloud Architecture, Automation, CRM Setup" 
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                Scoping Notes
              </label>
              <textarea 
                value={formData.pitch_notes} 
                onChange={e => setFormData({ ...formData, pitch_notes: e.target.value })} 
                rows={2} 
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none" 
                placeholder="Notes from initial call or outreach..." 
              />
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
                <span>{loading ? 'Saving...' : 'Add Lead'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
