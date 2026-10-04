'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Organization, Role, UserSession } from '@agentflow/types';
import { apiClient, ApiError } from '../lib/api';

interface AuthContextType {
  user: User | null;
  currentOrg: Organization | null;
  role: Role | null;
  organizations: Array<{ organization: Organization; role: Role }>;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, organizationName: string) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [organizations, setOrganizations] = useState<Array<{ organization: Organization; role: Role }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = pathname === '/login' || pathname === '/register';

  const refreshSession = async () => {
    try {
      const token = localStorage.getItem('agentflow_token');
      if (!token) {
        setUser(null);
        setCurrentOrg(null);
        setIsLoading(false);
        return;
      }

      const activeOrgId = localStorage.getItem('agentflow_active_org_id') || undefined;
      const session: UserSession = await apiClient('/auth/me', { orgId: activeOrgId });

      setUser(session.user);
      setCurrentOrg(session.currentOrganization);
      setRole(session.role);
      setOrganizations(session.organizations);

      if (session.currentOrganization) {
        localStorage.setItem('agentflow_active_org_id', session.currentOrganization.id);
      }
    } catch (err) {
      console.warn('Session refresh error:', err);
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_active_org_id');
      setUser(null);
      setCurrentOrg(null);
      setRole(null);
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient<{
        tokens: { accessToken: string };
        user: User;
        currentOrganization: Organization | null;
        role: Role | null;
        organizations: Array<{ organization: Organization; role: Role }>;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('agentflow_token', res.tokens.accessToken);
      setUser(res.user);
      setCurrentOrg(res.currentOrganization);
      setRole(res.role);
      setOrganizations(res.organizations);

      if (res.currentOrganization) {
        localStorage.setItem('agentflow_active_org_id', res.currentOrganization.id);
      }

      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, organizationName: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient<{
        tokens: { accessToken: string };
        user: User;
        currentOrganization: Organization;
        role: Role;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, organizationName }),
      });

      localStorage.setItem('agentflow_token', res.tokens.accessToken);
      setUser(res.user);
      setCurrentOrg(res.currentOrganization);
      setRole(res.role);
      setOrganizations([{ organization: res.currentOrganization, role: res.role }]);
      localStorage.setItem('agentflow_active_org_id', res.currentOrganization.id);

      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('agentflow_token');
    localStorage.removeItem('agentflow_active_org_id');
    setUser(null);
    setCurrentOrg(null);
    setRole(null);
    setOrganizations([]);
    router.push('/login');
  };

  const switchOrganization = (orgId: string) => {
    const found = organizations.find((o) => o.organization.id === orgId);
    if (found) {
      setCurrentOrg(found.organization);
      setRole(found.role);
      localStorage.setItem('agentflow_active_org_id', found.organization.id);
      window.location.reload(); // Reload to refresh all org-scoped data
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentOrg,
        role,
        organizations,
        isLoading,
        login,
        register,
        logout,
        switchOrganization,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
