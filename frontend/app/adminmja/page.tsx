import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { getAdminArticles } from '@/lib/sections';
import { ArticleBulkManager } from '@/components/site/admin/article-bulk-manager';

export const dynamic = 'force-dynamic';

const FILTERS: { key: string; label: string; hint?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'latest', label: 'Latest' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'draft', label: 'Drafts' },
  { key: 'hidden', label: 'Hidden' },
  { key: 'listicle', label: 'Listicles' },
];

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { filter?: string; q?: string };
}) {
  const filter = searchParams.filter ?? 'all';
  const q = (searchParams.q ?? '').trim().toLowerCase();

  const articles = await getAdminArticles(
    filter === 'published'
      ? { status: 'Published' }
      : filter === 'latest'
        ? { onlyLatest: true }
        : filter === 'pinned'
          ? { onlyPinned: true }
          : filter === 'draft'
            ? { status: 'Draft' }
            : filter === 'hidden'
              ? { hidden: true }
              : filter === 'listicle'
                ? { articleType: 'listicle' }
                : {}
  );

  // Admin global search (A5): title + slug, applied after the tab filter.
  const visible = q
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q)
      )
    : articles;

  const counts = filter === 'all' ? articles.length : undefined;

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Articles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            {counts !== undefined ? ' total' : ` — ${filter}`}
          </p>
        </div>

        <Link
          href="/adminmja/posts/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      <nav className="mb-4 flex flex-wrap gap-1.5" aria-label="Article filters">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/adminmja?filter=${f.key}${q ? `&q=${encodeURIComponent(searchParams.q ?? '')}` : ''}`}
            aria-current={filter === f.key ? 'page' : undefined}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {/* Admin search across titles + slugs */}
      <form method="GET" action="/adminmja" className="mb-6 flex gap-2">
        <input type="hidden" name="filter" value={filter} />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Search articles by title or slug..."
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
        >
          Search
        </button>
        {q && (
          <Link
            href={`/adminmja?filter=${filter}`}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Clear
          </Link>
        )}
      </form>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <p className="text-muted-foreground">
            {filter === 'all'
              ? 'No articles yet. Create sections first, then publish your first article.'
              : `No articles match the "${filter}" filter.`}
          </p>
          {filter === 'all' && (
            <Link
              href="/adminmja/sections"
              className="mt-4 inline-block rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              Manage sections
            </Link>
          )}
        </div>
      ) : (
        <ArticleBulkManager articles={visible} />
      )}
    </main>
  );
}