'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Package, Loader2, CheckSquare, Square } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { DeleteArticleButton } from '@/components/site/admin/delete-article-button';

export interface BulkArticleRow {
  id: string;
  title: string;
  slug: string;
  status?: string;
  articleType?: string;
  isLatest?: boolean;
  isPinned?: boolean;
  isVisible?: boolean;
  createdAt?: string;
  mainCategory?: { displayName: string; slug: string } | null;
  section?: { title: string } | null;
}

type BulkAction = 'publish' | 'draft' | 'archive' | 'show' | 'hide' | 'delete';

const BULK_BUTTONS: { action: BulkAction; label: string; danger?: boolean }[] = [
  { action: 'publish', label: 'Publish' },
  { action: 'draft', label: 'Draft' },
  { action: 'archive', label: 'Archive' },
  { action: 'show', label: 'Show' },
  { action: 'hide', label: 'Hide' },
  { action: 'delete', label: 'Delete', danger: true },
];

function statusBadge(status?: string) {
  const cls =
    status === 'Published'
      ? 'bg-green/10 text-green-700'
      : status === 'Archived'
        ? 'bg-muted text-muted-foreground'
        : 'bg-amber/10 text-amber-700';
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
      {status ?? 'Unknown'}
    </span>
  );
}

/**
 * Article list with checkbox selection + bulk action bar (A1).
 * Server page passes the (already filtered/searched) rows; all
 * interactivity lives here.
 */
export function ArticleBulkManager({ articles }: { articles: BulkArticleRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<BulkAction | null>(null);
  const [message, setMessage] = useState('');

  const allSelected = articles.length > 0 && selected.size === articles.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(articles.map((a) => a.id)));
  }

  async function runBulk(action: BulkAction) {
    if (selected.size === 0) return;
    if (action === 'delete' && !window.confirm(`Delete ${selected.size} article(s)? This can't be undone.`)) return;
    setBusy(action);
    setMessage('');
    try {
      const res = await fetch('/api/admin/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: [...selected] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setMessage(data.error || 'Bulk action failed.');
      } else {
        setMessage(`Done — updated ${data.updated} article(s).`);
        setSelected(new Set());
        router.refresh();
      }
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  if (articles.length === 0) return null;

  return (
    <div>
      {/* Toolbar: select-all + count */}
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={toggleAll}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-pressed={allSelected}
        >
          {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
        {selected.size > 0 && (
          <span className="text-sm font-medium text-primary">{selected.size} selected</span>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 p-3">
          <span className="mr-1 text-sm font-semibold">Bulk:</span>
          {BULK_BUTTONS.map((b) => (
            <button
              key={b.action}
              type="button"
              onClick={() => runBulk(b.action)}
              disabled={busy !== null}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                b.danger
                  ? 'border border-destructive/30 text-destructive hover:bg-destructive/10'
                  : 'border border-border bg-background hover:bg-muted'
              }`}
            >
              {busy === b.action && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {b.label}
            </button>
          ))}
        </div>
      )}

      {message && (
        <p className="mb-3 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm">{message}</p>
      )}

      <div className="flex flex-col gap-3">
        {articles.map((article) => {
          const checked = selected.has(article.id);
          return (
            <div
              key={article.id}
              className={`flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-colors sm:flex-row sm:items-center sm:gap-4 ${
                checked ? 'border-primary/50' : 'border-border'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleOne(article.id)}
                aria-pressed={checked}
                aria-label={`Select ${article.title}`}
                className="self-start rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground sm:self-center"
              >
                {checked ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {article.mainCategory && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {article.mainCategory.displayName}
                    </span>
                  )}
                  {article.section && (
                    <span className="text-xs text-muted-foreground">
                      {article.section.title}
                    </span>
                  )}
                  {statusBadge(article.status)}
                  {article.articleType === 'listicle' && (
                    <span className="rounded-full bg-indigo/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                      Listicle
                    </span>
                  )}
                  {article.isLatest && (
                    <span className="rounded-full bg-blue/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                      Latest
                    </span>
                  )}
                  {article.isPinned && (
                    <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-600">
                      Pinned
                    </span>
                  )}
                  {article.isVisible === false && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Hidden
                    </span>
                  )}
                </div>

                <h3 className="mt-1.5 truncate font-serif text-base font-bold">
                  {article.title}
                </h3>

                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  /{article.mainCategory?.slug ?? '?'}/{article.slug} · {formatDate(article.createdAt) || '—'}
                </p>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                {article.articleType === 'listicle' && (
                  <Link
                    href={`/adminmja/posts/${article.id}/items`}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    <Package className="h-3.5 w-3.5" />
                    Items
                  </Link>
                )}
                <Link
                  href={`/adminmja/posts/${article.id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>

                <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
