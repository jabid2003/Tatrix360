'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pin, PinOff, Sparkles, Search, Save, Loader2 } from 'lucide-react';
import type { Article } from '@/lib/sections';

export interface PinnedRow {
  sort_order: number;
  articles: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    created_at: string | null;
    main_categories: { slug: string; display_name: string } | null;
  } | null;
}

export function TopLatestManager({
  initialPinned,
  articles,
}: {
  initialPinned: PinnedRow[];
  articles: Article[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState('');
  const [topEdits, setTopEdits] = useState<Record<string, string>>({});
  const [latestEdits, setLatestEdits] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const pinnedIds = useMemo(
    () => new Set(initialPinned.map((p) => p.articles?.id).filter(Boolean) as string[]),
    [initialPinned]
  );

  const latestArticles = useMemo(
    () =>
      articles
        .filter((a) => a.isLatest)
        .sort((a, b) => (a.latestOrder ?? 0) - (b.latestOrder ?? 0)),
    [articles]
  );
  const latestIds = useMemo(() => new Set(latestArticles.map((a) => a.id)), [latestArticles]);

  const q = query.trim().toLowerCase();
  const candidates = articles
    .filter((a) => q === '' || a.title.toLowerCase().includes(q) || (a.slug ?? '').toLowerCase().includes(q))
    .slice(0, 40);

  function showFlash(kind: 'success' | 'error', text: string) {
    setFlash({ kind, text });
    window.setTimeout(() => setFlash(null), 4000);
  }

  async function handlePin(articleId: string) {
    const key = `pin:${articleId}`;
    setBusy(key);
    try {
      const res = await fetch('/api/admin/top-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, sortOrder: initialPinned.length }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        showFlash('error', data.error || 'Failed to pin article.');
        return;
      }
      showFlash('success', 'Pinned to Top Articles.');
      router.refresh();
    } catch {
      showFlash('error', 'Something went wrong.');
    } finally {
      setBusy('');
    }
  }

  async function handleUnpin(articleId: string, title: string) {
    if (!window.confirm(`Unpin "${title}" from Top Articles?`)) return;
    const key = `unpin:${articleId}`;
    setBusy(key);
    try {
      const res = await fetch(`/api/admin/top-articles?articleId=${encodeURIComponent(articleId)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        showFlash('error', data.error || 'Failed to unpin.');
        return;
      }
      showFlash('success', 'Unpinned from Top Articles.');
      router.refresh();
    } catch {
      showFlash('error', 'Something went wrong.');
    } finally {
      setBusy('');
    }
  }

  async function handleSaveTopOrder(articleId: string) {
    const sortOrder = Number(topEdits[articleId]);
    if (!Number.isFinite(sortOrder)) {
      showFlash('error', 'Sort order must be a number.');
      return;
    }
    const key = `sort:${articleId}`;
    setBusy(key);
    try {
      const res = await fetch('/api/admin/top-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, sortOrder }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        showFlash('error', data.error || 'Failed to save order.');
        return;
      }
      showFlash('success', 'Top order saved.');
      router.refresh();
    } catch {
      showFlash('error', 'Something went wrong.');
    } finally {
      setBusy('');
    }
  }

  async function handleToggleLatest(articleId: string, isLatest: boolean) {
    const key = `latest:${articleId}`;
    setBusy(key);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/latest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLatest }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        showFlash('error', data.error || 'Failed to update Latest flag.');
        return;
      }
      showFlash('success', isLatest ? 'Marked as Latest.' : 'Removed from Latest.');
      router.refresh();
    } catch {
      showFlash('error', 'Something went wrong.');
    } finally {
      setBusy('');
    }
  }

  async function handleSaveLatestOrder(articleId: string) {
    const latestOrder = Number(latestEdits[articleId]);
    if (!Number.isFinite(latestOrder)) {
      showFlash('error', 'Latest order must be a number.');
      return;
    }
    // Reuse the latest endpoint — pass order through a one-shot patch via the
    // article update route so the flag + order stay in sync.
    const target = latestArticles.find((a) => a.id === articleId);
    if (!target) return;
    const key = `lsort:${articleId}`;
    setBusy(key);
    try {
      const res = await fetch(`/api/admin/posts/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: target.title,
          slug: target.slug,
          content: target.content || '',
          mainCategoryId: target.mainCategoryId,
          sectionId: target.sectionId,
          isLatest: true,
          latestOrder,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        showFlash('error', data.error || 'Failed to save latest order.');
        return;
      }
      showFlash('success', 'Latest order saved.');
      router.refresh();
    } catch {
      showFlash('error', 'Something went wrong.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {flash && (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            flash.kind === 'success'
              ? 'border-primary/30 bg-primary/5 text-foreground'
              : 'border-destructive/30 bg-destructive/5 text-destructive'
          }`}
        >
          {flash.text}
        </p>
      )}

      {/* Ordered lists: Top Articles + Latest */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pinned top list */}
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Pin className="h-4 w-4 text-primary" />
            Top Articles ({initialPinned.length})
          </h2>
          {initialPinned.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              Nothing pinned yet. Search below and mark as Top.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {initialPinned.map((row) => {
                const a = row.articles;
                if (!a) return null;
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.main_categories?.display_name ?? '—'} · /{a.main_categories?.slug ?? '?'}/{a.slug}
                      </p>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Order
                      <input
                        value={topEdits[a.id] ?? String(row.sort_order)}
                        onChange={(e) => setTopEdits((prev) => ({ ...prev, [a.id]: e.target.value }))}
                        inputMode="numeric"
                        className="w-14 rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSaveTopOrder(a.id)}
                      disabled={busy === `sort:${a.id}`}
                      className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                      aria-label={`Save order for ${a.title}`}
                      title="Save order"
                    >
                      {busy === `sort:${a.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </button>
                    <Link
                      href={`/${a.main_categories?.slug ?? ''}/${a.slug}`}
                      target="_blank"
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleUnpin(a.id, a.title)}
                      disabled={busy === `unpin:${a.id}`}
                      className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {busy === `unpin:${a.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PinOff className="h-3.5 w-3.5" />}
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Latest list */}
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            Latest ({latestArticles.length})
          </h2>
          {latestArticles.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              Nothing marked as Latest yet. Search below and mark as Latest.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {latestArticles.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.mainCategory?.displayName ?? '—'}
                      {a.section ? ` · ${a.section.title}` : ''}
                    </p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    Order
                    <input
                      value={latestEdits[a.id] ?? String(a.latestOrder ?? 0)}
                      onChange={(e) => setLatestEdits((prev) => ({ ...prev, [a.id]: e.target.value }))}
                      inputMode="numeric"
                      className="w-14 rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSaveLatestOrder(a.id)}
                    disabled={busy === `lsort:${a.id}`}
                    className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    aria-label={`Save latest order for ${a.title}`}
                    title="Save order"
                  >
                    {busy === `lsort:${a.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </button>
                  <Link
                    href={`/${a.mainCategory?.slug ?? ''}/${a.slug}`}
                    target="_blank"
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggleLatest(a.id, false)}
                    disabled={busy === `latest:${a.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                  >
                    {busy === `latest:${a.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Search + mark */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Search className="h-4 w-4 text-primary" />
          Mark articles — Top & Latest
        </h2>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all articles by title…"
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {candidates.length === 0 && (
            <li className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              {articles.length === 0 ? 'No articles yet. Publish one first.' : 'No matching articles.'}
            </li>
          )}
          {candidates.map((a) => {
            const isPinned = pinnedIds.has(a.id);
            const isLatest = latestIds.has(a.id);
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.mainCategory?.displayName ?? '—'}
                    {a.section ? ` · ${a.section.title}` : ''}
                    <span className="ml-1.5">· /{a.mainCategory?.slug ?? '?'}/{a.slug}</span>
                  </p>
                </div>

                {/* Top toggle */}
                {isPinned ? (
                  <button
                    type="button"
                    onClick={() => handleUnpin(a.id, a.title)}
                    disabled={busy === `unpin:${a.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                  >
                    {busy === `unpin:${a.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PinOff className="h-3.5 w-3.5" />}
                    Top ✓
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePin(a.id)}
                    disabled={busy === `pin:${a.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  >
                    {busy === `pin:${a.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pin className="h-3.5 w-3.5" />}
                    Top
                  </button>
                )}

                {/* Latest toggle */}
                {isLatest ? (
                  <button
                    type="button"
                    onClick={() => handleToggleLatest(a.id, false)}
                    disabled={busy === `latest:${a.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                  >
                    {busy === `latest:${a.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Latest ✓
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleLatest(a.id, true)}
                    disabled={busy === `latest:${a.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  >
                    {busy === `latest:${a.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Latest
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}