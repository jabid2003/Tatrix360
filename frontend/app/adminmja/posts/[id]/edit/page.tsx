import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { getAdminArticleById, getAdminArticles, getMainCategories } from '@/lib/sections';
import { NewArticleForm } from '@/components/site/admin/new-article-form';

export const dynamic = 'force-dynamic';

interface EditArticlePageProps {
  params: { id: string };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const [article, mainCategories, allArticles] = await Promise.all([
    getAdminArticleById(params.id),
    getMainCategories(),
    getAdminArticles(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <main className="container-page max-w-3xl py-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Edit Article
        </h1>
        {article.articleType === 'listicle' && (
          <Link
            href={`/adminmja/posts/${article.id}/items`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Package className="h-4 w-4 text-primary" />
            Manage items
          </Link>
        )}
      </div>

      <NewArticleForm
        mainCategories={mainCategories}
        mode="edit"
        articleId={article.id}
        initialArticle={article}
        allArticles={allArticles}
      />
    </main>
  );
}