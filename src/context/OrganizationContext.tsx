"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  role?: string;
  created_at?: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  loading: boolean;
  setCurrentOrg: (org: Organization) => void;
  switchOrganization: (orgId: string) => void;
  refreshOrganizations: () => Promise<void>;
  createOrganization: (name: string) => Promise<Organization | null>;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizations: [],
  currentOrg: null,
  loading: true,
  setCurrentOrg: () => {},
  switchOrganization: () => {},
  refreshOrganizations: async () => {},
  createOrganization: async () => null,
});

const ACTIVE_ORG_STORAGE_KEY = 'myp_active_org_id';

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
      if (storedId) {
        return {
          id: storedId,
          name: storedId.toLowerCase().includes('personal') ? 'Personal Brand' : 'Office Sales',
          slug: storedId.toLowerCase().includes('personal') ? 'personal-brand' : 'office-sales',
          role: 'owner',
        };
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Set current organization and persist to localStorage
  const setCurrentOrg = useCallback((org: Organization) => {
    setCurrentOrgState(org);
    if (typeof window !== 'undefined' && org?.id) {
      localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, org.id);
      window.dispatchEvent(new CustomEvent('myp-org-changed', { detail: { orgId: org.id } }));
    }
  }, []);

  const switchOrganization = useCallback((orgId: string) => {
    const found = organizations.find((o) => o.id === orgId);
    if (found) {
      setCurrentOrgState(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, found.id);
        window.location.reload();
      }
    }
  }, [organizations]);

  const fetchOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrgState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await fetch('/api/organizations', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const orgs: Organization[] = await res.json();
        setOrganizations(orgs);

        if (orgs.length > 0) {
          const storedOrgId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_ORG_STORAGE_KEY) : null;
          const matched = orgs.find((o) => o.id === storedOrgId);
          const active = matched || orgs[0];
          setCurrentOrg(active);
        }
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  }, [user, setCurrentOrg]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const createOrganization = async (name: string): Promise<Organization | null> => {
    if (!user || !name.trim()) return null;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        const newOrg = await res.json();
        setOrganizations((prev) => [...prev, newOrg]);
        setCurrentOrg(newOrg);
        return newOrg;
      }
      return null;
    } catch (err) {
      console.error('Failed to create organization:', err);
      return null;
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrg,
        loading,
        setCurrentOrg,
        switchOrganization,
        refreshOrganizations: fetchOrganizations,
        createOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
