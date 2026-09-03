export const revalidate = 60;

import type { Metadata } from 'next';
import { getInitialOSPosts, getTrendingPosts } from '@/lib/data';
import { OSPageClient } from '@/components/site/os-page-client';

export const metadata: Metadata = {
  title: 'Operating Systems',
  description: 'Latest news and updates from the world of operating systems — Android, iOS, Windows, macOS, Linux and more.',
};

export default async function OSPage() {
  const [initialPosts, trending] = await Promise.all([
    getInitialOSPosts(),
    getTrendingPosts(5),
  ]);

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-muted/30">
        <div className="container-page py-8 sm:py-10">
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Operating Systems
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stay updated on Android, iOS, Windows, macOS, Linux and more.
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OSPageClient initialPosts={initialPosts} />
          </div>
          <aside className="flex flex-col gap-6">
            <div className="card rounded-2xl p-5">
              <h3 className="mb-2 section-label">New Articles</h3>
              <div className="divide-y divide-border">
                {trending.slice(0, 5).map((post, i) => (
                  <div key={post.id} className="flex items-start gap-4 py-3">
                    <span className="font-serif text-xl font-bold text-muted-foreground/30">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <a
                        href={`/${post.category?.slug}/${post.slug}`}
                        className="block text-sm font-medium leading-snug transition-colors hover:text-primary"
                      >
                        {post.title}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
