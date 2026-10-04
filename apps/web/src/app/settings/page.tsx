'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { Users, Shield, Plus, Building2, Check, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Role } from '@agentflow/types';

export default function SettingsPage() {
  const { currentOrg, role, user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>(Role.VIEWER);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageMembers = role === Role.OWNER || role === Role.ADMIN;

  const fetchMembers = async () => {
    if (!currentOrg) return;
    try {
      const data = await apiClient(`/organizations/${currentOrg.id}/members`);
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentOrg]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !inviteEmail.trim()) return;

    setIsSubmitting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      await apiClient(`/organizations/${currentOrg.id}/members`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      setInviteSuccess(`Successfully added/updated role for ${inviteEmail}`);
      setInviteEmail('');
      await fetchMembers();
    } catch (err: any) {
      setInviteError(err.message || 'Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Workspace Settings</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage organization settings, security policies, and team permissions.
        </p>
      </div>

      {/* Organization Details */}
      <div className="border border-border bg-surface rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-text-primary">Organization Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-text-secondary block mb-1">Organization Name</span>
            <span className="font-medium text-text-primary">{currentOrg?.name}</span>
          </div>
          <div>
            <span className="text-text-secondary block mb-1">Workspace Slug</span>
            <span className="font-mono text-text-primary bg-surface-subtle px-2 py-0.5 rounded border border-border">
              {currentOrg?.slug}
            </span>
          </div>
          <div>
            <span className="text-text-secondary block mb-1">Tenant ID</span>
            <span className="font-mono text-[11px] text-text-secondary">{currentOrg?.id}</span>
          </div>
          <div>
            <span className="text-text-secondary block mb-1">Your Role</span>
            <span className="font-mono text-accent uppercase font-medium">{role}</span>
          </div>
        </div>
      </div>

      {/* Team & RBAC Members */}
      <div className="border border-border bg-surface rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Team Members & Access Control</h2>
              <span className="text-xs text-text-secondary">Role-based access control enforced server-side.</span>
            </div>
          </div>
        </div>

        {canManageMembers && (
          <form onSubmit={handleInvite} className="p-4 rounded-lg bg-surface-subtle border border-border/70 space-y-3">
            <span className="text-xs font-medium text-text-primary block">Add or Update Member</span>

            {inviteError && (
              <div className="p-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            {inviteSuccess && (
              <div className="p-2.5 rounded bg-success/10 border border-success/20 text-success text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{inviteSuccess}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="Teammate's registered email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-md border border-border bg-background text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent"
              />

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="px-3 py-1.5 text-xs rounded-md border border-border bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value={Role.VIEWER}>VIEWER (Read-only)</option>
                <option value={Role.ANALYST}>ANALYST (Audit + Runs)</option>
                <option value={Role.MANAGER}>MANAGER (Workflows)</option>
                <option value={Role.ADMIN}>ADMIN (Full Org Control)</option>
              </select>

              <button
                type="submit"
                disabled={isSubmitting || !inviteEmail.trim()}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>
          </form>
        )}

        {/* Member Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle border-b border-border text-text-secondary">
              <tr>
                <th className="px-4 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-text-primary block">{m.user?.name}</span>
                    <span className="text-[11px] text-text-secondary">{m.user?.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded border border-border bg-surface-subtle font-mono uppercase text-[11px] text-text-primary">
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-[11px]">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
