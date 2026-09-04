import type { Metadata } from 'next';
import { getPosts } from '@/lib/data';
import { LatestPosts } from '@/components/site/latest-posts';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Latest',
  description: 'The latest stories, guides, reviews, and explainers from Tatrix360.',
  alternates: { canonical: '/latest' },
  openGraph: {
    title: 'Latest — Tatrix360',
    description: 'The latest stories, guides, reviews, and explainers from Tatrix360.',
    url: '/latest',
  },
};

export default async function LatestPage() {
  const posts = await getPosts({ pageSize: 50 });

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-8">
        <p className="section-label text-primary">Latest</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Latest stories
        </h1>
        <p className="mt-3 text-muted-foreground">
          The latest stories, guides, reviews, and explainers from Tatrix360.
        </p>
      </div>

      {posts.length > 0 ? (
        <LatestPosts all={posts} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <p className="text-muted-foreground">No latest stories found.</p>
        </div>
      )}
    </main>
  );
}
