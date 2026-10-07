'use client';

import React from 'react';
import { OrgSwitcher } from './org-switcher';
import { ThemeToggle } from '../theme-toggle';
import { useAuth } from '../../context/auth-context';
import { LogOut, User as UserIcon } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <OrgSwitcher />

        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <span className="text-[11px]">Search & Commands...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border">Ctrl K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-surface-subtle border border-border flex items-center justify-center text-text-secondary text-xs">
                {user.name ? user.name[0].toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-medium text-text-primary leading-tight">{user.name}</span>
                <span className="text-[10px] text-text-secondary leading-none">{user.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-md text-text-secondary hover:text-danger hover:bg-surface-subtle transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
