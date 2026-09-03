export const revalidate = 60;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostsByTag } from '@/lib/data';
import { HorizontalCard } from '@/components/site/horizontal-card';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const PRODUCT_LISTS: Record<string, { title: string; tagSlug: string; description: string }> = {
  'best-laptops-under-30000': {
    title: 'Best Laptops Under ₹30,000',
    tagSlug: 'laptops-under-30000',
    description: 'The best budget laptops you can buy under ₹30,000 in India.',
  },
  'best-laptops-under-40000': {
    title: 'Best Laptops Under ₹40,000',
    tagSlug: 'laptops-under-40000',
    description: 'Top mid-range laptops under ₹40,000 in India.',
  },
  'best-laptops-under-50000': {
    title: 'Best Laptops Under ₹50,000',
    tagSlug: 'laptops-under-50000',
    description: 'Premium laptops under ₹50,000 in India.',
  },
  'best-laptops-under-60000': {
    title: 'Best Laptops Under ₹60,000',
    tagSlug: 'laptops-under-60000',
    description: 'High-performance laptops under ₹60,000 in India.',
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

export default async function LaptopProductListPage({ params }: PageProps) {
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
            <Link href="/laptop" className="hover:text-foreground">Laptop</Link>
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
