'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Zap,
  BrainCircuit,
  Smartphone,
  Laptop,
  Wrench,
  Info,
  Home,
  Globe,
  Newspaper,
  Lightbulb,
  Sparkles,
  Gamepad2,
  Layers,
  Star,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { MenuItem, Category, Subcategory } from '@/lib/types';
import { ThemeToggle } from '@/components/site/theme-toggle';

// Icon mapping for primary nav — kept minimal, premium
const iconMap: Record<string, LucideIcon> = {
  '/': Home,
  '/category/ai': BrainCircuit,
  '/category/news': Newspaper,
  '/category/gadgets': Smartphone,
  '/category/do-you-know': Lightbulb,
  '/about': Info,
};

// Secondary bar icons — distinct, techy
const secondaryIconMap: Record<string, LucideIcon> = {
  Featured: Star,
  Mobile: Smartphone,
  Laptop: Laptop,
  OS: Layers,
  Apps: Globe,
  'How-To': Wrench,
  Gaming: Gamepad2,
};

function getMenuIcon(url: string) {
  return iconMap[url] ?? Home;
}
function getSecondaryIcon(label: string) {
  return secondaryIconMap[label] ?? Sparkles;
}

const HOME_ITEM: MenuItem = { id: 0, label: 'Home', url: '/', order: 0, section: 'primary' };

interface SiteHeaderProps {
  primaryMenu: MenuItem[];
  secondaryMenu: MenuItem[];
  navTree?: { category: Category; subcategories: Subcategory[] }[];
}

export function SiteHeader({ primaryMenu, secondaryMenu, navTree = [] }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(true);
  const [expandedMobile, setExpandedMobile] = useState<Record<string, boolean>>({});
  const [scrolled, setScrolled] = useState(false);

  const hasHome = primaryMenu.some((m) => m.url === '/');
  const primaryItems = hasHome ? primaryMenu : [HOME_ITEM, ...primaryMenu];

  // Dedupe secondary by URL
  const seen = new Set<string>();
  const dedupedSecondary = secondaryMenu.filter((i) => {
    if (seen.has(i.url)) return false;
    seen.add(i.url);
    return true;
  });

  // Build lookup for dropdowns
  const findTree = (item: MenuItem) => {
    const urlSlug = item.url.split('/').filter(Boolean).pop()?.toLowerCase() ?? '';
    return navTree.find(
      ({ category }) =>
        category.slug.toLowerCase() === urlSlug ||
        category.name.toLowerCase() === item.label.toLowerCase()
    );
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar — dark, premium */}
      <div className={`border-b border-zinc-800 bg-zinc-950 text-zinc-100 transition-shadow ${scrolled ? 'shadow-lg' : ''}`}>
        <div className="container-page flex h-[56px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Tatrix360 Home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-950">
              <Zap className="h-4 w-4" fill="currentColor" />
            </span>
            <span className="hidden text-[15px] font-bold tracking-tight sm:block">
              Tatrix<span className="text-violet-400">360</span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Primary">
            {primaryItems.map((item) => {
              const Icon = getMenuIcon(item.url);
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5 opacity-70" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-900"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-900 lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary bar — light, pill nav with dropdowns */}
      {dedupedSecondary.length > 0 && (
        <div className="hidden border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:block">
          <div className="container-page">
            <nav className="flex items-center justify-center gap-1 overflow-x-auto py-2 scrollbar-hide" aria-label="Categories">
              {dedupedSecondary.map((item) => {
                const tree = findTree(item);
                const subs = tree?.subcategories ?? [];
                const Icon = getSecondaryIcon(item.label);

                if (subs.length > 0) {
                  return (
                    <div key={item.id} className="group relative">
                      <Link
                        href={item.url}
                        className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-muted/50 px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-white hover:shadow-sm"
                      >
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.label}
                        <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-hover:rotate-180" />
                      </Link>
                      <div className="invisible absolute left-1/2 top-full z-50 w-[22rem] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                        <div className="rounded-2xl border border-border bg-white p-3 shadow-xl">
                          <div className="mb-2 flex items-center gap-2 px-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold leading-none">{item.label}</p>
                              <p className="text-xs text-muted-foreground">Explore {item.label.toLowerCase()}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {subs.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/category/${tree!.category.slug}/${sub.slug}`}
                                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                              >
                                <span className="font-medium">{sub.name}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                              </Link>
                            ))}
                            <Link
                              href={item.url}
                              className="mt-1 flex items-center justify-center gap-1 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
                            >
                              View all {item.label} <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-white lg:hidden" style={{ top: '56px' }}>
          <div className="flex-1 overflow-y-auto">
            <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile">
              {primaryItems.map((item) => {
                const Icon = getMenuIcon(item.url);
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="my-3 border-t border-border" />

              <button
                type="button"
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                className="flex w-full items-center justify-between rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
              >
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Browse Categories
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileCategoriesOpen && (
                <div className="mt-2 space-y-1">
                  {(() => {
                    const seenM = new Set<string>();
                    const dedupedM = secondaryMenu.filter((i) => {
                      if (seenM.has(i.url)) return false;
                      seenM.add(i.url);
                      return true;
                    });
                    const findTreeM = (item: MenuItem) => {
                      const urlSlug = item.url.split('/').filter(Boolean).pop()?.toLowerCase() ?? '';
                      return navTree.find(
                        ({ category }) =>
                          category.slug.toLowerCase() === urlSlug ||
                          category.name.toLowerCase() === item.label.toLowerCase()
                      );
                    };
                    return dedupedM.map((item) => {
                      const tree = findTreeM(item);
                      const subs = tree?.subcategories ?? [];
                      const Icon = getSecondaryIcon(item.label);
                      return (
                        <div key={`m-${item.id}`} className="rounded-xl border border-border">
                          <div className="flex items-center gap-1 p-1">
                            <Link
                              href={item.url}
                              onClick={() => setMobileOpen(false)}
                              className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                            >
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              {item.label}
                            </Link>
                            {subs.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setExpandedMobile((prev) => ({ ...prev, [item.url]: !prev[item.url] }))}
                                className="rounded-lg p-2 hover:bg-muted"
                                aria-expanded={!!expandedMobile[item.url]}
                                aria-label={`Toggle ${item.label}`}
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedMobile[item.url] ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                          {subs.length > 0 && expandedMobile[item.url] && (
                            <div className="border-t border-border bg-muted/30 p-2">
                              {subs.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/category/${tree!.category.slug}/${sub.slug}`}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-white"
                                >
                                  <span>{sub.name}</span>
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </nav>
          </div>
          <div className="border-t border-border p-4">
            <p className="text-center text-xs text-muted-foreground">Tatrix360 — Tech, decoded.</p>
          </div>
        </div>
      )}
    </header>
  );
}
