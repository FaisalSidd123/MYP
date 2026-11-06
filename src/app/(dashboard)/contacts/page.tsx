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
  const [filterStatus, setFilterStatus] = useState<string>('all');
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
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-emerald-500';
      case 'contacted':
      case 'negotiation':
        return 'bg-amber-500';
      default:
        return 'bg-indigo-500';
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (filterStatus === 'all') return true;
    return c.status?.toLowerCase() === filterStatus;
  });

  return (
    <div className="space-y-8">
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

      {/* Page Header (No duplicate TopNavBar) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
            Contacts
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your network, clients, and deal pipeline in one clean view.
          </p>
        </div>
        <button
          onClick={() => setContactModalOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filters and Counters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1.5">
          {['all', 'active', 'prospect', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filterStatus === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 px-3">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">TOTAL CONTACTS</span>
            <span className="text-lg font-extrabold text-slate-900 font-mono leading-none">{loading ? '-' : contacts.length}</span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">CONVERSION</span>
            <span className="text-lg font-extrabold text-slate-900 font-mono leading-none">24.8%</span>
          </div>
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
            <p className="font-bold text-sm text-slate-900">No Contacts Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your first contact above or parse messy text notes from the landing page.
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
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {contact.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">{contact.name}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{contact.company || 'Independent Contact'}</p>
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

                <div className="space-y-2 mb-4 text-xs">
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
