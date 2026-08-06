'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, Zap } from 'lucide-react';
import type { MenuItem } from '@/lib/types';
import { ThemeToggle } from '@/components/site/theme-toggle';

export function SiteHeader({ menu }: { menu: MenuItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4.5 w-4.5" fill="currentColor" />
          </span>

          <span className="font-sans">
            <span className="text-foreground">Tatrix</span>
            <span className="text-primary">360</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {menu.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Dark/light mode button */}
          <ThemeToggle />

          {/* Search */}
          <Link
            href="/search"
            className="group flex items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-card hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />

            <span className="hidden lg:inline">Search</span>

            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
              ⌘K
            </kbd>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {open && (
        <nav className="border-t border-border/60 bg-background md:hidden">
          <div className="container-page flex flex-col py-2">
            {menu.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}