'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-md" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
