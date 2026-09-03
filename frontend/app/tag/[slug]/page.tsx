import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { getTags, getPostsByTag } from '@/lib/data';
import { PostCard } from '@/components/site/post-card';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const tags = await getTags();
  const tag = tags.find((t) => t.slug === params.slug);

  if (!tag) return {};

  return {
    title: `${tag.name} articles — Tatrix360`,
    description: `Browse all ${tag.name} articles, news, guides, and reviews on Tatrix360.`,
    alternates: { canonical: `/tag/${tag.slug}` },
  };
}

export default async function TagPage({ params }: { params: { slug: string } }) {
  const [tags, result] = await Promise.all([
    getTags(),
    getPostsByTag(params.slug, 1, 48),
  ]);
  const tag = tags.find((t) => t.slug === params.slug);

  if (!tag || result.posts.length === 0) {
    notFound();
  }

  return (
    <main className="container-page py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="mt-6 max-w-3xl">
        <p className="section-label text-primary">Tag</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          #{tag.name}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {result.total} {result.total === 1 ? 'article' : 'articles'} tagged with #{tag.name}.
        </p>
      </div>

      {result.posts.length > 0 && (
        <section className="mt-10">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {result.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}