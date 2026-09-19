'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';
import { ArticleCard, type ArticleCardItem } from './article-card';

interface SectionGridProps {
  categorySlug: string;
  categoryName: string;
  sectionId: string;
  sectionTitle: string;
  sectionSlug: string;
  initialArticles: ArticleCardItem[];
  total: number;
  pageSize?: number;
  showViewAll?: boolean;
}

interface ApiArticle {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  createdAt: string | null;
  categorySlug: string | null;
  sectionSlug: string | null;
}

// One section block: h2 title, 3-col grid of cards, "View All" link to the
// section page, and a client-side "View More" button that appends the next
// offset batch (pageSize, offset X) without a page reload.
export function SectionGrid({
  categorySlug,
  categoryName,
  sectionId,
  sectionTitle,
  sectionSlug,
  initialArticles,
  total,
  pageSize = 6,
  showViewAll = true,
}: SectionGridProps) {
  const [articles, setArticles] = useState<ArticleCardItem[]>(initialArticles);
  const [loading, setLoading] = useState(false);

  const hasMore = articles.length < total;

  async function handleViewMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/articles?sectionId=${encodeURIComponent(sectionId)}&limit=${pageSize}&offset=${articles.length}`
      );
      const data = await res.json();
      if (data.ok && Array.isArray(data.articles)) {
        const next: ArticleCardItem[] = (data.articles as ApiArticle[]).map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          thumbnailUrl: a.thumbnailUrl ?? undefined,
          createdAt: a.createdAt ?? undefined,
          categorySlug: a.categorySlug ?? categorySlug,
        }));
        // De-dupe by id in case of concurrent clicks.
        setArticles((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...next.filter((n) => !seen.has(n.id))];
        });
      }
    } catch {
      // Keep existing articles on failure.
    } finally {
      setLoading(false);
    }
  }

  if (articles.length === 0) return null;

  return (
    <section aria-label={sectionTitle} className="mb-10">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <h2 className="font-serif text-lg font-bold tracking-tight sm:text-xl">
          {sectionTitle}
        </h2>
        {showViewAll && (
          <Link
            href={`/${categorySlug}/${sectionSlug}`}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-start">
          <button
            type="button"
            onClick={handleViewMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Loading…' : `View More in ${sectionTitle}`}
          </button>
        </div>
      )}

      <span className="sr-only">
        Showing {articles.length} of {total} in {categoryName} · {sectionTitle}
      </span>
    </section>
  );
}
