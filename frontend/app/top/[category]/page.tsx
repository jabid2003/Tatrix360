import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTopProducts, getTopListMeta } from '@/lib/products';

export const revalidate = 60;

const MAP: Record<string, { cat: 'mobile'|'laptop'|'gadget'; label: string }> = {
  mobiles: { cat: 'mobile', label: 'Mobiles' },
  laptops: { cat: 'laptop', label: 'Laptops' },
  gadgets: { cat: 'gadget', label: 'Gadgets' },
};

export async function generateMetadata({ params }: { params: { category: string } }) {
  const m = MAP[params.category];
  if (!m) return {};
  const title = `Top ${m.label} — Tatrix360`;
  const description = `Top ${m.label.toLowerCase()} curated by Tatrix360 — price, key specs and full specs.`;
  return {
    title,
    description,
    alternates: { canonical: `/top/${params.category}` },
    openGraph: { title, description, url: `/top/${params.category}`, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function TopPage({ params }: { params: { category: string } }) {
  const mapped = MAP[params.category];
  if (!mapped) notFound();
  const [products, about] = await Promise.all([
    getTopProducts(mapped.cat),
    getTopListMeta(mapped.cat),
  ]);

  return (
    <main className="container-page py-8 sm:py-12">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link><span>/</span>
        <span>Top</span><span>/</span><span className="text-foreground">{mapped.label}</span>
      </nav>

      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Top {mapped.label}</h1>
        {about ? (
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-foreground/90">{about}</p>
        ) : null}
        <p className="mt-1 text-sm text-muted-foreground">Curated by editors — {products.length ? `${products.length} ${products.length === 1 ? 'product' : 'products'}` : 'No picks published yet'}. Each card shows key specs with a link to full specifications.</p>
        <div className="mt-3 flex gap-2">
          <Link href={`/specs/${params.category}`} className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">View All Specs</Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <p className="text-muted-foreground">No Top {mapped.label} published yet. Use Select Top’s in admin to choose products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, idx) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-3 pt-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{idx+1}</span>
                {p.brand && <span className="text-xs font-semibold uppercase tracking-wider text-primary">{p.brand}</span>}
                <span className="ml-auto text-xs text-muted-foreground">{p.launchDateText ?? ''}</span>
              </div>
              <div className="relative aspect-[4/3] bg-muted mt-3 mx-3 rounded-xl p-0.5">
                {p.thumbnailUrl ? <Image src={p.thumbnailUrl} alt={p.name} className="max-h-full max-w-full object-contain" width={400} height={300} /> : p.images[0] ? <Image src={p.images[0]} alt={p.name} className="max-h-full max-w-full object-contain" width={400} height={300} /> : <div className="h-full w-full bg-muted" />}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold leading-tight line-clamp-2">{p.name}</h3>
                <p className="mt-1 text-sm font-bold">{p.priceText ?? '—'} {p.isExpectedPrice ? <span className="font-normal text-xs text-muted-foreground">(Expected)</span> : null}</p>
                {p.keySpecs.length > 0 ? (
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {p.keySpecs.slice(0,4).map((k,i) => (
                      <div key={i} className="rounded-lg bg-muted px-2 py-1.5">
                        <p className="text-xs font-semibold truncate">{k.value || k.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{k.sublabel || k.label}</p>
                      </div>
                    ))}
                  </div>
                ) : p.specs.length > 0 ? (
                  <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {p.specs.slice(0,2).map((s) => s.fields.slice(0,2).map((f) => f.value).join(' · ')).join(' · ')}
                  </div>
                ) : null}
                <Link href={`/specs/${params.category}/${p.slug}`} className="mt-3 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">View Full Specs</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
