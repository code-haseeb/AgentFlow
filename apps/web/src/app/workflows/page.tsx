'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/auth-context';
import { Plus, GitBranch, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../lib/api';

export default function WorkflowsPage() {
  const { currentOrg, role } = useAuth();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    if (!currentOrg) return;
    try {
      const data = await apiClient('/workflows');
      setWorkflows(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [currentOrg]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);

    try {
      await apiClient('/workflows', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      setName('');
      setDescription('');
      setIsModalOpen(false);
      await fetchWorkflows();
    } catch (err: any) {
      setError(err.message || 'Failed to create workflow');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Workflows</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure multi-agent automated execution pipelines with policy boundaries.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workflow</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center bg-surface">
          <GitBranch className="w-10 h-10 text-text-secondary/50 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-text-primary">No workflows configured</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
            Get started by creating your first automated business workflow.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> Create Workflow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => (
            <Link
              key={wf.id}
              href={`/workflows/${wf.id}`}
              className="p-5 rounded-xl border border-border bg-surface hover:border-accent/40 transition-colors shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-md bg-surface-subtle border border-border text-accent group-hover:bg-accent/10 transition-colors">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-border bg-surface-subtle font-mono uppercase text-text-secondary">
                    {wf.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{wf.name}</h3>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  {wf.description || 'No description provided'}
                </p>
              </div>

              <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                <span className="text-[11px] text-text-secondary">
                  {wf._count?.runs || 0} runs executed
                </span>
                <span className="text-xs text-accent font-medium flex items-center gap-1">
                  Open Graph & Run <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-text-primary mb-1">Create New Workflow</h3>
            <p className="text-xs text-text-secondary mb-4">
              Define a new automated agent pipeline for this workspace.
            </p>

            {error && (
              <div className="mb-3 p-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Workflow Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI Customer Inbound Triage"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the agents, tools, and goals of this workflow..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
                >
                  Create Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
