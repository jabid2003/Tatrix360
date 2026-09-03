import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPosts, getCategories, getSubcategoriesByCategory } from '@/lib/data';
import { PostCard } from '@/components/site/post-card';

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
  const [posts, categories, subcategories] = await Promise.all([
    getPosts({ categorySlug: params.slug, pageSize: 20 }),
    getCategories(),
    getSubcategoriesByCategory(params.slug),
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

        {/* Menus / submenus section — View-all lands here */}
        {subcategories.length > 0 && (
          <section className="mb-10" aria-label="Sections">
            <p className="section-label mb-3">Browse {category.name}</p>
            <nav className="flex flex-wrap gap-2.5" aria-label="Subcategories">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${category.slug}/${sub.slug}`}
                  className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {sub.name}
                </Link>
              ))}
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                All {category.name}
              </Link>
            </nav>
          </section>
        )}

        {posts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
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
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${category.slug}/${sub.slug}`}
                  className="inline-flex items-center rounded-full border border-dashed border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {category.name} · {sub.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
