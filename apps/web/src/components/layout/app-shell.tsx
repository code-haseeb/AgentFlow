'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = pathname === '/login' || pathname === '/register';

  React.useEffect(() => {
    if (!isLoading && !user && !isAuthRoute) {
      router.push('/login');
    }
  }, [isLoading, user, isAuthRoute, router]);

  if (isAuthRoute) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-secondary tracking-wide">Loading AgentFlow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
