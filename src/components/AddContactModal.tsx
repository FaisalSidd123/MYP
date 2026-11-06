"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AddContactModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess?: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', source: '', status: 'new', pitch: '', pitch_notes: ''
  });
  const [rawText, setRawText] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiError, setAiError] = useState('');

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // split pitch comma delimited string into array
      const pitchArray = formData.pitch ? formData.pitch.split(',').map(p => p.trim()).filter(p => p) : [];

      const token = await user.getIdToken();
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, pitch: pitchArray })
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
        setFormData({ name: '', email: '', phone: '', company: '', source: '', status: 'new', pitch: '', pitch_notes: '' });
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
            <h2 className="text-xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>New Contact</h2>
            <p className="text-xs text-slate-500 mt-0.5">Add a new connection or client to your pipeline.</p>
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
                <span>AI Quick Parse</span>
              </label>
              <span className="text-[10px] text-slate-400">Paste text & extract</span>
            </div>
            <textarea 
              value={rawText} 
              onChange={(e) => setRawText(e.target.value)} 
              rows={2} 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-900/10 resize-none font-mono" 
              placeholder="Paste email, signature, or note (e.g. Faisal, faisal@gmail.com, 555-0199)"
            ></textarea>
            
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
                  <><span className="material-symbols-outlined text-[14px] text-indigo-600">bolt</span> Extract Fields</>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Full Name *</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" placeholder="Jane Doe" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Phone Number</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 font-mono" placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Email Address *</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" placeholder="jane.doe@company.com" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Company</label>
              <input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" placeholder="Acme Inc." />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Lead Source</label>
              <input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" placeholder="Inbound, Referral" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="negotiation">Negotiation</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Pitch Themes</label>
              <input value={formData.pitch} onChange={e => setFormData({...formData, pitch: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400" placeholder="SaaS, Enterprise" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Pitch Notes</label>
            <textarea value={formData.pitch_notes} onChange={e => setFormData({...formData, pitch_notes: e.target.value})} rows={2} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none" placeholder="Notes during conversation..."></textarea>
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
              {loading ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
