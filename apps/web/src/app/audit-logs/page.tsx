'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { History, Shield, Clock } from 'lucide-react';
import { apiClient } from '../../lib/api';

export default function AuditLogsPage() {
  const { currentOrg } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (!currentOrg) return;
      try {
        const data = await apiClient('/audit-logs');
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, [currentOrg]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Audit Logs</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Cryptographically timestamped audit trail of all organization and agent actions.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center bg-surface">
          <History className="w-10 h-10 text-text-secondary/50 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-text-primary">No audit events recorded</h3>
          <p className="text-xs text-text-secondary mt-1">Actions performed in this workspace will appear here.</p>
        </div>
      ) : (
        <div className="border border-border bg-surface rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle border-b border-border text-text-secondary">
              <tr>
                <th className="px-4 py-2.5 font-medium">Timestamp</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
                <th className="px-4 py-2.5 font-medium">Target Entity</th>
                <th className="px-4 py-2.5 font-medium">Initiator</th>
                <th className="px-4 py-2.5 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-subtle/40 transition-colors font-mono text-[11px]">
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded border border-border bg-surface-subtle text-accent font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-primary">
                    {log.entityType} {log.entityId ? `(${log.entityId.slice(0, 8)}...)` : ''}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {log.user ? log.user.email : 'System / Background Job'}
                  </td>
                  <td className="px-4 py-3 text-text-secondary font-mono max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '—'}
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
