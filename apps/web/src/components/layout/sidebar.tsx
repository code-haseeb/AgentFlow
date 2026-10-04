'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitBranch,
  PlayCircle,
  ShieldCheck,
  History,
  Settings,
  Bot,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Workflows', href: '/workflows', icon: GitBranch },
  { label: 'Executions', href: '/runs', icon: PlayCircle },
  { label: 'Approvals', href: '/approvals', icon: ShieldCheck, badge: '0' },
  { label: 'Audit Logs', href: '/audit-logs', icon: History },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col h-screen">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 gap-2.5 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-accent-foreground font-semibold text-xs tracking-wider">
          AF
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-text-primary tracking-tight">AgentFlow</span>
          <span className="text-[10px] text-text-secondary leading-none">B2B Agent Automation</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
          Platform
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-surface-subtle text-text-primary font-semibold border border-border/70'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-subtle border border-border text-text-secondary">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Role indicator */}
      <div className="p-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-[11px] text-text-secondary">System Online</span>
        </div>
        {role && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-surface-subtle font-mono uppercase text-text-secondary">
            {role}
          </span>
        )}
      </div>
    </aside>
  );
}
