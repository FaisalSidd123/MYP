/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import AddNicheModal from '@/components/AddNicheModal';
import AddContactModal from '@/components/AddContactModal';

interface NicheItem {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  target_deal_size: number;
  totalLeads: number;
  totalValue: number;
  converted: number;
  conversionRate: number;
  created_at: string;
}

export default function NichesPage() {
  const { user } = useAuth();
  const [niches, setNiches] = useState<NicheItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddNicheModalOpen, setIsAddNicheModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [selectedNicheForLead, setSelectedNicheForLead] = useState<string>('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchNiches = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/niches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNiches(data || []);
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to load niches', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNiche = async (nicheId: string, nicheName: string) => {
    if (!user || !confirm(`Are you sure you want to delete the "${nicheName}" niche? Leads assigned to it will become unassigned.`)) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/niches?id=${nicheId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showToastMessage('Niche deleted successfully', 'success');
        fetchNiches();
      } else {
        const err = await res.json();
        showToastMessage(err.error || 'Failed to delete niche', 'error');
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to delete niche', 'error');
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  useEffect(() => {
    fetchNiches();
  }, [user]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getNicheColorStyles = (color?: string) => {
    switch (color) {
      case 'emerald':
        return { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', bg: 'bg-emerald-500' };
      case 'blue':
        return { badge: 'bg-blue-50 text-blue-800 border-blue-200', bg: 'bg-blue-500' };
      case 'amber':
        return { badge: 'bg-amber-50 text-amber-800 border-amber-200', bg: 'bg-amber-500' };
      case 'rose':
        return { badge: 'bg-rose-50 text-rose-800 border-rose-200', bg: 'bg-rose-500' };
      case 'violet':
        return { badge: 'bg-violet-50 text-violet-800 border-violet-200', bg: 'bg-violet-500' };
      case 'cyan':
        return { badge: 'bg-cyan-50 text-cyan-800 border-cyan-200', bg: 'bg-cyan-500' };
      case 'orange':
        return { badge: 'bg-orange-50 text-orange-800 border-orange-200', bg: 'bg-orange-500' };
      default:
        return { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', bg: 'bg-indigo-500' };
    }
  };

  const totalNicheValue = niches.reduce((sum, n) => sum + (n.totalValue || 0), 0);
  const totalNicheLeads = niches.reduce((sum, n) => sum + (n.totalLeads || 0), 0);

  return (
    <div className="space-y-8">
      <AddNicheModal
        isOpen={isAddNicheModalOpen}
        onClose={() => setIsAddNicheModalOpen(false)}
        onSuccess={fetchNiches}
      />
      <AddContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        onSuccess={fetchNiches}
        initialNicheId={selectedNicheForLead}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className={`px-5 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            showToast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            <span className="material-symbols-outlined text-[16px]">
              {showToast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{showToast.message}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
            Niche Verticals & Segments
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Group leads into targeted industries, set valuation benchmarks, and measure segment performance.
          </p>
        </div>
        <button
          onClick={() => setIsAddNicheModalOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Create Niche</span>
        </button>
      </div>

      {/* Aggregate Niche Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">ACTIVE VERTICALS</span>
          <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{loading ? '-' : niches.length}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">TOTAL LEADS IN NICHES</span>
          <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{loading ? '-' : totalNicheLeads}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">CUMULATIVE PIPELINE</span>
          <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{loading ? '-' : formatCurrency(totalNicheValue)}</p>
        </div>
      </div>

      {/* Niches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <span className="material-symbols-outlined text-3xl animate-spin text-slate-600">refresh</span>
            <p className="mt-3 font-semibold text-xs uppercase tracking-wider text-slate-500 font-mono">Loading Niches...</p>
          </div>
        ) : niches.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-3xl">category</span>
            </div>
            <h3 className="font-bold text-base text-slate-900">No Niches Created Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start by creating target niches like &quot;Real Estate&quot;, &quot;SaaS&quot;, &quot;Healthcare&quot;, or &quot;Marketing Agencies&quot;.
            </p>
            <button
              onClick={() => setIsAddNicheModalOpen(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
            >
              + Create First Niche
            </button>
          </div>
        ) : (
          niches.map((niche) => {
            const colorInfo = getNicheColorStyles(niche.color);

            return (
              <div
                key={niche.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Link
                      href={`/niches/${niche.id}`}
                      className="flex items-center gap-3 hover:opacity-90 transition-opacity flex-1 min-w-0"
                    >
                      <div className={`w-11 h-11 rounded-xl ${colorInfo.badge} flex items-center justify-center shadow-xs shrink-0`}>
                        <span className="material-symbols-outlined text-[22px]">{niche.icon || 'category'}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 leading-tight hover:text-indigo-600 transition-colors truncate">
                          {niche.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Target: {formatCurrency(niche.target_deal_size || 0)}
                        </p>
                      </div>
                    </Link>

                    <button
                      onClick={() => handleDeleteNiche(niche.id, niche.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                      title="Delete Niche"
                    >
                      <span className="material-symbols-outlined text-[17px]">delete</span>
                    </button>
                  </div>

                  {niche.description && (
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-2">
                      {niche.description}
                    </p>
                  )}

                  {/* Niche Numerical Counters */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Leads</span>
                      <span className="text-sm font-extrabold text-slate-900">{niche.totalLeads}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pipeline</span>
                      <span className="text-sm font-extrabold text-slate-900">{formatCurrency(niche.totalValue)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Win Rate</span>
                      <span className="text-sm font-extrabold text-emerald-700">{niche.conversionRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/niches/${niche.id}`}
                    className="text-xs font-semibold text-slate-800 hover:text-slate-900 flex items-center gap-1.5 transition-colors group-hover:underline"
                  >
                    <span>Open Workspace & Leads</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedNicheForLead(niche.id);
                      setIsAddContactModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Add Lead</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

