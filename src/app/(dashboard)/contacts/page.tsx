/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AddContactModal from '@/components/AddContactModal';
import EditContactModal from '@/components/EditContactModal';
import AddNicheModal from '@/components/AddNicheModal';
import BulkImportModal from '@/components/BulkImportModal';
import { useAuth } from '@/context/AuthContext';

export default function ContactsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isBulkImportOpen, setBulkImportOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isNicheModalOpen, setIsNicheModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [niches, setNiches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterNiche, setFilterNiche] = useState<string>(searchParams.get('niche_id') || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || searchParams.get('q') || '');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    const n = searchParams.get('niche_id');
    if (n !== null) setFilterNiche(n);
  }, [searchParams]);

  const fetchNiches = async () => {
    if (!user) return;
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
      console.error('Failed to fetch niches', err);
    }
  };

  const fetchContacts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data || []);
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to fetch contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!user || !confirm('Are you sure you want to delete this contact?')) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/contacts?id=${contactId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showToastMessage('Contact deleted successfully', 'success');
        fetchContacts();
      } else {
        const error = await res.json();
        showToastMessage(error.error || 'Failed to delete contact', 'error');
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to delete contact', 'error');
    }
  };

  const handleEditContact = (contact: any) => {
    setSelectedContact(contact);
    setEditModalOpen(true);
  };

  const handleUpdateContact = async (updatedContact: any) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...updatedContact
        }),
      });

      if (res.ok) {
        showToastMessage('Contact updated successfully', 'success');
        setEditModalOpen(false);
        setSelectedContact(null);
        fetchContacts();
      } else {
        const error = await res.json();
        showToastMessage(error.error || 'Failed to update contact', 'error');
      }
    } catch (err) {
      console.error(err);
      showToastMessage('Failed to update contact', 'error');
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  useEffect(() => {
    fetchContacts();
    fetchNiches();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-emerald-500';
      case 'negotiation':
        return 'bg-amber-500';
      case 'contacted':
        return 'bg-blue-500';
      default:
        return 'bg-indigo-500';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Combined Filtering: Status + Niche + Search Query
  const filteredContacts = contacts.filter((c) => {
    const matchesStatus = filterStatus === 'all' || c.status?.toLowerCase() === filterStatus;
    const matchesNiche = filterNiche === 'all' || c.niche_id === filterNiche || c.niche_name?.toLowerCase() === filterNiche.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      c.name?.toLowerCase().includes(query) ||
      c.company?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.niche_name?.toLowerCase().includes(query);

    return matchesStatus && matchesNiche && matchesSearch;
  });

  const totalPipelineVal = filteredContacts.reduce((sum, c) => sum + (Number(c.deal_value) || 0), 0);
  const wonCount = filteredContacts.filter(c => ['approved', 'completed'].includes(c.status?.toLowerCase())).length;
  const conversionRate = filteredContacts.length > 0 ? Math.round((wonCount / filteredContacts.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onSuccess={(count) => {
          fetchContacts();
          fetchNiches();
          showToastMessage(`Imported ${count} leads successfully!`, 'success');
        }}
        initialNicheId={filterNiche !== 'all' ? filterNiche : undefined}
      />
      <AddContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setContactModalOpen(false)} 
        onSuccess={() => {
          fetchContacts();
          fetchNiches();
        }} 
      />
      <AddNicheModal
        isOpen={isNicheModalOpen}
        onClose={() => setIsNicheModalOpen(false)}
        onSuccess={() => {
          fetchNiches();
          fetchContacts();
        }}
      />
      <EditContactModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onSave={handleUpdateContact}
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
            Contacts & Leads Directory
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track client relationships, segment by niche vertical, and monitor deal valuations.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setBulkImportOpen(true)}
            className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">dynamic_feed</span>
            <span>⚡ Bulk Raw Import</span>
          </button>
          <button
            onClick={() => setIsNicheModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-slate-500">category</span>
            <span>+ New Niche</span>
          </button>
          <button
            onClick={() => setContactModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search + Niche Selector + Status Tabs + Counters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search leads, companies, niches..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
            />
          </div>

          {/* Niche Selector Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 font-mono uppercase whitespace-nowrap">Niche:</span>
            <select
              value={filterNiche}
              onChange={e => setFilterNiche(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 font-medium w-full sm:w-48"
            >
              <option value="all">All Niches ({contacts.length})</option>
              {niches.map(n => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.totalLeads ?? 0})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-4 px-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">PIPELINE VALUE</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono leading-none">{formatCurrency(totalPipelineVal)}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">WIN RATE</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono leading-none">{conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Leads' },
              { id: 'new', label: 'New' },
              { id: 'contacted', label: 'Contacted' },
              { id: 'negotiation', label: 'Negotiation' },
              { id: 'approved', label: 'Approved' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all whitespace-nowrap ${
                  filterStatus === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
            Showing {filteredContacts.length} of {contacts.length}
          </span>
        </div>
      </div>

      {/* Contact Cards Grid / Empty State */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <span className="material-symbols-outlined text-3xl animate-spin text-slate-600">refresh</span>
            <p className="mt-3 font-semibold text-xs uppercase tracking-wider text-slate-500 font-mono">Syncing Database...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">group_off</span>
            </div>
            <p className="font-bold text-sm text-slate-900">No Leads Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || filterNiche !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your niche or status filter.'
                : 'Add your first contact or lead using the button above.'}
            </p>
            <button
              onClick={() => setContactModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
            >
              + Create Contact
            </button>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {contact.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">{contact.name}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{contact.company || 'Independent Lead'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Niche & Deal Value Ribbon */}
                <div className="flex items-center gap-2 mb-3">
                  {contact.niche_name ? (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold font-mono">
                      {contact.niche_name}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-mono">
                      General
                    </span>
                  )}

                  <span className="text-xs font-extrabold text-slate-900 font-mono ml-auto">
                    {formatCurrency(contact.deal_value || 0)}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                    <span className="truncate">{contact.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">phone</span>
                    <span className="truncate font-mono">{contact.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold uppercase">
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(contact.status)}`} />
                  <span>{contact.status || 'new'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
