import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminArticleById } from '@/lib/sections';
import { getArticleItemsAdmin } from '@/lib/article-items';
import { ArticleItemsManager } from '@/components/site/admin/article-items-manager';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function ArticleItemsPage({ params }: PageProps) {
  const [article, items] = await Promise.all([
    getAdminArticleById(params.id),
    getArticleItemsAdmin(params.id),
  ]);

  if (!article) notFound();

  return (
    <main className="container-page max-w-5xl py-8 sm:py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <Link href="/adminmja" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">← Articles</Link>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Items: {article.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage product/list items for this article. Use the arrows to reorder, click a row to expand.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {article.articleType === 'listicle' ? 'Listicle' : 'Standard'}
        </span>
      </div>

      {article.articleType !== 'listicle' ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <p className="text-muted-foreground mb-4">This article is not a listicle type.</p>
          <p className="text-sm text-muted-foreground">Change the article type to "Listicle" in the editor to enable item management.</p>
        </div>
      ) : (
        <ArticleItemsManager articleId={article.id} initialItems={items} articleTitle={article.title} />
      )}
    </main>
  );
}