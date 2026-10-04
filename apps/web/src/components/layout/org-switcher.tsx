'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/auth-context';
import { ChevronsUpDown, Check, Building2, Plus } from 'lucide-react';
import { apiClient } from '../../lib/api';

export function OrgSwitcher() {
  const { currentOrg, organizations, switchOrganization, refreshSession } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await apiClient('/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: newOrgName.trim() }),
      });
      setNewOrgName('');
      setShowCreateModal(false);
      await refreshSession();
      switchOrganization(created.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border bg-surface hover:bg-surface-subtle transition-colors text-text-primary max-w-[200px]"
      >
        <Building2 className="w-3.5 h-3.5 text-text-secondary shrink-0" />
        <span className="truncate">{currentOrg ? currentOrg.name : 'Select Workspace'}</span>
        <ChevronsUpDown className="w-3 h-3 text-text-secondary ml-auto shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-56 rounded-md border border-border bg-surface shadow-lg z-50 py-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Organizations
          </div>
          <div className="max-h-48 overflow-y-auto">
            {organizations.map(({ organization, role }) => {
              const isSelected = currentOrg?.id === organization.id;
              return (
                <button
                  key={organization.id}
                  onClick={() => {
                    switchOrganization(organization.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-surface-subtle transition-colors ${
                    isSelected ? 'text-accent font-medium' : 'text-text-primary'
                  }`}
                >
                  <div className="truncate flex-1 mr-2">
                    <p className="truncate">{organization.name}</p>
                    <span className="text-[10px] text-text-secondary capitalize">{role.toLowerCase()}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowCreateModal(true);
              }}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create organization</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Org Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-text-primary mb-1">Create new organization</h3>
            <p className="text-xs text-text-secondary mb-4">
              Enter the name of your organization or workspace.
            </p>
            {error && (
              <div className="mb-3 p-2 text-xs text-danger bg-danger/10 border border-danger/20 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateOrg}>
              <input
                type="text"
                required
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newOrgName.trim()}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
