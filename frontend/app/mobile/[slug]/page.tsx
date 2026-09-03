export const revalidate = 60;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostsByTag } from '@/lib/data';
import { HorizontalCard } from '@/components/site/horizontal-card';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const PRODUCT_LISTS: Record<string, { title: string; tagSlug: string; description: string }> = {
  'best-phones-under-10000': {
    title: 'Best Phones Under ₹10,000',
    tagSlug: 'phones-under-10000',
    description: 'The best budget smartphones you can buy under ₹10,000 in India.',
  },
  'best-phones-under-20000': {
    title: 'Best Phones Under ₹20,000',
    tagSlug: 'phones-under-20000',
    description: 'Top mid-range smartphones under ₹20,000 in India.',
  },
  'best-phones-under-30000': {
    title: 'Best Phones Under ₹30,000',
    tagSlug: 'phones-under-30000',
    description: 'Premium smartphones under ₹30,000 in India.',
  },
  'upcoming-phones': {
    title: 'Upcoming Phones',
    tagSlug: 'upcoming-phones',
    description: 'All the upcoming phone launches to watch out for.',
  },
  'latest-phones': {
    title: 'Latest Phones',
    tagSlug: 'latest-phones',
    description: 'The latest smartphones just launched in India.',
  },
};

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return Object.keys(PRODUCT_LISTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const config = PRODUCT_LISTS[params.slug];
  if (!config) return { title: 'Not Found' };
  return {
    title: config.title,
    description: config.description,
  };
}

export default async function MobileProductListPage({ params }: PageProps) {
  const config = PRODUCT_LISTS[params.slug];
  if (!config) notFound();

  const { posts, total } = await getPostsByTag(config.tagSlug, 1, 8);

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-muted/30">
        <div className="container-page py-8 sm:py-10">
          {/* Breadcrumbs */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/mobile" className="hover:text-foreground">Mobile</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{config.title}</span>
          </nav>

          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            {config.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{config.description}</p>
          {total > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">{total} articles</p>
          )}
        </div>
      </section>

      <div className="container-page py-8">
        {posts.length === 0 ? (
          <div className="card rounded-2xl p-10 text-center">
            <p className="text-muted-foreground">
              No articles found for this list yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-1 divide-y divide-border">
            {posts.map((post) => (
              <HorizontalCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
