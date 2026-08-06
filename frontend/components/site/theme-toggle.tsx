  'use client';

  import { useTheme } from 'next-themes';
  import { Moon, Sun } from 'lucide-react';
  import { useEffect, useState } from 'react';

  export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const isDark = resolvedTheme === 'dark';

    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Toggle theme"
      >
        {mounted ? (
          <div className="relative h-5 w-5">
            <Sun className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} />
            <Moon className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
          </div>
        ) : (
          <div className="h-5 w-5" />
        )}
      </button>
    );
  }
