export const revalidate = 60;

import type { Metadata } from 'next';
import { getInitialTypePosts, getTrendingPosts } from '@/lib/data';
import { MobilePageClient } from '@/components/site/mobile-page-client';

export const metadata: Metadata = {
  title: 'Mobile Phones',
  description: 'Latest mobile phone news, launches, reviews, and opinions.',
};

export default async function MobilePage() {
  const [initialPosts, trending] = await Promise.all([
    getInitialTypePosts(),
    getTrendingPosts(5),
  ]);

  const sidebarLinks = [
    { label: 'Best Phones Under ₹10,000', href: '/mobile/best-phones-under-10000' },
    { label: 'Best Phones Under ₹20,000', href: '/mobile/best-phones-under-20000' },
    { label: 'Best Phones Under ₹30,000', href: '/mobile/best-phones-under-30000' },
    { label: 'Upcoming Phones', href: '/mobile/upcoming-phones' },
    { label: 'Latest Phones', href: '/mobile/latest-phones' },
  ];

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-muted/30">
        <div className="container-page py-8 sm:py-10">
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Mobile Phones
          </h1>
          <p className="mt-2 text-muted-foreground">
            News, reviews, and everything mobile.
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MobilePageClient initialPosts={initialPosts} />
          </div>
          <aside className="flex flex-col gap-6">
            <div className="card rounded-2xl p-5">
              <h3 className="mb-3 section-label">Popular Lists</h3>
              <ul className="space-y-1">
                {sidebarLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card rounded-2xl p-5">
              <h3 className="mb-2 section-label">Trending now</h3>
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
