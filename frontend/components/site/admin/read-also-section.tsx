'use client';

import { useState } from 'react';
import { Plus, X, Search, Link2 } from 'lucide-react';

interface ArticlePreview {
  id: string;
  title: string;
  slug: string;
  mainCategory?: { slug: string; displayName: string } | null;
  section?: { title: string } | null;
}

interface Props {
  readAlsoIds: string[];
  setReadAlsoIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ReadAlsoSection({ readAlsoIds, setReadAlsoIds }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState<ArticlePreview[]>([]);
  const [loading, setLoading] = useState(false);

  async function openPicker() {
    setPickerOpen(true);
    if (articles.length === 0) {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/articles?status=Published&limit=100');
        const data = await res.json();
        if (data.ok && Array.isArray(data.articles)) {
          setArticles(data.articles);
        }
      } catch {}
      setLoading(false);
    }
  }

  function addArticle(id: string) {
    if (!readAlsoIds.includes(id)) {
      setReadAlsoIds((prev) => [...prev, id]);
    }
    setPickerOpen(false);
    setSearch('');
  }

  function removeArticle(id: string) {
    setReadAlsoIds((prev) => prev.filter((x) => x !== id));
  }

  const filtered = articles.filter((a) => {
    if (readAlsoIds.includes(a.id)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q);
  });

  // Find titles for selected IDs
  const selectedArticles = readAlsoIds
    .map((id) => articles.find((a) => a.id === id))
    .filter(Boolean) as ArticlePreview[];

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Link2 className="h-4 w-4 text-primary" /> Read Also (link related articles)
        </h2>
        <button
          type="button"
          onClick={openPicker}
          className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add Article
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Link related articles to show in a &quot;Read Also&quot; section on the full spec page.
      </p>

      {/* Selected articles */}
      {selectedArticles.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedArticles.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium"
            >
              <span className="truncate max-w-[200px]">{a.title}</span>
              <button
                type="button"
                onClick={() => removeArticle(a.id)}
                className="rounded-full p-0.5 hover:bg-background text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {readAlsoIds.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground border border-dashed border-border rounded-lg p-3 text-center">
          No articles linked yet. Click &quot;Add Article&quot; to pick related articles.
        </p>
      )}

      {/* Picker */}
      {pickerOpen && (
        <div className="mt-3 rounded-xl border border-border bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="flex-1 bg-transparent text-sm outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => { setPickerOpen(false); setSearch(''); }}
              className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
          {loading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading articles...</p>
          ) : (
            <div className="max-h-60 space-y-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No articles found.</p>
              ) : (
                filtered.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => addArticle(article.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{article.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {article.mainCategory?.displayName ?? article.mainCategory?.slug ?? '—'}
                        {article.section ? ` / ${article.section.title}` : ''}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 flex-shrink-0 text-primary" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
