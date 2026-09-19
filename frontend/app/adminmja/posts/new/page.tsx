import { getMainCategories } from '@/lib/sections';
import { NewArticleForm } from '@/components/site/admin/new-article-form';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const mainCategories = await getMainCategories();

  return (
    <main className="container-page max-w-3xl py-8 sm:py-12">
      <h1 className="mb-8 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
        New Article
      </h1>

      {mainCategories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <p className="text-muted-foreground">
            No main categories found. Run supabase/RESET_NEW_ARCHITECTURE.sql first.
          </p>
        </div>
      ) : (
        <NewArticleForm mainCategories={mainCategories} mode="create" />
      )}
    </main>
  );
}
