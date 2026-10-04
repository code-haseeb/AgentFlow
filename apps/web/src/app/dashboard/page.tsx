'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/auth-context';
import {
  GitBranch,
  PlayCircle,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  Clock,
  ChevronRight,
  Database,
  Cpu,
  Layers,
} from 'lucide-react';
import { apiClient } from '../../lib/api';

export default function DashboardPage() {
  const { user, currentOrg, role } = useAuth();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!currentOrg) return;
      try {
        const data = await apiClient('/workflows');
        setWorkflows(data);
      } catch (err) {
        console.error('Failed to load workflows', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentOrg]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Workspace Overview
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Organization: <span className="font-medium text-text-primary">{currentOrg?.name}</span> • Role:{' '}
            <span className="font-mono text-accent text-[11px] uppercase">{role}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/workflows"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Workflow</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium">Active Workflows</span>
            <GitBranch className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-semibold text-text-primary">{workflows.length}</div>
          <span className="text-[11px] text-text-secondary mt-1 block">Deterministic agent graphs</span>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium">Total Runs</span>
            <PlayCircle className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl font-semibold text-text-primary">0</div>
          <span className="text-[11px] text-text-secondary mt-1 block">Traceable executions</span>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium">Pending Approvals</span>
            <ShieldAlert className="w-4 h-4 text-warning" />
          </div>
          <div className="text-2xl font-semibold text-text-primary">0</div>
          <span className="text-[11px] text-text-secondary mt-1 block">Human authorization gates</span>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-medium">System Health</span>
            <Activity className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl font-semibold text-success flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-success inline-block animate-pulse" />
            100%
          </div>
          <span className="text-[11px] text-text-secondary mt-1 block">PostgreSQL + Redis healthy</span>
        </div>
      </div>

      {/* Flagship Architecture Card */}
      <div className="border border-border bg-surface rounded-xl p-5 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent mb-2">
              <Layers className="w-3 h-3" /> Flagship Workflow Ready
            </div>
            <h2 className="text-sm font-semibold text-text-primary">
              AI Customer Support Automation Pipeline
            </h2>
            <p className="text-xs text-text-secondary mt-1 max-w-2xl leading-relaxed">
              Automates incoming requests through a pipeline of specialized agents: Triage Agent, Research
              Agent, and Response Agent with safety guardrails and human approval gates.
            </p>
          </div>
          <Link
            href="/workflows"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline shrink-0"
          >
            Inspect architecture <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pipeline Visual */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-5 gap-2 pt-4 border-t border-border">
          <div className="p-3 rounded-md bg-surface-subtle border border-border/70">
            <span className="text-[10px] font-mono text-text-secondary block mb-1">01 • INGEST</span>
            <span className="text-xs font-medium text-text-primary block">Triage Agent</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">Classification & Priority</span>
          </div>

          <div className="p-3 rounded-md bg-surface-subtle border border-border/70">
            <span className="text-[10px] font-mono text-text-secondary block mb-1">02 • RETRIEVAL</span>
            <span className="text-xs font-medium text-text-primary block">Research Agent</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">Vector DB & Policy Context</span>
          </div>

          <div className="p-3 rounded-md bg-surface-subtle border border-border/70">
            <span className="text-[10px] font-mono text-text-secondary block mb-1">03 • GENERATION</span>
            <span className="text-xs font-medium text-text-primary block">Response Agent</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">Structured Resolution Draft</span>
          </div>

          <div className="p-3 rounded-md bg-surface-subtle border border-border/70">
            <span className="text-[10px] font-mono text-text-secondary block mb-1">04 • POLICY</span>
            <span className="text-xs font-medium text-text-primary block">Risk Gate</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">High-Risk Policy Intercept</span>
          </div>

          <div className="p-3 rounded-md bg-surface-subtle border border-border/70">
            <span className="text-[10px] font-mono text-text-secondary block mb-1">05 • EXECUTE</span>
            <span className="text-xs font-medium text-text-primary block">Audit & Deliver</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">Traceable Audit Trail</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Infrastructure Status & Recent Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows Column */}
        <div className="lg:col-span-2 border border-border bg-surface rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Workflows</h3>
            <Link href="/workflows" className="text-xs font-medium text-accent hover:underline">
              View all
            </Link>
          </div>

          {workflows.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-border rounded-lg">
              <GitBranch className="w-8 h-8 text-text-secondary/50 mx-auto mb-2" />
              <p className="text-xs font-medium text-text-primary">No workflows created yet</p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Create your first agent workflow to automate business operations.
              </p>
              <Link
                href="/workflows"
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-surface-subtle hover:bg-border text-text-primary transition-colors border border-border"
              >
                <Plus className="w-3.5 h-3.5" /> Create Workflow
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {workflows.map((wf) => (
                <div key={wf.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-text-primary">{wf.name}</span>
                    <span className="text-[11px] text-text-secondary block mt-0.5">
                      {wf.description || 'No description provided'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-border bg-surface-subtle uppercase font-mono text-text-secondary">
                    {wf.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Infrastructure & Tenant Status */}
        <div className="border border-border bg-surface rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Service Cluster</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-md bg-surface-subtle border border-border/60">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-accent" />
                  <div>
                    <span className="text-xs font-medium text-text-primary block leading-none">PostgreSQL</span>
                    <span className="text-[10px] text-text-secondary">pgvector enabled • Port 5432</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" /> Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md bg-surface-subtle border border-border/60">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-warning" />
                  <div>
                    <span className="text-xs font-medium text-text-primary block leading-none">Redis</span>
                    <span className="text-[10px] text-text-secondary">Queue & Caching • Port 6379</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" /> Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md bg-surface-subtle border border-border/60">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-accent" />
                  <div>
                    <span className="text-xs font-medium text-text-primary block leading-none">NestJS API</span>
                    <span className="text-[10px] text-text-secondary">RBAC + Multi-Tenant • Port 4000</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" /> Active
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <span className="text-[11px] text-text-secondary block">
              Logged in as <strong className="text-text-primary">{user?.email}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
