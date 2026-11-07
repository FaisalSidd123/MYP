/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AddContactModal from '@/components/AddContactModal';
import EditContactModal from '@/components/EditContactModal';
import EditNicheModal from '@/components/EditNicheModal';
import BulkImportModal from '@/components/BulkImportModal';
import { calculateLeadAge } from '@/lib/leadAge';

interface NicheDetail {
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
}

export default function NicheDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const nicheId = params.id as string;

  const [niche, setNiche] = useState<NicheDetail | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'value' | 'score' | 'name'>('recent');

  // Modals
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isEditNicheModalOpen, setIsEditNicheModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<any>(null);

  // Status updating indicator
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNicheAndLeads = async () => {
    if (!user || !nicheId) return;
    setLoading(true);

    try {
      const token = await user.getIdToken();

      // 1. Fetch niches to get current niche meta
      const nicheRes = await fetch('/api/niches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (nicheRes.ok) {
        const nichesData = await nicheRes.json();
        const found = (nichesData || []).find((n: any) => n.id === nicheId);
        if (found) {
          setNiche(found);
        } else {
          // If not found by ID, might be newly created or invalid
          setNiche(null);
        }
      }

      // 2. Fetch leads belonging to this niche
      const contactsRes = await fetch(`/api/contacts?niche_id=${nicheId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setLeads(contactsData || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load niche details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNicheAndLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, nicheId]);

  // Handle inline quick status change
  const handleQuickStatusChange = async (leadId: string, newStatus: string) => {
    if (!user) return;
    setUpdatingLeadId(leadId);

    try {
      const token = await user.getIdToken();
      const currentLead = leads.find((l) => l.id === leadId);
      if (!currentLead) return;

      const res = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...currentLead,
          status: newStatus
        })
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
        showToast(`Lead status updated to ${newStatus.toUpperCase()}`);
        // Refresh niche stats
        const token2 = await user.getIdToken();
        const nicheRes = await fetch('/api/niches', {
          headers: { 'Authorization': `Bearer ${token2}` }
        });
        if (nicheRes.ok) {
          const nichesData = await nicheRes.json();
          const found = (nichesData || []).find((n: any) => n.id === nicheId);
          if (found) setNiche(found);
        }
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while updating status', 'error');
    } finally {
      setUpdatingLeadId(null);
    }
  };

  // Handle full lead update from modal
  const handleUpdateLead = async (updatedContact: any) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...updatedContact
        })
      });
      if (res.ok) {
        setIsEditLeadModalOpen(false);
        setSelectedLeadForEdit(null);
        showToast('Lead details updated');
        fetchNicheAndLeads();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update lead', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while updating lead', 'error');
    }
  };

  // Handle lead deletion
  const handleDeleteLead = async (leadId: string, leadName: string) => {
    if (!user || !confirm(`Are you sure you want to delete lead "${leadName}"?`)) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/contacts?id=${leadId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        showToast('Lead deleted successfully');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to delete lead', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while deleting lead', 'error');
    }
  };

  // Handle Niche Deletion
  const handleDeleteNiche = async () => {
    if (!niche || !user) return;
    if (!confirm(`Are you sure you want to delete the entire "${niche.name}" niche? Leads will remain but will become unassigned.`)) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/niches?id=${niche.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        router.push('/niches');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to delete niche', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete niche', 'error');
    }
  };

  // Color mappings
  const getColorStyles = (color?: string) => {
    switch (color) {
      case 'emerald':
        return { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
      case 'blue':
        return { badge: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500' };
      case 'amber':
        return { badge: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
      case 'rose':
        return { badge: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' };
      case 'violet':
        return { badge: 'bg-violet-50 text-violet-800 border-violet-200', dot: 'bg-violet-500' };
      case 'cyan':
        return { badge: 'bg-cyan-50 text-cyan-800 border-cyan-200', dot: 'bg-cyan-500' };
      case 'orange':
        return { badge: 'bg-orange-50 text-orange-800 border-orange-200', dot: 'bg-orange-500' };
      default:
        return { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' };
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Computed metrics
  const totalPipeline = useMemo(() => {
    return leads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
  }, [leads]);

  const wonLeadsCount = useMemo(() => {
    return leads.filter((l) => ['approved', 'completed', 'won'].includes(l.status?.toLowerCase())).length;
  }, [leads]);

  const conversionRate = useMemo(() => {
    return leads.length > 0 ? Math.round((wonLeadsCount / leads.length) * 100) : 0;
  }, [leads.length, wonLeadsCount]);

  const averageScore = useMemo(() => {
    if (leads.length === 0) return 0;
    const total = leads.reduce((sum, l) => sum + (Number(l.lead_score) || 50), 0);
    return Math.round(total / leads.length);
  }, [leads]);

  const stageCounts = useMemo(() => {
    return {
      all: leads.length,
      new: leads.filter((l) => l.status?.toLowerCase() === 'new').length,
      contacted: leads.filter((l) => l.status?.toLowerCase() === 'contacted').length,
      negotiation: leads.filter((l) => l.status?.toLowerCase() === 'negotiation').length,
      won: wonLeadsCount,
      inactive: leads.filter((l) => ['inactive', 'lost'].includes(l.status?.toLowerCase())).length,
    };
  }, [leads, wonLeadsCount]);

  const ageStats = useMemo(() => {
    if (leads.length === 0) return { avgDaysOld: 0, fresh: 0, active: 0, aging: 0, stale: 0 };
    const ages = leads.map((l) => calculateLeadAge(l.created_at));
    const avgDaysOld = Math.round(ages.reduce((sum, a) => sum + a.daysOld, 0) / leads.length);
    return {
      avgDaysOld,
      fresh: ages.filter((a) => a.status === 'fresh').length,
      active: ages.filter((a) => a.status === 'active').length,
      aging: ages.filter((a) => a.status === 'aging').length,
      stale: ages.filter((a) => a.status === 'stale').length,
    };
  }, [leads]);

  // Filtered and Sorted Leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Status filter
        if (statusFilter === 'all') return true;
        if (statusFilter === 'won') {
          return ['approved', 'completed', 'won'].includes(lead.status?.toLowerCase());
        }
        if (statusFilter === 'inactive') {
          return ['inactive', 'lost'].includes(lead.status?.toLowerCase());
        }
        return lead.status?.toLowerCase() === statusFilter;
      })
      .filter((lead) => {
        // Search filter
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          lead.name?.toLowerCase().includes(q) ||
          lead.company?.toLowerCase().includes(q) ||
          lead.email?.toLowerCase().includes(q) ||
          lead.phone?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        if (sortBy === 'value') return (Number(b.deal_value) || 0) - (Number(a.deal_value) || 0);
        if (sortBy === 'score') return (Number(b.lead_score) || 0) - (Number(a.lead_score) || 0);
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [leads, statusFilter, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-500 font-medium">
        <span className="material-symbols-outlined text-3xl animate-spin mb-2">refresh</span>
        <p className="text-xs uppercase tracking-wider font-mono">Loading Niche Workspace...</p>
      </div>
    );
  }

  if (!niche) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8 max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">category</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Niche Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          This niche vertical does not exist or may have been deleted.
        </p>
        <Link
          href="/niches"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to All Niches</span>
        </Link>
      </div>
    );
  }

  const colorStyles = getColorStyles(niche.color);

  return (
    <div className="space-y-7 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}>
            <span className="material-symbols-outlined text-[16px]">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={(count) => {
          fetchNicheAndLeads();
          showToast(`Imported ${count} leads into ${niche.name}!`);
        }}
        initialNicheId={niche.id}
      />

      <AddContactModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onSuccess={fetchNicheAndLeads}
        initialNicheId={niche.id}
      />

      <EditNicheModal
        isOpen={isEditNicheModalOpen}
        onClose={() => setIsEditNicheModalOpen(false)}
        niche={niche}
        onSuccess={(updated) => {
          setNiche(updated);
          showToast('Niche configuration updated');
        }}
      />

      <EditContactModal
        isOpen={isEditLeadModalOpen}
        onClose={() => {
          setIsEditLeadModalOpen(false);
          setSelectedLeadForEdit(null);
        }}
        contact={selectedLeadForEdit}
        onSave={handleUpdateLead}
      />

      {/* Top Breadcrumb & Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link
              href="/niches"
              className="hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>All Niches</span>
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">{niche.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl ${colorStyles.badge} flex items-center justify-center shadow-xs shrink-0`}>
              <span className="material-symbols-outlined text-[24px]">{niche.icon || 'category'}</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
                {niche.name} Workspace
              </h1>
              {niche.description && (
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                  {niche.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setIsEditNicheModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Edit Niche</span>
          </button>

          <button
            onClick={handleDeleteNiche}
            className="p-2 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            title="Delete this Niche"
          >
            <span className="material-symbols-outlined text-[17px]">delete</span>
          </button>

          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">dynamic_feed</span>
            <span>Bulk Raw Import</span>
          </button>

          <button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">person_add</span>
            <span>Add Lead to {niche.name}</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Cards Scoped to This Niche */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Leads */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">TOTAL LEADS</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{leads.length}</span>
            <span className="text-xs text-slate-400 font-mono font-medium">({wonLeadsCount} won)</span>
          </div>
        </div>

        {/* Total Pipeline */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">PIPELINE VALUE</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-1">
            {formatCurrency(totalPipeline)}
          </p>
        </div>

        {/* Target Benchmark */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">TARGET BENCHMARK</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700 font-mono mt-1">
            {formatCurrency(niche.target_deal_size || 0)}
          </p>
        </div>

        {/* Win Rate */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">WIN RATE</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">{conversionRate}%</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-semibold">
              {wonLeadsCount}/{leads.length}
            </span>
          </div>
        </div>

        {/* Lead Quality Score */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">AVG LEAD QUALITY</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{averageScore}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
        </div>
      </div>

      {/* Stage Filter Ribbon */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'all', label: 'All Leads', count: stageCounts.all },
          { id: 'new', label: 'New', count: stageCounts.new },
          { id: 'contacted', label: 'Contacted', count: stageCounts.contacted },
          { id: 'negotiation', label: 'Negotiation', count: stageCounts.negotiation },
          { id: 'won', label: 'Won / Approved', count: stageCounts.won },
          { id: 'inactive', label: 'Inactive', count: stageCounts.inactive },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            placeholder={`Search ${leads.length} leads in ${niche.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="recent">Most Recent (Newest Date)</option>
            <option value="oldest">Oldest Leads (Longest Waiting)</option>
            <option value="value">Highest Deal Value</option>
            <option value="score">Lead Quality Score</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Pipeline Lead Age Analysis Banner */}
      {leads.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 px-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-500">history</span>
            <span className="font-bold text-slate-900">Pipeline Lead Age Analysis:</span>
            <span className="text-slate-600">
              Average lead age is <strong className="text-slate-900 font-bold font-mono">{ageStats.avgDaysOld} days</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              {ageStats.fresh} Fresh (≤3d)
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold">
              {ageStats.active} Active (4-14d)
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
              {ageStats.aging} Aging (15-30d)
            </span>
            {ageStats.stale > 0 && (
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>{ageStats.stale} Stale (&gt;30d)</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Leads Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">person_search</span>
            </div>
            <h3 className="font-bold text-sm text-slate-800">
              {leads.length === 0 ? `No leads in ${niche.name} yet` : 'No matching leads found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {leads.length === 0
                ? `Start by adding your first lead to ${niche.name} to track pipeline value and stage conversion.`
                : 'Try adjusting your search query or stage filters to find what you are looking for.'}
            </p>
            {leads.length === 0 && (
              <button
                onClick={() => setIsAddLeadModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add First Lead to {niche.name}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  <th className="py-3 px-5">Lead / Contact</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Deal Value</th>
                  <th className="py-3 px-4">Quality Score</th>
                  <th className="py-3 px-4">Date Added & Age</th>
                  <th className="py-3 px-4">Stage / Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLeads.map((lead) => {
                  const score = Number(lead.lead_score) || 50;
                  const dealVal = Number(lead.deal_value) || 0;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name & Company */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                            {lead.name ? lead.name.slice(0, 2).toUpperCase() : 'LE'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {lead.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {lead.company || lead.source || 'Direct Prospect'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-slate-700 hover:text-slate-900 hover:underline block truncate max-w-[180px]"
                            title={lead.email}
                          >
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-slate-400 hover:text-slate-600 block mt-0.5"
                          >
                            {lead.phone}
                          </a>
                        )}
                      </td>

                      {/* Deal Value */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {dealVal > 0 ? (
                          <span className="text-slate-900">
                            {formatCurrency(dealVal)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">$0</span>
                        )}
                      </td>

                      {/* Lead Score Indicator */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                              score >= 75
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : score >= 50
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {score} / 100
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {score >= 75 ? 'Hot' : score >= 50 ? 'Warm' : 'Cool'}
                          </span>
                        </div>
                      </td>

                      {/* Date Added & Lead Age in Days */}
                      <td className="py-3.5 px-4">
                        {(() => {
                          const age = calculateLeadAge(lead.created_at);
                          return (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800 font-semibold">
                                <span className="material-symbols-outlined text-[13px] text-slate-400">calendar_today</span>
                                <span>{age.formattedDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${age.badgeClasses}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${age.dotColor}`} />
                                  <span>{age.badgeText}</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">({age.label})</span>
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Inline Quick Stage Selector */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <select
                            value={lead.status?.toLowerCase() || 'new'}
                            disabled={updatingLeadId === lead.id}
                            onChange={(e) => handleQuickStatusChange(lead.id, e.target.value)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border focus:outline-none transition-all cursor-pointer font-mono ${
                              ['approved', 'completed', 'won'].includes(lead.status?.toLowerCase())
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : lead.status?.toLowerCase() === 'negotiation'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                                : lead.status?.toLowerCase() === 'contacted'
                                ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                                : lead.status?.toLowerCase() === 'inactive'
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            <option value="new">NEW</option>
                            <option value="contacted">CONTACTED</option>
                            <option value="negotiation">NEGOTIATION</option>
                            <option value="approved">WON / APPROVED</option>
                            <option value="inactive">INACTIVE</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeadForEdit(lead);
                              setIsEditLeadModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Lead Details"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(lead.id, lead.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Lead"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
