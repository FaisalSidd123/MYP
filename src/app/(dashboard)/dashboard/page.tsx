/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import AddContactModal from '@/components/AddContactModal';
import EditContactModal from '@/components/EditContactModal';
import AddNicheModal from '@/components/AddNicheModal';

interface DashboardStats {
  totalContacts: number;
  totalPipelineValue: number;
  activeDeals: number;
  wonDeals: number;
  conversionRate: number;
  schedulesToday: number;
  pendingTasks: number;
  completedTasks: number;
}

interface NicheSummary {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  target_deal_size: number;
  leadCount: number;
  pipelineValue: number;
  wonDeals: number;
  conversionRate: number;
}

interface LeadItem {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status: string;
  deal_value: number;
  niche_id?: string;
  niche_name?: string;
  created_at: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  start_time: string;
  type: string;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{
    stats: DashboardStats;
    niches: any[];
    nichesSummary: NicheSummary[];
    recentLeads: LeadItem[];
    upcomingSchedules: ScheduleItem[];
    recentActivity: TaskItem[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedNicheId, setSelectedNicheId] = useState<string>('all');
  
  // Modals state
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [prefilledNicheId, setPrefilledNicheId] = useState<string>('');
  const [isAddNicheModalOpen, setIsAddNicheModalOpen] = useState(false);
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);

  const fetchDashboardData = useCallback(async (nicheId?: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const targetNiche = nicheId !== undefined ? nicheId : selectedNicheId;
      const url = targetNiche && targetNiche !== 'all'
        ? `/api/dashboard/stats?niche_id=${targetNiche}`
        : `/api/dashboard/stats`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedNicheId]);

  useEffect(() => {
    fetchDashboardData(selectedNicheId);
  }, [selectedNicheId, fetchDashboardData]);

  const handleSelectNiche = (nicheId: string) => {
    setSelectedNicheId(nicheId);
  };

  const handleOpenAddLeadForNiche = (nicheId?: string) => {
    setPrefilledNicheId(nicheId && nicheId !== 'all' ? nicheId : '');
    setIsAddLeadModalOpen(true);
  };

  const handleEditLead = (lead: LeadItem) => {
    setSelectedContact(lead);
    setIsEditContactModalOpen(true);
  };

