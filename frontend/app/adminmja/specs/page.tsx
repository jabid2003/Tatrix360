import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { getAdminProducts } from '@/lib/products';
import { DeleteProductButton } from '@/components/site/admin/delete-product-button';

export const dynamic = 'force-dynamic';

export default async function SpecsAdminPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const category = searchParams.category as 'mobile' | 'laptop' | 'gadget' | undefined;
  const q = searchParams.q;
  const products = await getAdminProducts({ category, search: q, limit: 100 });

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Specs Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} products — Mobiles, Laptops, Gadgets</p>
        </div>
        <Link href="/adminmja/specs/new" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:shadow-glow">
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[
            { key: undefined, label: 'All' },
            { key: 'mobile', label: 'Mobiles' },
            { key: 'laptop', label: 'Laptops' },
            { key: 'gadget', label: 'Gadgets' },
          ].map((f) => (
            <Link key={String(f.key)} href={`/adminmja/specs${f.key ? `?category=${f.key}` : ''}`} className={`flex-shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium ${category === f.key ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
              {f.label}
            </Link>
          ))}
        </div>
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Search name..." className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
          {category && <input type="hidden" name="category" value={category} />}
          <button className="flex-shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">Search</button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <p className="text-muted-foreground">No products found. Create your first product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {products.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3 min-w-0 flex-1">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted p-0.5">
                  {p.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnailUrl} alt={p.name} className="h-full w-auto object-contain" />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${p.category === 'mobile' ? 'bg-blue-500/10 text-blue-600' : p.category === 'laptop' ? 'bg-purple-500/10 text-purple-600' : 'bg-emerald-500/10 text-emerald-600'}`}>{p.category}</span>
                    {p.brand && <span className="text-xs text-muted-foreground">{p.brand}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${p.status === 'Published' ? 'bg-green-500/10 text-green-700' : 'bg-amber-500/10 text-amber-700'}`}>{p.status}</span>
                    {!p.isVisible && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground flex items-center gap-1"><EyeOff className="h-3 w-3" /> Hidden</span>}
                  </div>
                  <h3 className="mt-1 truncate font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono truncate">/{p.slug} · {p.priceText ?? '—'} {p.isExpectedPrice ? '(Expected)' : ''} · {p.specs.length} sections</p>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2 overflow-x-auto scrollbar-hide">
                <Link href={`/specs/${p.category === 'mobile' ? 'mobiles' : p.category === 'laptop' ? 'laptops' : 'gadgets'}/${p.slug}`} target="_blank" className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"><Eye className="h-3.5 w-3.5" /> View</Link>
                <Link href={`/adminmja/specs/${p.id}/edit`} className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                <DeleteProductButton id={p.id} name={p.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
