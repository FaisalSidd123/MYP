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
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Something went wrong');
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
          {/* AI Parse Section */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                AI Magic Parse
              </label>
            </div>
            <textarea 
              value={rawText} 
              onChange={(e) => setRawText(e.target.value)} 
              rows={3} 
              className="w-full bg-surface-container-lowest border border-primary/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none font-mono text-sm placeholder:font-sans" 
              placeholder="Paste raw text here... e.g.&#10;faisal&#10;faisal@gmail.com&#10;300000"
            ></textarea>
            
            {aiError && <p className="text-red-400 text-xs">{aiError}</p>}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleParseAI}
                disabled={isAiParsing || !rawText.trim()}
                className="px-4 py-2 rounded-lg font-bold bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {isAiParsing ? (
                  <><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> Parsing...</>
                ) : (
                  <><span className="material-symbols-outlined text-[16px]">bolt</span> Organize with AI</>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Full Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Phone Number</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Email Address</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="jane.doe@company.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Company</label>
              <input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="Lumon Industries" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Lead Source</label>
              <input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="Referral, Inbound" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 appearance-none hover:cursor-pointer">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="negotiation">Negotiation</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Pitch Themes</label>
              <input value={formData.pitch} onChange={e => setFormData({...formData, pitch: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" placeholder="SaaS, Mobile App..." />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase ml-1">Pitch Notes</label>
            <textarea value={formData.pitch_notes} onChange={e => setFormData({...formData, pitch_notes: e.target.value})} rows={2} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none" placeholder="Notes during scoping..."></textarea>
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
