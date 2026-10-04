'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import {
  GitBranch,
  Play,
  ArrowLeft,
  ShieldAlert,
  Bot,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Database,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';
import { apiClient } from '../../../lib/api';

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentOrg } = useAuth();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiryText, setInquiryText] = useState(
    'I was charged $299 on invoice #INV-9281. I need a full refund immediately as this service was not used.',
  );
  const [customerEmail, setCustomerEmail] = useState('enterprise-client@acme.com');
  const [activeRunResult, setActiveRunResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflow = async () => {
    if (!currentOrg || !workflowId) return;
    try {
      const data = await apiClient(`/workflows/${workflowId}`);
      setWorkflow(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, [workflowId, currentOrg]);

  const handleExecute = async () => {
    if (!inquiryText.trim()) return;
    setIsRunning(true);
    setError(null);
    setActiveRunResult(null);

    try {
      const result = await apiClient(`/workflows/${workflowId}/runs`, {
        method: 'POST',
        body: JSON.stringify({
          inquiryText: inquiryText.trim(),
          customerEmail: customerEmail.trim(),
        }),
      });

      setActiveRunResult(result);
      await fetchWorkflow();
    } catch (err: any) {
      setError(err.message || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-6 text-center text-text-secondary">
        Workflow not found.{' '}
        <button onClick={() => router.push('/workflows')} className="text-accent underline">
          Back to Workflows
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/workflows')}
            className="p-1.5 rounded-md border border-border hover:bg-surface-subtle text-text-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-text-primary">{workflow.name}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded border border-border bg-surface-subtle font-mono uppercase text-text-secondary">
                {workflow.status}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">{workflow.description || 'Deterministic multi-agent pipeline'}</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isRunning}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Orchestrating Agents...' : 'Run Pipeline'}</span>
        </button>
      </div>

      {/* Visual Agent Graph Pipeline */}
      <div className="border border-border bg-surface rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Multi-Agent Orchestration Architecture
            </h2>
          </div>
          <span className="text-[11px] text-text-secondary">Linear State Machine • Controlled Policy Gates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Agent 1 */}
          <div className="p-4 rounded-lg bg-surface-subtle border border-border/70 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-accent">NODE 01</span>
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-xs font-semibold text-text-primary">Triage Agent</h3>
            <p className="text-[11px] text-text-secondary mt-1">
              Classifies inquiry, evaluates urgency, detects financial / safety escalations.
            </p>
          </div>

          {/* Agent 2 */}
          <div className="p-4 rounded-lg bg-surface-subtle border border-border/70 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-warning">NODE 02</span>
              <Database className="w-4 h-4 text-warning" />
            </div>
            <h3 className="text-xs font-semibold text-text-primary">Research Agent</h3>
            <p className="text-[11px] text-text-secondary mt-1">
              Queries PostgreSQL vector knowledge base & billing policy databases.
            </p>
          </div>

          {/* Agent 3 */}
          <div className="p-4 rounded-lg bg-surface-subtle border border-border/70 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-success">NODE 03</span>
              <Sparkles className="w-4 h-4 text-success" />
            </div>
            <h3 className="text-xs font-semibold text-text-primary">Response Agent</h3>
            <p className="text-[11px] text-text-secondary mt-1">
              Synthesizes verified context into empathetic professional resolution draft.
            </p>
          </div>

          {/* Gate 4 */}
          <div className="p-4 rounded-lg bg-surface-subtle border border-border/70 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-danger">NODE 04</span>
              <ShieldAlert className="w-4 h-4 text-danger" />
            </div>
            <h3 className="text-xs font-semibold text-text-primary">Human Approval Gate</h3>
            <p className="text-[11px] text-text-secondary mt-1">
              Halts execution on high-risk actions ($100+ refund, deletions) for review.
            </p>
          </div>
        </div>
      </div>

      {/* Live Run Execution Result */}
      {activeRunResult && (
        <div className="border border-border bg-surface rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-primary">Execution Trace:</span>
              <span className="font-mono text-xs text-text-secondary">{activeRunResult.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border uppercase font-mono ${
                  activeRunResult.status === 'COMPLETED'
                    ? 'bg-success/10 text-success border-success/20'
                    : 'bg-warning/10 text-warning border-warning/20'
                }`}
              >
                {activeRunResult.status}
              </span>
              <span className="text-xs text-text-secondary">
                Duration: {activeRunResult.output?.total_duration_ms || 0}ms
              </span>
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="space-y-3">
            {activeRunResult.output?.steps?.map((step: any) => (
              <div key={step.step_index} className="p-3.5 rounded-lg bg-surface-subtle border border-border/60">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-xs font-semibold text-text-primary">
                      Step {step.step_index}: {step.step_name} ({step.agent_name})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary">{step.duration_ms}ms</span>
                </div>
                <pre className="p-2.5 rounded bg-background border border-border text-[11px] font-mono text-text-primary overflow-x-auto">
                  {JSON.stringify(step.output, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          {/* Final Action / Draft */}
          {activeRunResult.output?.final_output?.response && (
            <div className="mt-4 p-4 rounded-lg border border-accent/30 bg-accent/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-primary">Synthesized Resolution Draft:</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface border border-border font-medium">
                  Risk Level: {activeRunResult.output?.risk_level}
                </span>
              </div>
              <p className="text-xs text-text-primary font-medium mb-1">
                Subject: {activeRunResult.output.final_output.response.subject}
              </p>
              <div className="p-3 rounded bg-surface border border-border text-xs text-text-primary whitespace-pre-line">
                {activeRunResult.output.final_output.response.draft_reply}
              </div>
              {activeRunResult.status === 'WAITING_FOR_APPROVAL' && (
                <div className="mt-3 p-2.5 rounded bg-warning/10 border border-warning/20 text-warning text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>High-risk action intercepted. Forwarded to Human Approval Inbox.</span>
                  </div>
                  <button
                    onClick={() => router.push('/approvals')}
                    className="px-2.5 py-1 rounded bg-warning text-black font-medium text-[11px] hover:opacity-90"
                  >
                    Go to Approvals
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Execution Run Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Trigger Agent Pipeline</h3>
            <p className="text-xs text-text-secondary">
              Provide sample customer communication to test multi-agent reasoning, evidence retrieval, and risk gating.
            </p>

            {error && (
              <div className="p-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-xs">
                {error}
              </div>
            )}

            {/* Quick Templates */}
            <div>
              <span className="text-[11px] font-medium text-text-secondary block mb-1.5">Load Test Scenario:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setInquiryText(
                      'I was charged $299 on invoice #INV-9281. I need a full refund immediately as this service was not used.',
                    )
                  }
                  className="px-2.5 py-1 text-[11px] rounded border border-border bg-surface-subtle hover:bg-border text-text-primary"
                >
                  💳 $299 Refund (High Risk Gate)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInquiryText(
                      'What is your API rate limit for the Pro Plan, and how do I configure Webhooks?',
                    )
                  }
                  className="px-2.5 py-1 text-[11px] rounded border border-border bg-surface-subtle hover:bg-border text-text-primary"
                >
                  ⚡ API Tech Docs (Low Risk)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">Customer Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">Incoming Customer Inquiry</label>
              <textarea
                rows={4}
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-surface-subtle text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  handleExecute();
                }}
                disabled={!inquiryText.trim()}
                className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
              >
                Run Execution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
