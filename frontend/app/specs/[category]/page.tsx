import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/products';

export const revalidate = 60;

const MAP: Record<string, { cat: 'mobile'|'laptop'|'gadget'; label: string }> = {
  mobiles: { cat: 'mobile', label: 'Mobiles' },
  laptops: { cat: 'laptop', label: 'Laptops' },
  gadgets: { cat: 'gadget', label: 'Gadgets' },
};

const REVERSE: Record<string, string> = { mobile: 'mobiles', laptop: 'laptops', gadget: 'gadgets' };

export async function generateMetadata({ params }: { params: { category: string } }) {
  const m = MAP[params.category];
  if (!m) return {};
  const title = `${m.label} Specs — Tatrix360`;
  const description = `Full specifications for ${m.label.toLowerCase()} on Tatrix360.`;
  return {
    title,
    description,
    alternates: { canonical: `/specs/${params.category}` },
    openGraph: { title, description, url: `/specs/${params.category}`, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function SpecsCategoryPage({ params }: { params: { category: string } }) {
  const mapped = MAP[params.category];
  if (!mapped) notFound();
  const { products } = await getProducts({ category: mapped.cat, limit: 50 });

  const topHref = `/top/${params.category}`;
  const catLabel = mapped.label;

  return (
    <main className="container-page py-8 sm:py-12">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link><span>/</span>
        <Link href="/specs" className="hover:text-foreground">Specs</Link><span>/</span>
        <span className="text-foreground">{catLabel}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{catLabel} Specs</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} products · Tap any card to view full specifications</p>
        </div>
        <Link href={topHref} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">View Top {catLabel}</Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <p className="text-muted-foreground">No {catLabel.toLowerCase()} yet. Add them in Specs Admin.</p>
          <Link href="/adminmja/specs" className="mt-3 inline-block text-sm text-primary hover:underline">Go to Specs Admin</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link key={p.id} href={`/specs/${params.category}/${p.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/20 hover:shadow-sm transition-all">
              <div className="relative aspect-[4/3] bg-muted p-0.5">
                {p.thumbnailUrl ? <Image src={p.thumbnailUrl} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" width={400} height={300} /> : p.images[0] ? <Image src={p.images[0]} alt={p.name} className="max-h-full max-w-full object-contain" width={400} height={300} /> : <div className="h-full w-full bg-muted" />}
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{p.brand ?? ''}</p>
                <h3 className="mt-1 line-clamp-2 font-semibold leading-tight group-hover:text-primary">{p.name}</h3>
                <p className="mt-1 text-sm font-bold">{p.priceText ?? '—'} {p.isExpectedPrice ? <span className="text-xs font-normal text-muted-foreground">(Expected)</span> : null}</p>
                {p.keySpecs.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.keySpecs.slice(0,4).map((k, i) => (
                      <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{k.value || k.label}</span>
                    ))}
                  </div>
                )}
                <span className="mt-3 inline-flex text-xs font-semibold text-primary group-hover:underline">View Full Specs →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
