import { notFound } from 'next/navigation';
import { getPosts, getCategories } from '@/lib/data';
import { PostCard } from '@/components/site/post-card';

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getCategories();

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === params.slug);

  return {
    title: category?.name,
    description: category?.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const [posts, categories] = await Promise.all([
    getPosts({
      categorySlug: params.slug,
      pageSize: 20,
    }),
    getCategories(),
  ]);

  const category = categories.find((item) => item.slug === params.slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="container-page py-8">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">
          {category.name}
        </h1>

        {category.description && (
          <p className="mt-2 text-lg text-muted-foreground">
            {category.description}
          </p>
        )}
      </header>

      {posts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No articles in this category yet.
        </p>
      )}
    </main>
  );
}