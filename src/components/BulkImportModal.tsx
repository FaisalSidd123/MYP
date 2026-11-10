/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { parseBulkRawContacts, ParsedLead } from '@/lib/bulkContactParser';
import { calculateLeadAge } from '@/lib/leadAge';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdCount: number) => void;
  initialNicheId?: string;
}

const SAMPLE_CAKE_LEADS = `Bake N Cake by Sarah\t3423326743\twebsite but only contact info\t4.9(33)
Once Upon a Cake\t3312286074\tserver down\t4.9(150) · Bakery
OccasionsCakes\t3360303017\tno website\t4.8(121)
Delicate Cake\t0300-3589513\tno website\t4.8(13)
Delish Star Sweets and Bakers\t3012049950\tno website\t4.2(625)
Artistra | Customized Cakes\t923242765621\tno website\t4.9(31)
LaFornai\t3322826000\tno website\t5.0(15)
Baking Nest\t3352639681\tno website\t5.0(13)
JC Misquita Bakery\t2132790616\tno website\t4.2(435)
Nice bakery\t3142017365\tno website\t4.0(818)
Sara's Yummylicious (Home Made)\t0334 3036562\tno website\t5.0(28)
Ideal Bakery Hill Park\t0336 0688786.\tno website\t4.2(1.3K)
Al Noor Cake house\t3417608210\tno website\t5.0(6)
Ruffy Tuffy The Baking Room\t92 317 2401753\tno website\t5.0(47)
Sweets By Roviba\t3301371377\tno website\t5.0(9)
Hatimi Bakers Anjarwalas\t2136635302\tno website\t4.2(299)
Cakesaaz | Karachi\t3116757478\tno website\t5.0(4)
A.A Bakers\t3168471896\tno website\t5.0(7)
New Crispo Bakery\t3094284801\tno website\t4.2(652)
M A Cakes Delight\t3368515495\tno website\t4.9(27)
Fiya's Kitchen\t3000363280\tno website\t5.0(8)
Sobieezz\t0333 3921391\tno website\t5.0(1)
Sadia bakes\t3009256606\tno website\t5.0(2)
Farzan Sweets and Bakers\t2136377924\tno website\t4.2(44)
Pastelería\t92 311 1771907\tno website\t5.0(6)`;

