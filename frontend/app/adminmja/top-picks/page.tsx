import { getAdminProducts, getTopPicks } from '@/lib/products';
import { TopPicksManager } from '@/components/site/admin/top-picks-manager';

export const dynamic = 'force-dynamic';

export default async function TopPicksPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const raw = searchParams.category;
  const category = (raw === 'laptop' ? 'laptop' : raw === 'gadget' ? 'gadget' : 'mobile') as 'mobile' | 'laptop' | 'gadget';

  const [allProducts, picks] = await Promise.all([
    getAdminProducts({ category, limit: 100 }),
    getTopPicks(category),
  ]);

  // Resolve picked products in order
  const { supabaseAdmin } = await import('@/lib/supabase-admin');
  let orderedProducts: any[] = [];
  if (picks.length > 0) {
    const ids = picks.map((p) => p.productId);
    const { data } = await supabaseAdmin.from('products').select('*').in('id', ids);
    const map = new Map((data ?? []).map((r: any) => [r.id, r]));
    orderedProducts = picks.map((p) => map.get(p.productId)).filter(Boolean);
  }

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Select Top’s</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose category, pick 5 or 10 products, arrange order, and publish together on one Top page.</p>
      </div>
      <TopPicksManager initialCategory={category} initialAll={allProducts} initialPicks={orderedProducts} />
    </main>
  );
}
