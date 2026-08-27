export const revalidate = 60;

import Image from 'next/image';
import Link from 'next/link';

import {
  getPosts,
  getTrendingPosts,
  getCategories,
} from '@/lib/data';

import {
  PostCard,
  TrendingCard,
} from '@/components/site/post-card';

import { NewsletterBox } from '@/components/site/newsletter-box';
import { formatDate, estimateReadingTime } from '@/lib/utils';
import { getImageBlurUrl } from '@/lib/image-utils';

import {
  Flame,
  Zap,
  Mail,
  Search,
  Clock,
  BrainCircuit,
  Shield,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default async function HomePage() {
  const [featured, latest, trending, categories] =
    await Promise.all([
      getPosts({ featured: true, pageSize: 1 }),
      getPosts({ pageSize: 7 }),
      getTrendingPosts(5),
      getCategories(),
    ]);

  const hero = featured[0] || latest[0];

  const rest = latest
    .filter((p) => p.id !== hero?.id)
    .slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-border bg-muted/30">
        <div className="container-page py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl lg:text-balance">
              Tech,{' '}
              <span className="text-primary">decoded.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Sharp reporting on AI, gadgets, and the platforms shaping our digital lives. No fluff, just signal.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/latest"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Read latest
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Mail className="h-4 w-4" />
                Subscribe free
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4">
            <div className="card p-4 text-center">
              <p className="font-serif text-2xl font-bold text-foreground sm:text-3xl">50+</p>
              <p className="mt-1 text-xs text-muted-foreground">Articles published</p>
            </div>
            <div className="card p-4 text-center">
              <p className="font-serif text-2xl font-bold text-primary sm:text-3xl">5</p>
              <p className="mt-1 text-xs text-muted-foreground">Categories covered</p>
            </div>
            <div className="card p-4 text-center">
              <p className="font-serif text-2xl font-bold text-foreground sm:text-3xl">24/7</p>
              <p className="mt-1 text-xs text-muted-foreground">Always up to date</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Story */}
      {hero && (
        <section className="container-page py-8">
          <Link
            href={`/${hero.category?.slug}/${hero.slug}`}
            className="group card relative block overflow-hidden"
          >
            <div className="relative h-[280px] overflow-hidden bg-muted sm:h-[380px] lg:h-[460px]">
              {hero.heroImage ? (
                <Image
                  src={hero.heroImage}
                  alt={hero.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 100vw"
                  placeholder="blur"
                  blurDataURL={getImageBlurUrl(hero.heroImage)}
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
              {hero.category && (
                <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  {hero.category.name}
                </span>
              )}
              <h2 className="max-w-3xl font-serif text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl lg:text-balance">
                {hero.title}
              </h2>
              {hero.subtitle && (
                <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/80 sm:text-base">
                  {hero.subtitle}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/70 sm:text-sm">
                {hero.author && (
                  <span className="font-medium text-white/90">{hero.author.name}</span>
                )}
                <span>{formatDate(hero.publishedAt)}</span>
                {hero.content && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {estimateReadingTime(hero.content)} min read
                  </span>
                )}
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Quick Access */}
      <section className="container-page pb-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link href="/search" className="group card card-hover flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Search</p>
              <p className="text-xs text-muted-foreground">Find stories</p>
            </div>
          </Link>
          <Link href="/subscribe" className="group card card-hover flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Newsletter</p>
              <p className="text-xs text-muted-foreground">Weekly briefing</p>
            </div>
          </Link>
          <Link href="/category/ai" className="group card card-hover flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Coverage</p>
              <p className="text-xs text-muted-foreground">Latest models</p>
            </div>
          </Link>
          <Link href="/category/deals" className="group card card-hover flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Deals</p>
              <p className="text-xs text-muted-foreground">Vetted discounts</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Latest Stories + Sidebar */}
      <div className="container-page grid grid-cols-1 gap-10 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" fill="currentColor" />
              <h2 className="font-serif text-xl font-bold tracking-tight">Latest stories</h2>
            </div>
            <Link href="/latest" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {rest.slice(0, 4).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="card rounded-2xl p-5">
            <h3 className="mb-3 section-label">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="rounded-full border border-border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="card rounded-2xl p-5">
            <div className="mb-2 flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <h3 className="section-label">Trending now</h3>
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

      {/* Why Trust */}
      <section className="container-page pb-16">
        <div className="rounded-2xl border border-border bg-muted/30 p-8 sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
              Why readers trust Tatrix360
            </h2>
            <p className="mt-2 text-muted-foreground">
              We cut through the noise so you don&apos;t have to.
            </p>
          </div>
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card group p-6 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold">AI-first coverage</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Deep dives into models, tools, and the companies building them. Updated daily.
              </p>
            </div>
            <div className="card group p-6 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold">Independently owned</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                No VC funding, no sponsored content. Just honest reporting you can rely on.
              </p>
            </div>
            <div className="card group p-6 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold">Signal over noise</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Every story is curated, fact-checked, and written to save you time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page pb-16">
        <NewsletterBox />
      </div>
    </div>
  );
}
