import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getSubcategories, getPostsBySubcategory } from '@/lib/data';
import { SubcategoryPageClient } from '@/components/site/subcategory-page-client';

export const revalidate = 60;
export const dynamicParams = true;

interface PageProps {
  params: { slug: string; subcategory: string };
}

export async function generateStaticParams() {
  const subcategories = await getSubcategories();
  return subcategories
    .filter((s) => s.category?.slug)
    .map((s) => ({
      slug: s.category!.slug,
      subcategory: s.slug,
    }));
}

export async function generateMetadata({ params }: PageProps) {
  const subcategories = await getSubcategories();
  const sub = subcategories.find(
    (s) => s.slug === params.subcategory && s.category?.slug === params.slug
  );
  if (!sub) return { title: 'Not Found' };
  return {
    title: sub.name,
    description: sub.description,
  };
}

export default async function SubcategoryPage({ params }: PageProps) {
  const [subcategories, initial] = await Promise.all([
    getSubcategories(),
    getPostsBySubcategory(params.subcategory, 5, 0),
  ]);

  const sub = subcategories.find(
    (s) => s.slug === params.subcategory && s.category?.slug === params.slug
  );

  if (!sub || !sub.category) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-muted/30">
        <div className="container-page py-8 sm:py-10">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/category/${sub.category.slug}`} className="hover:text-foreground">
              {sub.category.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{sub.name}</span>
          </nav>

          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            {sub.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {sub.description ?? `Articles in ${sub.category.name} · ${sub.name}`}
          </p>
          {initial.total > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">{initial.total} articles</p>
          )}
        </div>
      </section>

      <div className="container-page py-8">
        <SubcategoryPageClient
          initialPosts={initial.posts}
          total={initial.total}
          subcategorySlug={sub.slug}
        />
      </div>
    </div>
  );
}