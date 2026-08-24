import { getCategories, getAuthors } from '@/lib/data';
import { ArticleForm } from '@/components/site/admin/article-form';

export default async function NewArticlePage() {
  const [categories, authors] = await Promise.all([getCategories(), getAuthors()]);

  return (
    <main className="container-page max-w-3xl py-8 sm:py-12">
      <h1 className="mb-8 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
        New Article
      </h1>

      <ArticleForm
        categories={categories}
        authorNames={authors.map((a) => a.name)}
        mode="create"
      />
    </main>
  );
}