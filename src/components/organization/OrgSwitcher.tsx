"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useOrganization, Organization } from '@/context/OrganizationContext';

export default function OrgSwitcher() {
  const { organizations, currentOrg, switchOrganization, createOrganization, loading } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creatingLoading, setCreatingLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewOrgName('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getOrgIcon = (org?: Organization | null) => {
    if (!org) return 'business';
    const lower = org.name.toLowerCase();
    if (lower.includes('office') || lower.includes('corp') || lower.includes('company')) return 'domain';
    if (lower.includes('personal') || lower.includes('brand') || lower.includes('solo')) return 'rocket_launch';
    return 'workspaces';
  };

  const handleSelectOrg = (orgId: string) => {
    if (orgId === currentOrg?.id) {
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    switchOrganization(orgId);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setCreatingLoading(true);
    try {
      const created = await createOrganization(newOrgName.trim());
      if (created) {
        setIsCreating(false);
        setNewOrgName('');
        setIsOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingLoading(false);
    }
  };

  if (loading && !currentOrg) {
    return (
      <div className="mx-2 mb-4 p-2.5 rounded-2xl bg-slate-100 animate-pulse flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-slate-200" />
        <div className="h-3 w-24 bg-slate-200 rounded-sm" />
      </div>
    );
  }

  return (
    <div className="relative mx-1 mb-5" ref={dropdownRef}>
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-2xl border border-slate-200/90 bg-slate-50/80 hover:bg-slate-100/90 text-left transition-all cursor-pointer group shadow-2xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[17px]">
              {getOrgIcon(currentOrg)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight tracking-tight">
              {currentOrg ? currentOrg.name : 'Select Workspace'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              {currentOrg?.role || 'Active Org'}
            </p>
          </div>
        </div>

        <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-700 transition-colors shrink-0">
          unfold_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Organizations
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {organizations.length} workspaces
            </span>
          </div>

          {/* Org List */}
          <div className="space-y-0.5 max-h-52 overflow-y-auto">
            {organizations.map((org) => {
              const isSelected = currentOrg?.id === org.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSelectOrg(org.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[17px] ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {getOrgIcon(org)}
                    </span>
                    <span className="text-xs font-semibold truncate">
                      {org.name}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined text-[16px] text-emerald-400 shrink-0">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 pt-1" />

          {/* Create New Org Form or Trigger */}
          {isCreating ? (
            <form onSubmit={handleCreateSubmit} className="p-1 space-y-2">
              <input
                type="text"
                autoFocus
                placeholder="Workspace name..."
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
              <div className="flex items-center gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewOrgName('');
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingLoading || !newOrgName.trim()}
                  className="px-3 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {creatingLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50/70 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              <span>Create New Workspace</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
