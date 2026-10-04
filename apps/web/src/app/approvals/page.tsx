'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { ShieldAlert, Check, X, Clock, AlertTriangle, ArrowRight, Bot } from 'lucide-react';
import { apiClient } from '../../lib/api';

export default function ApprovalsPage() {
  const { currentOrg, role } = useAuth();
  const [runs, setRuns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchPendingApprovals = async () => {
    if (!currentOrg) return;
    try {
      const allRuns = await apiClient('/runs');
      const pending = allRuns.filter((r: any) => r.status === 'WAITING_FOR_APPROVAL');
      setRuns(pending);
    } catch (err) {
      console.error('Failed to fetch approvals', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, [currentOrg]);

  const handleApprove = async (runId: string) => {
    setProcessingId(runId);
    setActionSuccess(null);
    try {
      await apiClient(`/runs/${runId}/approve`, { method: 'POST' });
      setActionSuccess(`Run ${runId.slice(0, 8)} approved and scheduled for execution.`);
      await fetchPendingApprovals();
    } catch (err: any) {
      alert(err.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (runId: string) => {
    const reason = prompt('Please enter a rejection reason:', 'Policy violation or unauthorized transaction');
    if (reason === null) return;

    setProcessingId(runId);
    setActionSuccess(null);
    try {
      await apiClient(`/runs/${runId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      setActionSuccess(`Run ${runId.slice(0, 8)} was rejected.`);
      await fetchPendingApprovals();
    } catch (err: any) {
      alert(err.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Human Approval Inbox</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Authorize or reject high-risk autonomous agent actions before execution.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 font-medium">
          {runs.length} Pending Actions
        </span>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-md bg-success/10 border border-success/20 text-success text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : runs.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center bg-surface">
          <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-3">
            <Check className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">Inbox Zero — No Pending Approvals</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
            All agent operations are verified. When an agent flags an action above organizational risk thresholds,
            it will pause and wait here for explicit authorization.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => {
            const triage = run.output?.final_output?.triage;
            const research = run.output?.final_output?.research;
            const response = run.output?.final_output?.response;

            return (
              <div
                key={run.id}
                className="border border-warning/40 bg-surface rounded-xl p-5 shadow-xs space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-warning" />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-warning/10 text-warning border border-warning/20 font-semibold uppercase">
                      Risk: {run.output?.risk_level || 'HIGH'}
                    </span>
                    <span className="text-xs font-semibold text-text-primary">{run.workflow?.name}</span>
                  </div>
                  <span className="text-[11px] text-text-secondary font-mono">
                    Run ID: {run.id.slice(0, 13)}...
                  </span>
                </div>

                {/* Input Details */}
                <div className="p-3 rounded-lg bg-surface-subtle border border-border/70 text-xs">
                  <span className="text-[10px] uppercase font-semibold text-text-secondary block mb-1">
                    Customer Request
                  </span>
                  <p className="text-text-primary">{run.input?.inquiryText}</p>
                </div>

                {/* Agent Synthesized Action */}
                {response && (
                  <div className="p-3.5 rounded-lg border border-accent/20 bg-accent/5 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium text-accent">
                        <Bot className="w-4 h-4" />
                        <span>Proposed Resolution Action: {response.recommended_action}</span>
                      </div>
                      <span className="text-[10px] text-text-secondary capitalize">Tone: {response.tone}</span>
                    </div>

                    <div className="p-2.5 rounded bg-surface border border-border text-text-primary whitespace-pre-line text-[11px]">
                      {response.draft_reply}
                    </div>

                    {research?.verified_facts && (
                      <div className="text-[11px] text-text-secondary">
                        <strong className="text-text-primary">Ground Truth Evidence:</strong>{' '}
                        {research.verified_facts.join(' • ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[11px] text-text-secondary">
                    Review required by Manager or Admin before action execution.
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(run.id)}
                      disabled={processingId === run.id}
                      className="px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-danger/10 hover:text-danger text-text-secondary transition-colors"
                    >
                      <X className="w-3.5 h-3.5 inline mr-1" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(run.id)}
                      disabled={processingId === run.id}
                      className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-success text-black hover:opacity-90 transition-opacity font-semibold"
                    >
                      <Check className="w-3.5 h-3.5 inline mr-1" />
                      Approve & Execute
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
