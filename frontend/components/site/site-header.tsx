'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Menu,
  X,
  Zap,
  BrainCircuit,
  Smartphone,
  Laptop,
  Tag,
  Wrench,
  Info,
  Circle,
  Apple,
  Home,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { MenuItem } from '@/lib/types';
import { ThemeToggle } from '@/components/site/theme-toggle';

const iconMap: Record<string, LucideIcon> = {
  '/': Home,
  '/category/ai': BrainCircuit,
  '/category/android': Smartphone,
  '/category/ios': Apple,
  '/category/gadgets': Laptop,
  '/category/deals': Tag,
  '/category/how-to': Wrench,
  '/about': Info,
};

function getMenuIcon(url: string) {
  return iconMap[url] ?? Circle;
}

const HOME_ITEM: MenuItem = { id: 0, label: 'Home', url: '/', order: 0 };

export function SiteHeader({ menu }: { menu: MenuItem[] }) {
  const [open, setOpen] = useState(false);

  const hasHome = menu.some((m) => m.url === '/');
  const navItems = hasHome ? menu : [HOME_ITEM, ...menu];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo + Slogan */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-80"
          aria-label="Tatrix360 Home"
        >
          {/* Logo mark */}
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20">
            <Zap className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true" />
          </span>

          {/* Brand name + slogan */}
          <span className="hidden sm:block">
            <span className="block text-lg font-bold leading-tight tracking-tight text-foreground">
              <span>Tatrix</span>
              <span className="text-primary">360</span>
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
              Tech, decoded
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const Icon = getMenuIcon(item.url);
            const isHome = item.url === '/';

            return (
              <Link
                key={item.id}
                href={item.url}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isHome
                    ? 'text-foreground hover:bg-primary/10 hover:text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Link
            href="/search"
            className="group flex items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-card hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
              ⌘K
            </kbd>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {open && (
        <nav
          id="mobile-navigation"
          className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="container-page flex flex-col py-2">
            {navItems.map((item) => {
              const Icon = getMenuIcon(item.url);

              return (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
