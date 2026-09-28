import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/products';

const GROUPS = [
  { cat: 'mobile', label: 'Related Mobiles', href: '/specs/mobiles' },
  { cat: 'laptop', label: 'Related Laptops', href: '/specs/laptops' },
  { cat: 'gadget', label: 'Related Gadgets', href: '/specs/gadgets' },
] as const;

const SPECS_SLUG: Record<string, string> = {
  mobile: 'mobiles',
  laptop: 'laptops',
  gadget: 'gadgets',
};

function specHref(p: Product): string {
  return `/specs/${SPECS_SLUG[p.category] ?? p.category}/${p.slug}`;
}

/**
 * Related products picked in the article editor, grouped by product
 * category — mobiles link into /specs/mobiles, laptops into
 * /specs/laptops, gadgets into /specs/gadgets.
 */
export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  const groups = GROUPS
    .map((g) => ({ ...g, items: products.filter((p) => p.category === g.cat) }))
    .filter((g) => g.items.length > 0);
  if (groups.length === 0) return null;

  return (
    <section className="mx-auto mt-16 max-w-4xl border-t border-border pt-10" aria-label="Related products">
      <h2 className="font-serif text-xl font-bold tracking-tight">Related Products</h2>
      {groups.map((g) => (
        <div key={g.cat} className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</h3>
            <Link href={g.href} className="text-xs font-medium text-primary hover:underline">
              View all {g.label.replace('Related ', '')} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {g.items.map((p) => (
              <Link
                key={p.id}
                href={specHref(p)}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:bg-muted/40"
              >
                <div className="relative aspect-[4/3] bg-muted p-1">
                  {p.thumbnailUrl || p.images[0] ? (
                    <Image
                      src={p.thumbnailUrl || p.images[0]}
                      alt={p.name}
                      width={300}
                      height={225}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  {p.brand && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{p.brand}</p>
                  )}
                  <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                    {p.name}
                  </p>
                  {p.priceText && (
                    <p className="mt-1 text-xs font-bold">{p.priceText}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
