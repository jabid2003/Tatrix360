import { notFound } from 'next/navigation';
import { getPostById, getCategories, getAuthors, getAdminPosts, getTags, getSubcategories } from '@/lib/data';
import { ArticleForm } from '@/components/site/admin/article-form';

interface EditArticlePageProps {
  params: { id: string };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const postId = parseInt(params.id, 10);

  if (isNaN(postId)) {
    notFound();
  }

  const [post, categories, authors, allPosts, allTags, subcategories] = await Promise.all([
    getPostById(postId),
    getCategories(),
    getAuthors(),
    getAdminPosts(),
    getTags(),
    getSubcategories(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <main className="container-page max-w-3xl py-8 sm:py-12">
      <h1 className="mb-8 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
        Edit Article
      </h1>

      <ArticleForm
        categories={categories}
        subcategories={subcategories}
        authorNames={authors.map((a) => a.name)}
        mode="edit"
        postId={postId}
        initialPost={post}
        allPosts={allPosts}
        allTags={allTags}
      />
    </main>
  );
}
