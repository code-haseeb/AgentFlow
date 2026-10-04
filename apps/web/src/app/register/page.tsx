'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/auth-context';
import { ThemeToggle } from '../../components/theme-toggle';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(name, email, password, organizationName);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6">
      <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-accent-foreground font-semibold text-xs">
            AF
          </div>
          <span className="text-sm font-semibold tracking-tight text-text-primary">AgentFlow</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">Create your workspace</h1>
            <p className="text-xs text-text-secondary mt-1">Get started with AI multi-agent business automation</p>
          </div>

          <div className="border border-border bg-surface rounded-xl p-6 shadow-sm">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Organization / Company Name</label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Acme Technologies"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2 px-3 text-xs font-medium rounded-md bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-text-secondary mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center text-[11px] text-text-secondary max-w-5xl mx-auto w-full flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-success" />
        <span>Enterprise RBAC, multi-tenancy & auditability ready</span>
      </div>
    </div>
  );
}
