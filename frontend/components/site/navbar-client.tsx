'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { MegaMenu, Dropdown } from './mega-menu';
import { ThemeToggle } from './theme-toggle';
import type { NavbarLink } from '@/types/navbar';

const LATEST_LINKS = ['AI News', 'OS News', 'Top Mobiles', 'Apps', 'Smartwatches'];

export function NavbarClient({ links }: { links: NavbarLink[] }) {
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Dropdowns close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.group')) setOpen({});
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobile]);

  // Add a hairline shadow when scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Latest quick links — thin top strip, centered */}
      <div className="hidden border-b bg-background sm:block">
        <div className="container-page flex h-8 items-center justify-center gap-6 text-xs">
          <span className="font-semibold text-muted-foreground">Latest:</span>
          {LATEST_LINKS.map((l) => (
            <Link
              key={l}
              href="/latest"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {l}
            </Link>
          ))}
        </div>
      </div>

      {/* Main bar — minimal text navbar */}
      <div className={`border-b bg-background transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="container-page flex h-14 items-center justify-between gap-6">
          {/* Brand — minimalist text logo */}
          <Link href="/" className="text-[17px] font-bold tracking-tight text-foreground" aria-label="Tatrix360 Home">
            Tatrix<span className="text-primary">360</span>
          </Link>

          {/* Center links — plain text, tight */}
          <nav className="hidden flex-1 items-center justify-center gap-4 lg:flex" aria-label="Main">
            {links.map((l) => {
              const hasChildren = !!l.children?.length;
              return (
                <div key={l.id} className="group relative">
                  <Link
                    href={l.slug}
                    className="inline-flex items-center gap-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Expanding search */}
            <div
              className={`flex items-center overflow-hidden border-b transition-all duration-300 ${
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const q = (e.target as HTMLInputElement).value;
                      if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
                    }
                  }}
                />
              )}
            </div>

            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobile(!mobile)}
              className="ml-0.5 inline-flex h-9 w-9 items-center justify-center text-foreground lg:hidden"
              aria-label={mobile ? 'Close menu' : 'Open menu'}
              aria-expanded={mobile}
            >
              {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobile && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col bg-background lg:hidden" style={{ top: '56px' }}>
          <div className="flex-1 overflow-y-auto">
            <div className="border-b p-3">
              <div className="flex items-center gap-2 border-b border-foreground/20 px-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search…"
                  className="w-full bg-transparent py-2.5 text-sm outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const q = (e.target as HTMLInputElement).value;
                      if (q.trim()) {
                        setMobile(false);
                        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
                      }
                    }
                  }}
                />
              </div>
            </div>
            <nav className="flex flex-col p-3" aria-label="Mobile">
              {links.map((l) => {
                const hasChildren = !!l.children?.length;
                return (
                  <div key={l.id}>
                    <div className="flex items-center border-b border-border">
                      <Link
                        href={l.slug}
                        onClick={() => setMobile(false)}
                        className="flex-1 py-3 text-sm font-medium hover:text-primary"
                      >
                        {l.label}
                      </Link>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => setOpen((p) => ({ ...p, [l.id]: !p[l.id] }))}
                          className="p-2"
                          aria-expanded={!!open[l.id]}
                          aria-label={`Toggle ${l.label}`}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${open[l.id] ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    {open[l.id] &&
                      l.children?.map((c) => (
                        <Link
                          key={c.id}
                          href={c.slug}
                          onClick={() => setMobile(false)}
                          className="block border-b border-border py-2.5 pl-4 text-sm text-muted-foreground hover:text-primary"
                        >
                          {c.label}
                        </Link>
                      ))}
                  </div>
                );
              })}
            </nav>
          </div>
          <div className="border-t p-4 text-center text-xs text-muted-foreground">
            Tatrix360 — Tech, decoded.
          </div>
        </div>
      )}
    </header>
  );
}
