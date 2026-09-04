export const revalidate = 60;

import Link from 'next/link';

import {
  getPosts,
  getFeaturedPosts,
  getTrendingPosts,
  getCategories,
  getPostsByCategory,
} from '@/lib/data';

import { PostCard } from '@/components/site/post-card';
import { Sidebar } from '@/components/site/sidebar';
import { HeroCarousel } from '@/components/site/hero-carousel';
import { FadeInWhenVisible } from '@/components/site/fade-in-when-visible';

export default async function HomePage() {
  const [heroPosts, latest, trending, categories] = await Promise.all([
    getFeaturedPosts(5),
    getPosts({ pageSize: 12 }),
    getTrendingPosts(5),
    getCategories(),
  ]);

  // 2 latest cards per category
  const categoryPosts = await Promise.all(
    categories.map(async (cat) => {
      const res = await getPostsByCategory(cat.slug, 1, 2);
      return { category: cat, posts: res.posts };
    })
  );

  const hero = heroPosts.length > 0 ? heroPosts : latest.slice(0, 5);

  const heroIds = new Set(hero.map((p) => p.id));
  const rest = latest.filter((p) => !heroIds.has(p.id)).slice(0, 6);

  const categorySidebarLinks = categories.map((cat) => ({
    label: cat.name,
    href: `/category/${cat.slug}`,
  }));

  const populated = categoryPosts.filter((c) => c.posts.length > 0);

  return (
    <div className="flex flex-col">
      {/* Hero — top 5 latest featured with auto-slide */}
      <HeroCarousel posts={hero} />

      {/* Latest stories + Sidebar */}
      <div className="container-page grid grid-cols-1 gap-10 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold tracking-tight">Latest stories</h2>
            <Link href="/latest" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {rest.map((post, i) => (
              <FadeInWhenVisible key={post.id} delay={i * 60}>
                <PostCard post={post} />
              </FadeInWhenVisible>
            ))}
          </div>
        </div>

        <Sidebar
          trending={trending}
          links={categorySidebarLinks}
          linkTitle="Categories"
        />
      </div>

      {/* Categories — 2 latest cards per category */}
      {populated.length > 0 && (
        <section className="container-page py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold tracking-tight">By category</h2>
            <Link href="/latest" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              All latest
            </Link>
          </div>

          {populated.map(({ category, posts }) => (
            <div key={category.id} className="mb-8">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-serif text-lg font-bold tracking-tight">{category.name}</h3>
              </div>
              <FadeInWhenVisible>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </FadeInWhenVisible>
              <div className="mt-4 flex justify-start">
                <Link
                  href={`/category/${category.slug}`}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  Load more in {category.name}
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
