import type { Metadata } from 'next';
import { getLatestArticlesPaginated, getPinnedArticles } from '@/lib/sections';
import { getLatestPostsPaginated } from '@/lib/data';
import { ArticleCard, type ArticleCardItem } from '@/components/site/article-card';
import { FadeInWhenVisible } from '@/components/site/fade-in-when-visible';
import { LatestFeed } from '@/components/site/latest-feed';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Latest',
  description: 'The latest stories, guides, reviews, and explainers from Tatrix360.',
  alternates: { canonical: '/latest' },
  openGraph: {
    title: 'Latest — Tatrix360',
    description: 'The latest stories, guides, reviews, and explainers from Tatrix360.',
    url: '/latest',
  },
};

const PAGE_SIZE = 6;

export default async function LatestPage() {
  // New-architecture article feed (admin marks articles as Latest).
  const [{ articles, total }, pinnedArticles] = await Promise.all([
    getLatestArticlesPaginated(PAGE_SIZE, 0),
    getPinnedArticles(10),
  ]);

  const initialArticles: ArticleCardItem[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    thumbnailUrl: a.thumbnailUrl,
    createdAt: a.publishedAt || a.createdAt,
    categorySlug: a.mainCategory?.slug ?? '',
  }));

  const pinnedItems: ArticleCardItem[] = pinnedArticles.slice(0, 3).map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    thumbnailUrl: a.thumbnailUrl,
    createdAt: a.publishedAt || a.createdAt,
    categorySlug: a.mainCategory?.slug ?? '',
  }));

  // Legacy fallback feed (old posts table) — used only when no new-arch
  // articles are marked Latest, so the page never renders empty.
  const legacy =
    articles.length === 0 || total === 0
      ? await getLatestPostsPaginated(PAGE_SIZE, 0)
      : { posts: [], total: 0 };

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-8">
        <p className="section-label text-primary">Latest</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Latest stories
        </h1>
        <p className="mt-3 text-muted-foreground">
          The latest stories, guides, reviews, and explainers from Tatrix360.
        </p>
      </div>

      {pinnedItems.length > 0 && (
        <section className="mb-8" aria-label="Pinned articles">
          <h2 className="font-serif text-xl font-bold tracking-tight mb-4">Pinned</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pinnedItems.map((a, i) => (
              <FadeInWhenVisible key={a.id} delay={i * 60}>
                <ArticleCard article={a} />
              </FadeInWhenVisible>
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 ? (
        <LatestFeed
          initialArticles={initialArticles}
          total={total}
          pageSize={PAGE_SIZE}
          source="articles"
        />
      ) : (
        <LatestFeed
          initialPosts={legacy.posts}
          total={legacy.total}
          pageSize={PAGE_SIZE}
          source="posts"
        />
      )}
    </main>
  );
}