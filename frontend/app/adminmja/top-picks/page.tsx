import { getAdminProducts } from '@/lib/products';
import { getMainCategories } from '@/lib/sections';
import { TopPicksManager } from '@/components/site/admin/top-picks-manager';

export const dynamic = 'force-dynamic';

export default async function TopPicksPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const raw = searchParams.category;
  const category = (raw === 'laptop' ? 'laptop' : raw === 'gadget' ? 'gadget' : 'mobile') as 'mobile' | 'laptop' | 'gadget';

  const [allProducts, mainCategories] = await Promise.all([
    getAdminProducts({ category, limit: 100 }),
    getMainCategories(),
  ]);

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Select Best Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">Name the list, write its description, pick products in order, and publish — a separate listicle article page is created. The same products can be reused in other lists.</p>
      </div>
      <TopPicksManager initialCategory={category} initialAll={allProducts} mainCategories={mainCategories} />
    </main>
  );
}
