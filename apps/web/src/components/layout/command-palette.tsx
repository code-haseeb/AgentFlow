'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  GitBranch,
  PlayCircle,
  ShieldCheck,
  History,
  Settings,
  Sun,
  Moon,
  Search,
} from 'lucide-react';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { label: 'Go to Dashboard', icon: LayoutDashboard, action: () => router.push('/dashboard') },
    { label: 'Go to Workflows', icon: GitBranch, action: () => router.push('/workflows') },
    { label: 'Go to Execution Runs', icon: PlayCircle, action: () => router.push('/runs') },
    { label: 'Go to Human Approvals', icon: ShieldCheck, action: () => router.push('/approvals') },
    { label: 'Go to Audit Logs', icon: History, action: () => router.push('/audit-logs') },
    { label: 'Go to Workspace Settings', icon: Settings, action: () => router.push('/settings') },
    {
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-border">
          <Search className="w-4 h-4 text-text-secondary mr-2 shrink-0" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or jump to page... (ESC to close)"
            className="w-full py-3.5 text-xs bg-transparent text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-xs text-text-secondary">No commands found</div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.label}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-text-primary hover:bg-surface-subtle transition-colors text-left font-medium"
                >
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <span>{cmd.label}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-surface-subtle border-t border-border flex items-center justify-between text-[11px] text-text-secondary">
          <span>Navigation Quick-Action</span>
          <span className="font-mono">ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
}
