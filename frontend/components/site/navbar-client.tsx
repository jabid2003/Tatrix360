'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { MegaMenu, Dropdown } from './mega-menu';
import { ThemeToggle } from './theme-toggle';
import type { NavbarLink } from '@/types/navbar';
import type { Post } from '@/lib/types';

export function NavbarClient({ links, latest = [] }: { links: NavbarLink[]; latest?: Post[] }) {
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileQuery, setMobileQuery] = useState('');
  const mobileRef = useRef<HTMLDivElement>(null);

  // Latest ticker auto-slide
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickerLen = latest.length;
  useEffect(() => {
    if (tickerLen < 2) return;
    const id = setInterval(() => setTickerIndex((i) => (i + 1) % tickerLen), 5000);
    return () => clearInterval(id);
  }, [tickerLen]);

  // Desktop dropdowns close on outside click (only when NOT in mobile mode)
  useEffect(() => {
    if (mobile) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.desktop-nav-group')) setOpen({});
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [mobile]);

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

  // Close mobile drawer on route change (path-based, not router reference)
  const pathnameRef = useRef('');
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

  // Also close on Next.js navigation
  useEffect(() => {
    const orig = router.push;
    router.push = (...args: Parameters<typeof router.push>) => {
      setMobile(false);
      return orig.apply(router, args);
    };
    return () => { router.push = orig; };
  }, [router]);

  const toggleAccordion = useCallback((id: string) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  function runMobileSearch(query: string) {
    const q = query.trim();
    if (!q) return;
    setMobile(false);
    setMobileQuery('');
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function submitSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const q = (e.target as HTMLInputElement).value;
      if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  }

  const tickerPost = latest[tickerIndex % Math.max(tickerLen, 1)];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Latest ticker */}
      <div className="border-b bg-background">
        <div className="container-page flex h-9 items-center justify-center gap-2 overflow-hidden text-xs" aria-live="polite" aria-atomic="true">
          <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Latest</span>
          <span aria-hidden="true" className="shrink-0 text-muted-foreground/50">·</span>
          {tickerPost && tickerPost.category ? (
            <Link
              key={tickerPost.id}
              href={`/${tickerPost.category.slug}/${tickerPost.slug}`}
              className="ticker-in inline-block max-w-[60%] truncate font-medium text-foreground/80 underline-offset-2 transition-colors hover:text-primary hover:underline"
            >
              {tickerPost.title}
            </Link>
          ) : (
            <span className="text-muted-foreground/50">Welcome to Tatrix360</span>
          )}
        </div>
      </div>

      {/* Main bar */}
      <div className={`border-b bg-background transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="container-page flex h-14 items-center justify-between gap-6">
          <Link href="/" className="text-[17px] font-bold tracking-tight text-foreground" aria-label="Tatrix360 Home">
            Tatrix<span className="text-primary">360</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden flex-1 items-center justify-center gap-4 lg:flex" aria-label="Main">
            {links.map((l) => {
              const hasChildren = !!l.children?.length;
              return (
                <div key={l.id} className="desktop-nav-group group relative">
                  <Link
                    href={l.slug}
                    className="inline-flex items-center gap-0.5 text-sm font-medium text-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                    {hasChildren && (
                      <ChevronDown className="h-3 w-3 opacity-50 transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </Link>
                  {hasChildren && (l.is_mega_menu ? <MegaMenu link={l} /> : <Dropdown link={l} />)}
                </div>
              );
            })}
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
        onClick={() => setMobile(false)}
        className={`drawer-backdrop fixed inset-0 z-[59] bg-black/30 lg:hidden ${mobile ? 'open' : ''}`}
      />
      <div
        ref={mobileRef}
        className={`drawer-panel fixed inset-x-0 bottom-0 z-[60] flex flex-col bg-background lg:hidden ${mobile ? 'open' : ''}`}
        style={{ top: '88px' }}
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

              {/* Menu */}
              <nav className="flex flex-col p-3" aria-label="Mobile">
                {links.map((l) => {
                  const hasChildren = !!l.children?.length;
                  const isOpen = !!open[l.id];
                  return (
                    <div key={l.id}>
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAccordion(l.id);
                          }}
                          className="flex w-full items-center justify-between border-b border-border py-3 text-left text-sm font-medium transition-colors hover:text-primary"
                          aria-expanded={isOpen}
                        >
                          <span>{l.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                      ) : (
                        <Link
                          href={l.slug}
                          onClick={() => setMobile(false)}
                          className="flex w-full items-center justify-between border-b border-border py-3 text-left text-sm font-medium transition-colors hover:text-primary"
                        >
                          <span>{l.label}</span>
                        </Link>
                      )}

                      {/* Subcategory expand/collapse with CSS grid transition */}
                      {hasChildren && (
                        <div
                          className="grid transition-all duration-300 ease-in-out"
                          style={{
                            gridTemplateRows: isOpen ? '1fr' : '0fr',
                          }}
                        >
                          <div className="overflow-hidden">
                            <div className="flex flex-col pb-1">
                              {l.children?.map((c) => (
                                <Link
                                  key={c.id}
                                  href={c.slug}
                                  onClick={() => setMobile(false)}
                                  className="border-b border-border/50 py-2.5 pl-4 text-sm text-muted-foreground transition-colors hover:text-primary"
                                >
                                  {c.label}
                                </Link>
                              ))}
                              <Link
                                href={l.slug}
                                onClick={() => setMobile(false)}
                                className="flex items-center gap-1 py-2.5 pl-4 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                              >
                                View all {l.label}
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
            <div className="border-t p-4 text-center text-xs text-muted-foreground">
              Tatrix360 — Tech, decoded.
            </div>
          </div>
    </header>
  );
}
