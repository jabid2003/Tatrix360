'use client';

import Link from 'next/link';
import { useState } from 'react';
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="Tatrix360 Home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" fill="currentColor" aria-hidden="true" />
          </span>
          <span className="hidden sm:block">
            <span className="text-base font-bold tracking-tight text-foreground">
              <span>Tatrix</span>
              <span className="text-primary">360</span>
            </span>
          </span>
        </Link>

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
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isHome
                    ? 'text-foreground hover:bg-muted'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Link
            href="/search"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden lg:inline">Search</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-navigation"
          className="border-t border-border bg-background md:hidden"
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
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
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
