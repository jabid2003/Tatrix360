import Link from 'next/link';
import { Flame } from 'lucide-react';
import { getTopArticles } from '@/lib/sections';

// Homepage shortcut box: compact text list of admin-pinned top articles,
// each linking to its original article page.
export async function TopArticles() {
  const articles = await getTopArticles(10).catch(() => []);

  if (articles.length === 0) return null;

  return (
    <section className="container-page py-8" aria-label="Top Articles">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
          <Flame className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-lg font-bold tracking-tight">Top Articles</h2>
        </div>
        <ol className="divide-y divide-border">
          {articles.map((article, i) => {
            const href = article.mainCategory
              ? `/${article.mainCategory.slug}/${article.slug}`
              : null;
            return (
              <li key={article.id}>
                {href ? (
                  <Link
                    href={href}
                    className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:px-5"
                  >
                    <span
                      aria-hidden="true"
                      className="flex-shrink-0 font-serif text-base font-bold text-muted-foreground transition-colors group-hover:text-primary"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block text-sm font-medium leading-snug transition-colors group-hover:text-primary">
                        {article.title}
                      </span>
                      {article.mainCategory && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {article.mainCategory.displayName}
                          {article.section ? ` · ${article.section.title}` : ''}
                        </span>
                      )}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 px-4 py-3 sm:px-5">
                    <span aria-hidden="true" className="flex-shrink-0 font-serif text-base font-bold text-muted-foreground">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="line-clamp-2 block text-sm font-medium leading-snug">
                      {article.title}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
