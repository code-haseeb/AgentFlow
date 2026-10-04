'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/auth-context';
import { PlayCircle, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { apiClient } from '../../lib/api';

export default function RunsPage() {
  const { currentOrg } = useAuth();
  const [runs, setRuns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRuns() {
      if (!currentOrg) return;
      try {
        const data = await apiClient('/runs');
        setRuns(data);
      } catch (err) {
        console.error('Failed to load runs', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRuns();
  }, [currentOrg]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Execution Runs</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time execution traces, agent durations, and risk gate statuses.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : runs.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center bg-surface">
          <PlayCircle className="w-10 h-10 text-text-secondary/50 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-text-primary">No Executions Yet</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
            Run a workflow from the Workflows tab to view multi-agent traces here.
          </p>
          <Link
            href="/workflows"
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Go to Workflows
          </Link>
        </div>
      ) : (
        <div className="border border-border bg-surface rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle border-b border-border text-text-secondary">
              <tr>
                <th className="px-4 py-2.5 font-medium">Run ID</th>
                <th className="px-4 py-2.5 font-medium">Workflow</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Initiator</th>
                <th className="px-4 py-2.5 font-medium">Started</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[11px]">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-4 py-3 text-accent font-semibold">{run.id.slice(0, 13)}...</td>
                  <td className="px-4 py-3 text-text-primary font-sans font-medium">{run.workflow?.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded border uppercase text-[10px] font-semibold ${
                        run.status === 'COMPLETED'
                          ? 'bg-success/10 text-success border-success/20'
                          : run.status === 'WAITING_FOR_APPROVAL'
                          ? 'bg-warning/10 text-warning border-warning/20'
                          : 'bg-surface-subtle text-text-secondary border-border'
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary font-sans">{run.triggeredBy?.email || 'API'}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(run.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans">
                    <Link
                      href={`/workflows/${run.workflowId}`}
                      className="text-xs text-accent font-medium hover:underline inline-flex items-center gap-1"
                    >
                      Inspect <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
