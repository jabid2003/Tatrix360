'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, X, Search } from 'lucide-react';
import type { Article } from '@/lib/sections';

interface ReadAlsoPickerProps {
  articles: Article[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export function ReadAlsoPicker({ articles, value, onChange }: ReadAlsoPickerProps) {
  const [query, setQuery] = useState('');

  const byId = useMemo(() => new Map(articles.map((a) => [a.id, a])), [articles]);
  const selected = value.map((id) => byId.get(id)).filter(Boolean) as Article[];
  const selectedIds = new Set(value);

  const q = query.trim().toLowerCase();
  const candidates = articles
    .filter((a) => !selectedIds.has(a.id))
    .filter((a) => q === '' || a.title.toLowerCase().includes(q) || (a.slug ?? '').toLowerCase().includes(q))
    .slice(0, 25);

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  function add(id: string) {
    if (selectedIds.has(id)) return;
    onChange([...value, id]);
    setQuery('');
  }

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <BookOpen className="h-4 w-4 text-primary" />
        Read Also
      </h3>
      <p className="text-xs text-muted-foreground">
        Pick articles to appear as &quot;Read also&quot; plain-title links inside this article.
        The links embed the chosen article&apos;s URL automatically.
      </p>

      {/* Selected list — plain titles with embedded article links */}
      {selected.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {selected.map((a, i) => (
            <li
              key={a.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
            >
              <span className="flex-shrink-0 text-[10px] font-semibold text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              <Link
                href={`/${a.mainCategory?.slug ?? ''}/${a.slug}`}
                className="min-w-0 flex-1 truncate text-sm text-foreground underline underline-offset-2 hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
                title={`${a.mainCategory?.displayName ?? ''} — ${a.title}`}
              >
                {a.title}
              </Link>
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="flex-shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${a.title} from Read Also`}
                title="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          No Read Also links yet. Search below to add some.
        </p>
      )}

      {/* Add search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all articles to add…"
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {candidates.length > 0 && (
        <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
          {candidates.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {a.mainCategory?.displayName ?? '—'}
                  {a.section ? ` · ${a.section.title}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => add(a.id)}
                className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}