  const handleUpdateContact = async (updatedContact: any) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedContact),
      });
      if (res.ok) {
        setIsEditContactModalOpen(false);
        setSelectedContact(null);
        fetchDashboardData(selectedNicheId);
      }
    } catch (err) {
      console.error('Failed to update contact', err);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'negotiation':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'contacted':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  const getNicheColorStyles = (color?: string) => {
    switch (color) {
      case 'emerald':
        return { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-500' };
      case 'blue':
        return { badge: 'bg-blue-50 text-blue-800 border-blue-200', text: 'text-blue-700', bg: 'bg-blue-500' };
      case 'amber':
        return { badge: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-700', bg: 'bg-amber-500' };
      case 'rose':
        return { badge: 'bg-rose-50 text-rose-800 border-rose-200', text: 'text-rose-700', bg: 'bg-rose-500' };
      case 'violet':
        return { badge: 'bg-violet-50 text-violet-800 border-violet-200', text: 'text-violet-700', bg: 'bg-violet-500' };
      case 'cyan':
        return { badge: 'bg-cyan-50 text-cyan-800 border-cyan-200', text: 'text-cyan-700', bg: 'bg-cyan-500' };
      case 'orange':
        return { badge: 'bg-orange-50 text-orange-800 border-orange-200', text: 'text-orange-700', bg: 'bg-orange-500' };
      default:
        return { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700', bg: 'bg-indigo-500' };
    }
  };

  const activeNicheObj = data?.niches?.find((n: any) => n.id === selectedNicheId);

  return (
    <div className="space-y-8">
      {/* Modals */}
      <AddContactModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onSuccess={() => fetchDashboardData(selectedNicheId)}
        initialNicheId={prefilledNicheId}
      />
      <AddNicheModal
        isOpen={isAddNicheModalOpen}
        onClose={() => setIsAddNicheModalOpen(false)}
        onSuccess={() => fetchDashboardData(selectedNicheId)}
      />
      <EditContactModal
        isOpen={isEditContactModalOpen}
        onClose={() => {
          setIsEditContactModalOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onSave={handleUpdateContact}
      />

      {/* Top Welcome Bar + Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
              {selectedNicheId === 'all' 
                ? `Morning, ${user?.displayName ? user.displayName.split(' ')[0] : 'Faisal'}.` 
                : `${activeNicheObj?.name || 'Niche'} Pipeline`}
            </h2>
            {selectedNicheId !== 'all' && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
                FILTERED
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {selectedNicheId === 'all'
              ? 'Complete overview across all client verticals, lead pipelines, and conversions.'
              : `Tracking leads, valuations, and conversion rate for ${activeNicheObj?.name}.`}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsAddNicheModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px] text-slate-500">category</span>
            <span>+ New Niche</span>
          </button>
          <button
            onClick={() => handleOpenAddLeadForNiche(selectedNicheId)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Add Lead / Contact</span>
          </button>
        </div>
      </div>

      {/* Niche Segment Selector (Horizontal Filter Bar) */}
      <div className="bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 min-w-max">
            {/* All Niches Pill */}
            <button
              onClick={() => handleSelectNiche('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                selectedNicheId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">dashboard_customize</span>
              <span>All Niches (Overall)</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                selectedNicheId === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {data?.nichesSummary?.reduce((acc, curr) => acc + curr.leadCount, 0) || data?.stats?.totalContacts || 0}
              </span>
            </button>

            {/* Individual Niche Pills */}
            {data?.nichesSummary && data.nichesSummary.map(niche => {
              const isSelected = selectedNicheId === niche.id;
              const colorInfo = getNicheColorStyles(niche.color);

              return (
                <button
                  key={niche.id}
                  onClick={() => handleSelectNiche(niche.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${colorInfo.bg}`} />
                  <span className="truncate max-w-[140px]">{niche.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {niche.leadCount}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center pl-2 border-l border-slate-100 min-w-max">
            <Link
              href="/niches"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <span>Manage Niches</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards (Dynamic: Overall or Specific Niche) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Leads */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              <span>{selectedNicheId === 'all' ? 'OVERALL' : 'NICHE'}</span>
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            {selectedNicheId === 'all' ? 'Total Leads / Contacts' : `${activeNicheObj?.name || 'Niche'} Leads`}
          </h3>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {loading ? '...' : (data?.stats?.totalContacts ?? 0)}
          </p>
        </div>

        {/* Card 2: Pipeline Valuation */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
              PIPELINE
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            {selectedNicheId === 'all' ? 'Total Pipeline Value' : `${activeNicheObj?.name || 'Niche'} Value`}
          </h3>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {loading ? '...' : formatCurrency(data?.stats?.totalPipelineValue ?? 0)}
          </p>
        </div>

        {/* Card 3: Active In-Negotiation */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">handshake</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
              ACTIVE
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">In Negotiation</h3>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {loading ? '...' : (data?.stats?.activeDeals ?? 0)}
          </p>
        </div>

        {/* Card 4: Conversion Rate & Deals Won */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
              {data?.stats?.wonDeals ?? 0} WON
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Conversion Rate</h3>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {loading ? '...' : `${data?.stats?.conversionRate ?? 0}%`}
          </p>
        </div>

      </div>

      {/* Categorized Niche Verticals Performance Section (Shown prominently when in Overall Mode) */}
      {selectedNicheId === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
                Niche Verticals Performance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of leads, revenue potential, and conversion efficiency by individual niche.
              </p>
            </div>
            <button
              onClick={() => setIsAddNicheModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Niche</span>
            </button>
          </div>

          {data?.nichesSummary && data.nichesSummary.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.nichesSummary.map(niche => {
                const colorInfo = getNicheColorStyles(niche.color);

                return (
                  <div
                    key={niche.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Niche Card Top */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl ${colorInfo.badge} flex items-center justify-center shadow-xs`}>
                            <span className="material-symbols-outlined text-[20px]">{niche.icon || 'category'}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight">{niche.name}</h4>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Avg Deal: {formatCurrency(niche.target_deal_size || 0)}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${colorInfo.badge}`}>
                          {niche.conversionRate}% WIN
                        </span>
                      </div>

                      {niche.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                          {niche.description}
                        </p>
                      )}

                      {/* Niche Numerical Counters */}
                      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Leads</span>
                          <span className="text-base font-extrabold text-slate-900">{niche.leadCount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Pipeline Value</span>
                          <span className="text-base font-extrabold text-slate-900">{formatCurrency(niche.pipelineValue)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        href={`/niches/${niche.id}`}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors"
                      >
                        <span>Open Workspace</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                      <button
                        onClick={() => handleOpenAddLeadForNiche(niche.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px]">add</span>
                        <span>Add Lead</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">category</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Niches Created Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Create market verticals like &quot;Real Estate&quot;, &quot;SaaS Startups&quot;, or &quot;Clinics&quot; to organize leads and measure conversion rates.
              </p>
              <button
                onClick={() => setIsAddNicheModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
              >
                + Create Your First Niche
              </button>
            </div>
          )}
        </div>
      )}

      {/* Leads Stream Section (Filtered by Niche or Overall) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
              {selectedNicheId === 'all' ? 'Latest Leads & Contacts' : `${activeNicheObj?.name || 'Niche'} Leads`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct pipeline status, valuations, and client records
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/contacts"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Full Contacts Directory →
            </Link>
          </div>
        </div>

        {data?.recentLeads && data.recentLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.recentLeads.map(lead => (
              <div
                key={lead.id}
                className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                        {lead.name ? lead.name.slice(0, 2).toUpperCase() : 'LD'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{lead.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{lead.company || 'Direct Contact'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEditLead(lead)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit Lead"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </div>

                  {/* Niche & Deal Value tags */}
                  <div className="flex items-center gap-2 mb-3">
                    {lead.niche_name ? (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold font-mono">
                        {lead.niche_name}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-mono">
                        General
                      </span>
                    )}

                    <span className="text-xs font-extrabold text-slate-900 font-mono ml-auto">
                      {formatCurrency(lead.deal_value || 0)}
                    </span>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    {lead.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">mail</span>
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">phone</span>
                        <span>{lead.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Status */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold uppercase border ${getStatusBadge(lead.status)}`}>
                    {lead.status || 'new'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">person_off</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {selectedNicheId === 'all' ? 'No Leads in Pipeline' : `No Leads in ${activeNicheObj?.name || 'this niche'}`}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add a lead to start tracking deals and stages.
            </p>
            <button
              onClick={() => handleOpenAddLeadForNiche(selectedNicheId)}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
            >
              + Add Lead
            </button>
          </div>
        )}
      </div>

      {/* Main Dashboard Split: Recent Tasks & Upcoming Schedule */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Recent Tasks (8 cols) */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
                Pipeline Actions & Tasks
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Chronological audit stream of client pipeline actions</p>
            </div>
            <Link href="/tasks" className="text-xs font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
              View All Tasks →
            </Link>
          </div>

          <div className="space-y-4">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity, idx) => (
                <div key={activity.id || idx} className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">fact_check</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{activity.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono uppercase font-medium shrink-0">
                        {activity.status}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-xs text-slate-600 line-clamp-1 mb-1.5">
                        {activity.description}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No recent task activity recorded.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Schedule (4 cols) */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
                Upcoming Schedule
              </h3>
              <Link href="/schedule" className="text-xs font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                Calendar →
              </Link>
            </div>

            <div className="space-y-3">
              {data?.upcomingSchedules && data.upcomingSchedules.length > 0 ? (
                data.upcomingSchedules.map((schedule, idx) => (
                  <div key={schedule.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{schedule.title}</span>
                      <span className="text-[10px] text-indigo-700 font-semibold uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200">
                        {schedule.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {schedule.start_time ? new Date(schedule.start_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No upcoming meetings scheduled.
                </div>
              )}
            </div>
          </div>

          <Link
            href="/schedule"
            className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors block"
          >
            Open Full Calendar
          </Link>
        </div>

      </div>
    </div>
  );
}