export default function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
  initialNicheId,
}: BulkImportModalProps) {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const [rawText, setRawText] = useState('');
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
  const [niches, setNiches] = useState<any[]>([]);
  const [selectedNicheId, setSelectedNicheId] = useState<string>(initialNicheId || '');
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  // Load user's niches
  useEffect(() => {
    async function loadNiches() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/niches', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const list = await res.json();
          setNiches(list || []);
        }
      } catch (err) {
        console.error('Failed to load niches in BulkImportModal', err);
      }
    }

    if (isOpen) {
      loadNiches();
      if (initialNicheId) {
        setSelectedNicheId(initialNicheId);
      }
      setErrorMsg('');
      setSuccessCount(null);
    }
  }, [user, isOpen, initialNicheId]);

  // Run parser whenever rawText changes
  useEffect(() => {
    if (!rawText.trim()) {
      setParsedLeads([]);
      return;
    }
    const results = parseBulkRawContacts(rawText);
    setParsedLeads(results);
  }, [rawText]);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    setParsedLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, selected: !lead.selected } : lead
      )
    );
  };

  const handleSelectAll = (select: boolean) => {
    setParsedLeads((prev) => prev.map((lead) => ({ ...lead, selected: select })));
  };

  const handleUpdateField = (id: string, field: keyof ParsedLead, value: any) => {
    setParsedLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, [field]: value } : lead))
    );
  };

  const handleRemoveLead = (id: string) => {
    setParsedLeads((prev) => prev.filter((lead) => lead.id !== id));
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_CAKE_LEADS);
  };

  const handleClear = () => {
    setRawText('');
    setParsedLeads([]);
    setErrorMsg('');
  };

  const selectedCount = parsedLeads.filter((l) => l.selected).length;
  const avgScore =
    parsedLeads.length > 0
      ? Math.round(
          parsedLeads.reduce((acc, l) => acc + (l.lead_score || 50), 0) /
            parsedLeads.length
        )
      : 0;

  const handleSaveImport = async () => {
    if (!user) return;
    const leadsToImport = parsedLeads.filter((l) => l.selected);
    if (leadsToImport.length === 0) {
      setErrorMsg('Please select at least one lead to import.');
      return;
    }

    setImporting(true);
    setErrorMsg('');

    try {
      const token = await user.getIdToken();
      const payload = {
        leads: leadsToImport.map((l) => ({
          name: l.name,
          email: l.email,
          phone: l.phone,
          company: l.company,
          deal_value: l.deal_value,
          lead_score: l.lead_score,
          source: l.source || 'Bulk Raw Import',
          status: l.status || 'new',
          pitch_notes: l.pitch_notes,
          niche_id: selectedNicheId || null,
          created_at: l.created_at ? new Date(l.created_at).toISOString() : new Date().toISOString(),
        })),
        niche_id: selectedNicheId || null,
        org_id: currentOrg?.id || null,
      };

      const res = await fetch('/api/contacts/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to import bulk leads');
      }

      setSuccessCount(data.count || leadsToImport.length);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data.count || leadsToImport.length);
        }
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Bulk import error:', err);
      setErrorMsg(err.message || 'Failed to save leads. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">dynamic_feed</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className="text-lg font-bold text-slate-900 tracking-tight"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Bulk Raw Lead Importer
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                  Multi-Lead Parser
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste unstructured text from Google Maps, WhatsApp, or scrapers. MYP automatically separates and parses each lead.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Success Banner */}
        {successCount !== null && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span>Successfully imported {successCount} leads into your CRM! Closing...</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-[18px] text-rose-600">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Content: 2-Column Responsive Layout */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Control Bar: Niche Selection + Quick Samples */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {/* Niche Target */}
            <div className="sm:col-span-5 space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-slate-500">category</span>
                <span>Assign Leads to Niche</span>
              </label>
              <select
                value={selectedNicheId}
                onChange={(e) => setSelectedNicheId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
              >
                <option value="">No Niche (General Pipeline)</option>
                {niches.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Actions */}
            <div className="sm:col-span-7 flex flex-wrap items-end justify-start sm:justify-end gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Paste example: Cake Shops (Artistra, Bake N Cake)"
              >
                <span className="material-symbols-outlined text-[15px] text-indigo-600">auto_awesome</span>
                <span>Load Cake Shops Sample</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={!rawText}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                <span>Clear Input</span>
              </button>
            </div>
          </div>

          {/* Raw Text Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-500">content_paste</span>
                Raw Bulk Leads Input
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Paste tabular spreadsheet rows (Google Sheets / Excel) or multi-line lead blocks
              </span>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Paste spreadsheet rows or multi-line blocks, for example:\n\n1. Tabbed rows (Excel / Sheets):\nBake N Cake by Sarah\t3423326743\twebsite but only contact info\t4.9(33)\nArtistra | Customized Cakes\t923242765621\tno website\t4.9(31)\n\n2. Multi-line blocks:\nArtistra | Customized Cakes\n923242765621\n4.9(31)`}
              rows={7}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all resize-y"
            />
          </div>

          {/* Staging & Parsed Results Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
              <div className="flex items-center gap-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">playlist_add_check</span>
                  Parsed Staging Leads ({parsedLeads.length})
                </h4>
                {parsedLeads.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                    Avg Score: {avgScore}%
                  </span>
                )}
              </div>

              {parsedLeads.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAll(true)}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(false)}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline"
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>

            {parsedLeads.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2 block">
                  manage_search
                </span>
                <p className="text-xs font-semibold text-slate-600">No leads parsed yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Type or paste raw leads above, or click &ldquo;Load Cake Shops Sample&rdquo; to see the multi-lead parser in action.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCount === parsedLeads.length && parsedLeads.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded-sm border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3">Lead Name</th>
                      <th className="py-3 px-3">Company / Niche</th>
                      <th className="py-3 px-3">Phone</th>
                      <th className="py-3 px-3">Deal Value ($)</th>
                      <th className="py-3 px-3">Lead Score</th>
                      <th className="py-3 px-3">Date / Age</th>
                      <th className="py-3 px-3">Notes & Source</th>
                      <th className="py-3 px-2 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className={`transition-colors hover:bg-slate-50/70 ${
                          lead.selected ? 'bg-indigo-50/20' : 'opacity-60 bg-slate-50/30'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={lead.selected}
                            onChange={() => handleToggleSelect(lead.id)}
                            className="rounded-sm border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Name */}
                        <td className="py-3 px-3 font-semibold text-slate-900 min-w-[140px]">
                          <input
                            type="text"
                            value={lead.name}
                            onChange={(e) => handleUpdateField(lead.id, 'name', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-hidden py-0.5 text-xs font-semibold text-slate-900"
                          />
                        </td>

                        {/* Company / Category */}
                        <td className="py-3 px-3 min-w-[140px]">
                          <input
                            type="text"
                            value={lead.company}
                            onChange={(e) => handleUpdateField(lead.id, 'company', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-hidden py-0.5 text-xs text-slate-700"
                          />
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-3 min-w-[130px]">
                          <input
                            type="text"
                            value={lead.phone}
                            onChange={(e) => handleUpdateField(lead.id, 'phone', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-hidden py-0.5 text-xs font-mono text-slate-700"
                          />
                        </td>

                        {/* Deal Value */}
                        <td className="py-3 px-3 w-24">
                          <input
                            type="number"
                            value={lead.deal_value || ''}
                            placeholder="0"
                            onChange={(e) =>
                              handleUpdateField(lead.id, 'deal_value', parseFloat(e.target.value) || 0)
                            }
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-hidden py-0.5 text-xs font-mono text-slate-700"
                          />
                        </td>

                        {/* Lead Score */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              lead.lead_score >= 80
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : lead.lead_score >= 60
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[11px]">
                              {lead.lead_score >= 80 ? 'star' : 'trending_up'}
                            </span>
                            {lead.lead_score}%
                          </span>
                        </td>

                        {/* Date & Calculated Age */}
                        <td className="py-3 px-3 min-w-[125px]">
                          <div className="space-y-1">
                            <input
                              type="date"
                              value={lead.created_at}
                              onChange={(e) => handleUpdateField(lead.id, 'created_at', e.target.value)}
                              className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-hidden py-0.5 text-[11px] font-mono text-slate-700"
                            />
                            {(() => {
                              const age = calculateLeadAge(lead.created_at);
                              return (
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-sm text-[9px] font-mono font-bold border ${age.badgeClasses}`}>
                                  <span>{age.badgeText}</span>
                                </span>
                              );
                            })()}
                          </div>
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                          <input
                            type="text"
                            value={lead.pitch_notes}
                            onChange={(e) =>
                              handleUpdateField(lead.id, 'pitch_notes', e.target.value)
                            }
                            placeholder="Notes..."
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-hidden py-0.5 text-[11px] text-slate-500"
                          />
                        </td>

                        {/* Remove */}
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLead(lead.id)}
                            className="w-6 h-6 rounded-md hover:bg-rose-50 text-slate-300 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Discard lead"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Ready to import <strong className="text-slate-900 font-bold">{selectedCount}</strong> of{' '}
            {parsedLeads.length} leads
            {selectedNicheId && niches.find((n) => n.id === selectedNicheId) && (
              <span>
                {' '}
                into <span className="font-semibold text-slate-900">{niches.find((n) => n.id === selectedNicheId)?.name}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={importing}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveImport}
              disabled={importing || selectedCount === 0}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Importing {selectedCount} Leads...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[17px]">cloud_upload</span>
                  <span>Import {selectedCount} Leads</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

