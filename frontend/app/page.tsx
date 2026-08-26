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
import { InstallButton } from '@/components/site/install-button';
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
  Rss,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
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
      {/* ═══════════════════════════════════════════════════
          HERO SECTION — SaaS-style mesh + gradient
         ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-border/40 hero-mesh">
        {/* Animated grid overlay */}
        <div className="absolute inset-0 hero-grid opacity-40 dark:opacity-20" />

        {/* Floating glow orbs */}
        <div className="hero-glow" />

        <div className="container-page relative py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="animate-in-up stagger-1 mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Your daily tech briefing
            </div>

            {/* Headline */}
            <h1 className="animate-in-up stagger-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl lg:text-balance">
              Tech,{' '}
              <span className="gradient-text">decoded.</span>
            </h1>

            {/* Subtitle */}
            <p className="animate-in-up stagger-3 mx-auto mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Sharp reporting on AI, gadgets, and the platforms shaping our digital lives. No fluff, just signal.
            </p>

            {/* CTA row */}
            <div className="animate-in-up stagger-4 mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/latest"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
              >
                Read latest
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
              >
                <Mail className="h-4 w-4" />
                Subscribe free
              </Link>
            </div>

            {/* Trust badges */}
            <div className="animate-in-up stagger-5 mt-10 flex flex-wrap items-center justify-center gap-3">
              <span className="trust-badge">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No spam, ever
              </span>
              <span className="trust-badge">
                <Rss className="h-4 w-4 text-primary" />
                RSS feed available
              </span>
              <span className="trust-badge">
                <Shield className="h-4 w-4 text-primary" />
                Independent &amp; ad-free
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="animate-in-up stagger-6 mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="font-serif text-2xl font-bold text-foreground sm:text-3xl">50+</p>
              <p className="mt-1 text-xs text-muted-foreground">Articles published</p>
            </div>
            <div className="stat-card">
              <p className="font-serif text-2xl font-bold text-primary sm:text-3xl">5</p>
              <p className="mt-1 text-xs text-muted-foreground">Categories covered</p>
            </div>
            <div className="stat-card">
              <p className="font-serif text-2xl font-bold text-foreground sm:text-3xl">24/7</p>
              <p className="mt-1 text-xs text-muted-foreground">Always up to date</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURED STORY — Hero card with glass overlay
         ═══════════════════════════════════════════════════ */}
      {hero && (
        <section className="container-page -mt-6 relative z-10 pb-8">
          <Link
            href={`/${hero.category?.slug}/${hero.slug}`}
            className="group glass-card relative block overflow-hidden rounded-3xl"
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
                  placeholder="blur"
                  blurDataURL={getImageBlurUrl(hero.heroImage)}
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-14">
              {hero.category && (
                <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  {hero.category.name}
                </span>
              )}

              <h2 className="max-w-3xl font-serif text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl lg:text-balance">
                {hero.title}
              </h2>

              {hero.subtitle && (
                <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-white/80 sm:text-lg">
                  {hero.subtitle}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/70 sm:text-sm">
                {hero.author && (
                  <span className="font-medium text-white/90">
                    {hero.author.name}
                  </span>
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

      {/* ═══════════════════════════════════════════════════
          QUICK ACCESS — Glass cards
         ═══════════════════════════════════════════════════ */}
      <section className="container-page pb-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Link
            href="/search"
            className="group glass-card flex items-center gap-3 rounded-xl p-4"
          >
            <div className="feature-icon">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Search</p>
              <p className="text-xs text-muted-foreground">Find stories</p>
            </div>
          </Link>

          <Link
            href="/subscribe"
            className="group glass-card flex items-center gap-3 rounded-xl p-4"
          >
            <div className="feature-icon">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Newsletter</p>
              <p className="text-xs text-muted-foreground">Weekly briefing</p>
            </div>
          </Link>

          <Link
            href="/category/ai"
            className="group glass-card flex items-center gap-3 rounded-xl p-4"
          >
            <div className="feature-icon">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Coverage</p>
              <p className="text-xs text-muted-foreground">Latest models</p>
            </div>
          </Link>

          <Link
            href="/category/deals"
            className="group glass-card flex items-center gap-3 rounded-xl p-4"
          >
            <div className="feature-icon">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Deals</p>
              <p className="text-xs text-muted-foreground">Vetted discounts</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          LATEST STORIES + SIDEBAR
         ═══════════════════════════════════════════════════ */}
      <div className="container-page grid grid-cols-1 gap-10 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" fill="currentColor" />
              <h2 className="font-serif text-2xl font-bold tracking-tight">
                Latest stories
              </h2>
            </div>

            <Link
              href="/latest"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {rest.slice(0, 4).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          {/* Categories */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="glass-card rounded-2xl p-5">
            <div className="mb-2 flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Trending now
              </h3>
            </div>
            <div className="divide-y divide-border/60">
              {trending.slice(0, 5).map((post, i) => (
                <TrendingCard key={post.id} post={post} rank={i + 1} />
              ))}
            </div>
          </div>

          <NewsletterBox variant="compact" />
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════
          WHY READ — Feature highlights
         ═══════════════════════════════════════════════════ */}
      <section className="container-page pb-16">
        <div className="rounded-3xl border border-border/40 bg-gradient-to-br from-primary/[0.03] via-card to-card p-8 sm:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Why readers{' '}
              <span className="gradient-text">trust Tatrix360</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              We cut through the noise so you don&apos;t have to.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass-card group rounded-2xl p-6 text-center">
              <div className="feature-icon mx-auto">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">AI-first coverage</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Deep dives into models, tools, and the companies building them. Updated daily.
              </p>
            </div>

            <div className="glass-card group rounded-2xl p-6 text-center">
              <div className="feature-icon mx-auto">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">Independently owned</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No VC funding, no sponsored content. Just honest reporting you can rely on.
              </p>
            </div>

            <div className="glass-card group rounded-2xl p-6 text-center">
              <div className="feature-icon mx-auto">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">Signal over noise</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Every story is curated, fact-checked, and written to save you time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          NEWSLETTER CTA
         ═══════════════════════════════════════════════════ */}
      <div className="container-page pb-16">
        <NewsletterBox />
      </div>
    </div>
  );
}
