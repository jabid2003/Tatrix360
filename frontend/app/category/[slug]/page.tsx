import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPosts, getCategories } from '@/lib/data';
import { PostCard } from '@/components/site/post-card';
import { FadeInWhenVisible } from '@/components/site/fade-in-when-visible';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
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
    openGraph: {
      title: category?.name,
      description: category?.description,
      type: 'website',
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const [posts, categories] = await Promise.all([
    getPosts({ categorySlug: params.slug, pageSize: 20 }),
    getCategories(),
  ]);

  const category = categories.find((item) => item.slug === params.slug);

  if (!category) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tatrix360.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: `${siteUrl}/category/${category.slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Tatrix360',
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="container-page py-8">
        <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/" className="transition-colors hover:text-foreground">Home</a>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

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
          <FadeInWhenVisible>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </FadeInWhenVisible>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
            <p className="text-muted-foreground">No articles in this category yet.</p>
          </div>
        )}

        {/* Read-more / explore links — before the footer ad */}
        {categories.length > 1 && (
          <section className="mt-14 border-t border-border pt-8" aria-label="Keep reading">
            <p className="section-label mb-4">Keep reading</p>
            <div className="flex flex-wrap gap-2.5">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
