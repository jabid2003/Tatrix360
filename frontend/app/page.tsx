export const revalidate = 60;

import Link from 'next/link';

import {
  getFeaturedPosts,
  getTrendingPosts,
  getLatestPosts,
} from '@/lib/data';
import { getMainCategories, HUB_LINKS, getLatestArticles } from '@/lib/sections';

import { PostCard } from '@/components/site/post-card';
import { Sidebar } from '@/components/site/sidebar';
import { HeroCarousel } from '@/components/site/hero-carousel';
import { FadeInWhenVisible } from '@/components/site/fade-in-when-visible';
import { TopArticles } from '@/components/site/top-articles';
import { ArticleCard, type ArticleCardItem } from '@/components/site/article-card';
import { LatestStoriesSection } from '@/components/site/latest-stories-section';
import { HomepageFeaturedSection } from '@/components/site/homepage-featured-section';

export default async function HomePage() {
  const [heroPosts, legacyLatest, latestArticles, trending, mainCategories] = await Promise.all([
    getFeaturedPosts(5),
    getLatestPosts(8),
    getLatestArticles(6),
    getTrendingPosts(5),
    getMainCategories().catch(() => []),
  ]);

  const hero = heroPosts.length > 0 ? heroPosts : legacyLatest.slice(0, 5);

  const heroIds = new Set(hero.map((p) => p.id));
  let rest = legacyLatest.filter((p) => !heroIds.has(p.id));
  if (rest.length === 0) rest = legacyLatest.slice(0, 3);
  rest = rest.slice(0, 3);

  const latestCards: ArticleCardItem[] = latestArticles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    thumbnailUrl: a.thumbnailUrl,
    createdAt: a.publishedAt || a.createdAt,
    categorySlug: a.mainCategory?.slug ?? '',
  }));

  // Stories for the carousel (same data, different shape)
  const carouselStories = latestArticles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    thumbnailUrl: a.thumbnailUrl,
    createdAt: a.publishedAt || a.createdAt,
    categorySlug: a.mainCategory?.slug ?? '',
  }));

  const hubs = mainCategories.length > 0
    ? mainCategories.map((c) => ({ label: c.displayName, href: `/${c.slug}` }))
    : HUB_LINKS.map((h) => ({ label: h.displayName, href: `/${h.slug}` }));

  return (
    <div className="flex flex-col">
      <HeroCarousel posts={hero} />

      {/* Latest stories — 4 cards, horizontal scroll on mobile */}
      {carouselStories.length > 0 && (
        <LatestStoriesSection stories={carouselStories} />
      )}

      {/* Featured articles by category (admin-curated) */}
      <HomepageFeaturedSection />

      {/* Latest stories grid + Sidebar */}
      <div className="container-page grid grid-cols-1 gap-10 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold tracking-tight">More to explore</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latestCards.length > 0
              ? latestCards.slice(0, 3).map((a, i) => (
                  <FadeInWhenVisible key={a.id} delay={i * 60}>
                    <ArticleCard article={a} />
                  </FadeInWhenVisible>
                ))
              : rest.map((post, i) => (
                  <FadeInWhenVisible key={post.id} delay={i * 60}>
                    <PostCard post={post} />
                  </FadeInWhenVisible>
                ))}
          </div>
        </div>

        <Sidebar
          trending={trending}
          links={hubs}
          linkTitle="Sections"
        />
      </div>

      {/* Top Articles — pinned shortcut box */}
      <TopArticles />
    </div>
  );
}
