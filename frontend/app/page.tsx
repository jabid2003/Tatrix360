export const revalidate = 60;

import Image from 'next/image';
import Link from 'next/link';

import {
  getPosts,
  getFeaturedPosts,
  getTrendingPosts,
  getCategories,
  getPostsByCategory,
} from '@/lib/data';

import { PostCard, TrendingCard } from '@/components/site/post-card';
import { HorizontalCard } from '@/components/site/horizontal-card';
import { Sidebar } from '@/components/site/sidebar';
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
  const [heroPosts, latest, trending, categories, aiPosts, gadgetsPosts] =
    await Promise.all([
      getFeaturedPosts(1),
      getPosts({ pageSize: 6 }),
      getTrendingPosts(5),
      getCategories(),
      getPostsByCategory('ai', 1, 3),
      getPostsByCategory('gadgets', 1, 3),
    ]);

  const hero = heroPosts[0] || latest[0];

  const rest = latest
    .filter((p) => p.id !== hero?.id)
    .slice(0, 4);

  const categorySidebarLinks = categories.map((cat) => ({
    label: cat.name,
    href: `/category/${cat.slug}`,
  }));

  return (
    <div className="flex flex-col">
      {/* Hero */}
      {hero && (
        <section className="border-b border-border">
          <div className="container-page py-8 sm:py-12">
            <Link
              href={`/${hero.category?.slug}/${hero.slug}`}
              className="group card relative block overflow-hidden"
            >
              <div className="relative h-[260px] overflow-hidden bg-muted sm:h-[360px] lg:h-[440px]">
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
                <h1 className="max-w-3xl font-serif text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl lg:text-balance">
                  {hero.title}
                </h1>
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
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="container-page py-6">
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

        <Sidebar
          trending={trending}
          links={categorySidebarLinks}
          linkTitle="Categories"
        />
      </div>

      {/* Category Sections */}
      {(aiPosts.posts.length > 0 || gadgetsPosts.posts.length > 0) && (
        <section className="container-page pb-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {aiPosts.posts.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-serif text-lg font-bold tracking-tight">AI</h2>
                  <Link href="/category/ai" className="text-sm font-medium text-primary hover:text-primary/80">
                    See all
                  </Link>
                </div>
                <div className="space-y-1 divide-y divide-border">
                  {aiPosts.posts.map((post) => (
                    <HorizontalCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
            {gadgetsPosts.posts.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-serif text-lg font-bold tracking-tight">Gadgets</h2>
                  <Link href="/category/gadgets" className="text-sm font-medium text-primary hover:text-primary/80">
                    See all
                  </Link>
                </div>
                <div className="space-y-1 divide-y divide-border">
                  {gadgetsPosts.posts.map((post) => (
                    <HorizontalCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why Trust */}
      <section className="container-page pb-10">
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
    </div>
  );
}
