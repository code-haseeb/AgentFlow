import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { AuthProvider } from '../context/auth-context';
import { AppShell } from '../components/layout/app-shell';

export const metadata: Metadata = {
  title: 'AgentFlow — AI Multi-Agent Automation Platform',
  description: 'Enterprise multi-agent business automation with RBAC, approvals, and audit trails',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
