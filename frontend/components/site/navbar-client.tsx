'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export interface FlatNavLink {
  id: string;
  label: string;
  href: string;
}

// Flat navbar: Home + 7 top-level hub links, no dropdowns. Mobile uses a
// hamburger drawer with the same links stacked.
export function NavbarClient({ links }: { links: FlatNavLink[] }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileQuery, setMobileQuery] = useState('');

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobile]);

  // Add shadow when scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile drawer on route change
  const pathnameRef = useRef('');
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = () => {
      const path = window.location.pathname;
      if (path !== pathnameRef.current) {
        setMobile(false);
        pathnameRef.current = path;
      }
    };
    window.addEventListener('popstate', handler);
    pathnameRef.current = window.location.pathname;
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Remove the closed drawer (and its links/inputs) from the tab order.
  // `aria-hidden` alone does not do this — without `inert`, keyboard users
  // can still tab into the off-screen panel (focus "black hole").
  useEffect(() => {
    panelRef.current?.toggleAttribute('inert', !mobile);
  }, [mobile]);

  function runMobileSearch(query: string) {
    const q = query.trim();
    if (!q) return;
    setMobile(false);
    setMobileQuery('');
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
  }

  function submitSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const q = (e.target as HTMLInputElement).value;
      if (q.trim()) window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
    }
  }

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main bar */}
      <div className={`border-b bg-background transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="container-page flex h-14 items-center justify-between gap-6">
          <Link href="/" className="shrink-0 text-[17px] font-bold tracking-tight text-foreground" aria-label="Tatrix360 Home">
            Tatrix<span className="text-primary">360</span>
          </Link>

          {/* Desktop: flat hub links */}
          <nav className="hidden flex-1 items-center justify-center gap-5 lg:flex" aria-label="Main">
            {links.map((l) => (
              <Link
                key={l.id}
                href={l.href}
                className={`whitespace-nowrap text-sm font-medium transition-colors ${isActive(l.href) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                aria-current={isActive(l.href) ? 'page' : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {/* Desktop search */}
            <div
              className={`hidden items-center overflow-hidden border-b transition-all duration-300 md:flex lg:flex ${
                searchOpen ? 'w-44 border-foreground/30' : 'w-8 border-transparent'
              }`}
            >
              <button type="button" onClick={() => setSearchOpen(!searchOpen)} className="p-1.5" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
              {searchOpen && (
                <input
                  autoFocus
                  placeholder="Search…"
                  className="w-full bg-transparent py-1 text-sm outline-none"
                  onKeyDown={submitSearch}
                />
              )}
            </div>

            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobile((v) => !v)}
              className="ml-0.5 inline-flex h-9 w-9 items-center justify-center text-foreground lg:hidden"
              aria-label={mobile ? 'Close menu' : 'Open menu'}
              aria-expanded={mobile}
            >
              {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer — always mounted for smooth transitions */}
      <button
        type="button"
        aria-label="Close menu"
        aria-hidden={!mobile}
        tabIndex={mobile ? 0 : -1}
        onClick={() => setMobile(false)}
        className={`drawer-backdrop fixed inset-0 z-[59] bg-black/30 lg:hidden ${mobile ? 'open' : ''}`}
      />
      <div
        ref={panelRef}
        className={`drawer-panel fixed inset-x-0 bottom-0 z-[60] flex flex-col bg-background lg:hidden ${mobile ? 'open' : ''}`}
        style={{ top: '57px' }}
        aria-hidden={!mobile}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Search */}
          <div className="border-b p-3">
            <div className="flex items-center gap-2 border-b border-border px-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') runMobileSearch(mobileQuery); }}
                placeholder="Search…"
                aria-label="Search articles"
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => runMobileSearch(mobileQuery)}
                className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Go
              </button>
            </div>
          </div>

          {/* Flat hub links, stacked */}
          <nav className="flex flex-col p-3" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.id}
                href={l.href}
                onClick={() => setMobile(false)}
                className={`flex w-full items-center justify-between border-b border-border py-3 text-left text-sm font-medium transition-colors ${isActive(l.href) ? 'text-primary' : 'hover:text-primary'}`}
                aria-current={isActive(l.href) ? 'page' : undefined}
              >
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-4 text-center text-xs text-muted-foreground">
          Tatrix360 — Tech, decoded.
        </div>
      </div>
    </header>
  );
}
