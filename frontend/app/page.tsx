
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Image from 'next/image';
import Link from 'next/link';
import { getPosts, getTrendingPosts, getCategories } from '@/lib/data';
import { PostCard, TrendingCard } from '@/components/site/post-card';
import { NewsletterBox } from '@/components/site/newsletter-box';
import { InstallButton } from '@/components/site/install-button';
import { formatDate } from '@/lib/utils';
import { Clock, Eye, ArrowRight, Flame, Zap, Rss, Mail, Search } from 'lucide-react';

// export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, trending, categories] = await Promise.all([
    getPosts({ featured: true, pageSize: 1 }),
    getPosts({ pageSize: 7 }),
    getTrendingPosts(5),
    getCategories(),
  ]);

  const hero = featured[0] || latest[0];
  const rest = latest.filter((p) => p.id !== hero?.id).slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* Install button row — sits between navbar and hero */}
      <div className="container-page flex items-center justify-end py-3">
        <InstallButton />
      </div>

      {/* Single hero card */}
      {hero && (
        <section className="container-page pb-8">
          <Link
            href={`/${hero.category?.slug}/${hero.slug}`}
            className="group relative block overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
          >
            <div className="relative h-[320px] overflow-hidden bg-muted/30 sm:h-[420px] lg:h-[520px]">
              {hero.heroImage ? (
                <Image
                  src={hero.heroImage}
                  alt={hero.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 100vw"
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-14">
              {hero.category && (
                <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  {hero.category.name}
                </span>
              )}
              <h1 className="max-w-3xl font-serif text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl lg:text-balance">
                {hero.title}
              </h1>
              {hero.subtitle && (
                <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-white/80 sm:text-lg">
                  {hero.subtitle}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3 text-xs text-white/70 sm:text-sm">
                {hero.author && <span className="font-medium text-white/90">{hero.author.name}</span>}
                <span>{formatDate(hero.publishedAt)}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />5 min</span>
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{hero.views ?? 0}</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Smaller CTA / quick-access cards */}
      <section className="container-page pb-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Link
            href="/search"
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Search</p>
              <p className="text-xs text-muted-foreground">Find stories</p>
            </div>
          </Link>

          <Link
            href="/subscribe"
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Newsletter</p>
              <p className="text-xs text-muted-foreground">Weekly briefing</p>
            </div>
          </Link>

          <Link
            href="/category/ai"
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="h-4 w-4" fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Coverage</p>
              <p className="text-xs text-muted-foreground">Latest models</p>
            </div>
          </Link>

          <Link
            href="/category/deals"
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Deals</p>
              <p className="text-xs text-muted-foreground">Vetted discounts</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Latest + Sidebar */}
      <div className="container-page grid grid-cols-1 gap-10 py-8 lg:grid-cols-3">
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
            {rest.slice(0, 4).map((post) => (
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

          {/* Trending */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trending now</h3>
            </div>
            <div className="divide-y divide-border">
              {trending.slice(0, 5).map((post, i) => (
                <TrendingCard key={post.id} post={post} rank={i + 1} />
              ))}
            </div>
          </div>

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
