import Image from 'next/image';
import Link from 'next/link';
import { getPosts, getTrendingPosts, getMenu, getCategories } from '@/lib/strapi';
import { PostCard, TrendingCard } from '@/components/site/post-card';
import { NewsletterBox } from '@/components/site/newsletter-box';
import { AdSlot } from '@/components/site/ad-slot';
import { formatDate } from '@/lib/utils';
import { Clock, Eye, ArrowRight, Flame, Zap } from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, trending, menu, categories] = await Promise.all([
    getPosts({ featured: true, pageSize: 1 }),
    getPosts({ pageSize: 7 }),
    getTrendingPosts(5),
    getMenu(),
    getCategories(),
  ]);

  const hero = featured[0] || latest[0];
  const secondary = latest.filter((p) => p.id !== hero?.id).slice(0, 2);
  const rest = latest.filter((p) => p.id !== hero?.id && !secondary.includes(p)).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      {hero && (
        <section className="relative overflow-hidden border-b border-border">
          <div className="hero-glow" />
          <div className="container-page relative py-8 sm:py-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
              {/* Main hero article */}
              <Link
                href={`/${hero.category?.slug}/${hero.slug}`}
                className="group relative col-span-1 flex flex-col overflow-hidden rounded-3xl border border-border bg-card lg:col-span-3 lg:row-span-2"
              >
                <div className="relative overflow-hidden bg-muted/30">
                  {hero.heroImage ? (
                    <Image
                      src={hero.heroImage}
                      alt={hero.title}
                      width={1200}
                      height={800}
                      priority
                      className="h-auto w-full transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    {hero.category && (
                      <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                        {hero.category.name}
                      </span>
                    )}
                    <h1 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl lg:text-balance">
                      {hero.title}
                    </h1>
                    {hero.subtitle && (
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/80 sm:text-base">
                        {hero.subtitle}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-3 text-xs text-white/70">
                      {hero.author && <span className="font-medium text-white/90">{hero.author.name}</span>}
                      <span>{formatDate(hero.publishedAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />5 min</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{hero.views ?? 0}</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Secondary hero articles */}
              {secondary.map((post) => (
                <Link
                  key={post.id}
                  href={`/${post.category?.slug}/${post.slug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 lg:col-span-2"
                >
                  <div className="relative overflow-hidden rounded-xl bg-muted/30">
                    {post.heroImage ? (
                      <Image
                        src={post.heroImage}
                        alt={post.title}
                        width={800}
                        height={500}
                        className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                    {post.category && (
                      <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur-sm">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-bold leading-snug tracking-tight transition-colors group-hover:text-primary lg:text-lg">
                      {post.title}
                    </h2>
                    {post.subtitle && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.subtitle}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views ?? 0}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Trending strip under secondary */}
              <div className="hidden rounded-2xl border border-border bg-card p-5 lg:col-span-2 lg:block">
                <div className="mb-2 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trending now</h3>
                </div>
                <div className="divide-y divide-border">
                  {trending.slice(0, 3).map((post, i) => (
                    <TrendingCard key={post.id} post={post} rank={i + 1} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest + Sidebar */}
      <div className="container-page grid grid-cols-1 gap-10 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" fill="currentColor" />
              <h2 className="font-serif text-2xl font-bold tracking-tight">Latest stories</h2>
            </div>
            <Link href="/search" className="flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-80">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {rest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          {/* Categories */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Trending (mobile/tablet) */}
          <div className="rounded-2xl border border-border bg-card p-5 lg:hidden">
            <div className="mb-2 flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trending now</h3>
            </div>
            <div className="divide-y divide-border">
              {trending.map((post, i) => (
                <TrendingCard key={post.id} post={post} rank={i + 1} />
              ))}
            </div>
          </div>

          <AdSlot />
          <NewsletterBox variant="compact" />
        </aside>
      </div>

      {/* Newsletter CTA */}
      <div className="container-page pb-16">
        <NewsletterBox />
      </div>
    </div>
  );
}
