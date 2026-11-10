"use client";
import React, { useState, useEffect } from 'react';
import {
  LEAD_STATUSES,
  LeadStatusKey,
  normalizeLeadStatus,
  QUICK_SCENARIO_PRESETS,
  getLeadStatusMeta,
} from '@/lib/leadStatus';

interface ScenarioNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    name: string;
    company?: string;
    status: string;
    pitch_notes?: string;
  } | null;
  onSave: (leadId: string, status: LeadStatusKey, scenarioNotes: string) => Promise<boolean | void>;
}

export default function ScenarioNoteModal({
  isOpen,
  onClose,
  lead,
  onSave,
}: ScenarioNoteModalProps) {
  const [status, setStatus] = useState<LeadStatusKey>('new');
  const [scenarioNotes, setScenarioNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead && isOpen) {
      setStatus(normalizeLeadStatus(lead.status));
      setScenarioNotes(lead.pitch_notes || '');
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const currentMeta = getLeadStatusMeta(status);

  const handleApplyPreset = (presetText: string) => {
    if (!scenarioNotes.trim()) {
      setScenarioNotes(presetText);
    } else {
      setScenarioNotes((prev) => `${prev.trim()}\n${presetText}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(lead.id, status, scenarioNotes.trim());
      onClose();
    } catch (err) {
      console.error('Failed to save scenario note', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Current Scenario & Next Steps</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {lead.name} {lead.company ? `· ${lead.company}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center justify-between">
              <span>Pipeline Stage / Status</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${currentMeta.badgeClasses}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currentMeta.dotColor}`} />
                <span>{currentMeta.shortLabel}</span>
              </span>
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatusKey)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:bg-white cursor-pointer transition-all"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.description})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Scenario Preset Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
              Quick Scenario Presets (Click to insert)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SCENARIO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset.text)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario & Context Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center justify-between">
              <span>Current Scenario & Prospect Context</span>
              <span className="text-[10px] font-normal text-slate-400">e.g. Next call date, client feedback</span>
            </label>
            <textarea
              rows={4}
              value={scenarioNotes}
              onChange={(e) => setScenarioNotes(e.target.value)}
              placeholder="What is the current situation? (e.g. 'He is looking forward to it after two weeks', 'Sent portfolio video, waiting on CEO decision')"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all resize-y"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[15px]">check</span>
                  <span>Save Scenario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
