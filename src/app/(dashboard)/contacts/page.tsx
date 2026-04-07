/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';
import AddContactModal from '@/components/AddContactModal';
import EditContactModal from '@/components/EditContactModal';
import { useAuth } from '@/context/AuthContext';

export default function ContactsPage() {
  const { user } = useAuth();
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-emerald-400';
      case 'contacted':
      case 'negotiation':
        return 'bg-amber-400';
      default:
        return 'bg-blue-400';
    }
  };

  return (
    <>
      <AddContactModal isOpen={isContactModalOpen} onClose={() => setContactModalOpen(false)} onSuccess={fetchContacts} />
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
          <div className={`px-6 py-3 rounded-xl shadow-lg backdrop-blur-md border ${showToast.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
            : 'bg-red-500/20 border-red-500/50 text-red-200'
            }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                {showToast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span className="text-sm font-medium">{showToast.message}</span>
            </div>
          </div>
        </div>
      )}

      <header className="docked full-width top-0 sticky z-40 bg-[#070d1f]/80 backdrop-blur-xl shadow-[0_20px_40px_-12px_rgba(7,31,31,0.5),0_0_15px_rgba(163,166,255,0.05)]">
        <div className="flex justify-between items-center w-full px-8 py-3">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input className="w-full bg-surface-container-lowest border-none rounded-xl py-2 pl-10 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 placeholder:text-on-surface-variant/50 transition-all" placeholder="Search contacts, notes, or tags..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-[#a5aac2] hover:bg-[#222b47] hover:text-[#dfe4fe] transition-all duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-[#a5aac2] hover:bg-[#222b47] hover:text-[#dfe4fe] transition-all duration-200">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant/20 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-surface">{user?.displayName || 'User'}</p>
                <p className="text-[10px] text-on-surface-variant">Admin Pool</p>
              </div>
              <img alt="User profile avatar" className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/20" src={user?.photoURL || 'https://via.placeholder.com/40'} />
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black text-on-surface tracking-tighter mb-2">Contacts</h2>
            <p className="text-on-surface-variant max-w-md">Manage your enterprise network and track lead lifecycles with nocturnal precision.</p>
          </div>
          <button
            onClick={() => setContactModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-dim text-on-primary-fixed px-6 py-3.5 rounded-xl font-bold tracking-tight shadow-[0_10px_20px_-5px_rgba(163,166,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            Add Contact
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <button className="px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold tracking-wider uppercase">All</button>
            <button className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors text-xs font-bold tracking-wider uppercase">Active</button>
            <button className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors text-xs font-bold tracking-wider uppercase">Prospect</button>
            <button className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors text-xs font-bold tracking-wider uppercase">Inactive</button>
          </div>
          <div className="flex items-center gap-8 text-on-surface-variant">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Total Leads</span>
              <span className="text-xl font-black text-on-surface tabular-nums">{loading ? '-' : contacts.length}</span>
            </div>
            <div className="w-[1px] h-8 bg-outline-variant/20"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Conversion</span>
              <span className="text-xl font-black text-on-surface tabular-nums">24.8%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-on-surface-variant/50">
              <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
              <p className="mt-4 font-bold text-sm tracking-widest uppercase">Syncing Database...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-on-surface-variant/50 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/20">
              <span className="material-symbols-outlined text-4xl mb-2 text-primary/40">group_off</span>
              <p className="font-bold text-sm uppercase tracking-widest">No Contacts Found</p>
              <p className="text-xs mt-1">Add your first connection to seed the network.</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="glass-card ghost-border p-6 rounded-2xl hover:bg-surface-bright transition-all duration-300 group relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-lg border border-white/5 shrink-0">
                    <span className="text-xl font-black text-on-surface">{contact.name?.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0 pr-12">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-on-surface leading-tight truncate">{contact.name}</h3>
                      {contact.source && (
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                          {contact.source}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant truncate">{contact.company || 'Independent Contact'}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary/60 text-base">mail</span>
                    <span className="truncate text-xs">{contact.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary/60 text-base">phone</span>
                    <span className="truncate text-xs">{contact.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container-lowest text-[10px] font-black uppercase tracking-widest text-on-surface">
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(contact.status)}`}></span>
                      {contact.status}
                    </div>
                    <span className="text-[10px] font-medium text-on-surface-variant/40">Created: {new Date(contact.created_at).toLocaleDateString()}</span>
                  </div>
                  {/* Pitch Themes */}
                  {(contact.pitch && contact.pitch.length > 0) && (
                    <div className="pt-3 border-t border-outline-variant/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Pitch Themes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {contact.pitch.map((p: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-[11px] font-semibold border border-outline-variant/5">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Pitch Notes */}
                  {contact.pitch_notes && (
                    <div className="mt-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/10 relative">
                      <div className="absolute -top-2 -left-1">
                        <div className="w-2 h-2 rounded-full bg-primary/20 blur-[2px]"></div>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[13px] text-primary/70">notes</span> Notes
                      </p>
                      <p className="text-xs text-on-surface/75 leading-relaxed line-clamp-3">
                        {contact.pitch_notes}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end pt-4 border-t border-outline-variant/10 shrink-0">
                  <button className="flex items-center gap-2 text-xs font-bold text-primary group-hover:underline">
                    <span className="material-symbols-outlined text-base">call</span> Quick Call
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="col-span-1 lg:col-span-3 mt-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-on-surface tracking-tight">Recent Activity Pulse</h3>
            <button className="text-xs font-bold text-primary tracking-widest uppercase">View Timeline</button>
          </div>
          <div className="relative space-y-0">
            <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-primary via-primary/20 to-transparent"></div>
            <div className="relative flex items-start gap-6 pb-10 group">
              <div className="relative z-10 w-14 h-14 rounded-full bg-surface-container-high border-4 border-surface flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">mail</span>
              </div>
              <div className="flex-1 pt-2">
                <p className="text-sm font-bold text-on-surface">Email Sent to <span className="text-primary">Elena Vance</span></p>
                <p className="text-xs text-on-surface-variant mb-3">Q3 Follow-up Strategy Documentation</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-lg border border-outline-variant/10 text-[10px] text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  Today at 10:45 AM
                </div>
              </div>
            </div>
            <div className="relative flex items-start gap-6 pb-10 group">
              <div className="relative z-10 w-14 h-14 rounded-full bg-surface-container-high border-4 border-surface flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary">group_add</span>
              </div>
              <div className="flex-1 pt-2">
                <p className="text-sm font-bold text-on-surface">New Lead Identified</p>
                <p className="text-xs text-on-surface-variant mb-3">Marcus Thorne joined the Aether Systems group</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-lg border border-outline-variant/10 text-[10px] text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  Yesterday at 4:20 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}