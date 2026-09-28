import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
 *
 * Card hierarchy (strict): Image -> Title -> Subtitle/Description -> Price -> CTA.
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
        <div key={g.cat} className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</h3>
            <Link href={g.href} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all {g.label.replace('Related ', '')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_12px_-4px_rgb(0_0_0/0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_16px_40px_-12px_rgb(0_0_0/0.20)]"
              >
                <Link
                  href={specHref(p)}
                  aria-label={`View full specs: ${p.name}`}
                  className="relative flex aspect-[4/3] items-center justify-center bg-muted/40 p-3"
                >
                  {p.thumbnailUrl || p.images[0] ? (
                    <Image
                      src={p.thumbnailUrl || p.images[0]}
                      alt={p.name}
                      width={360}
                      height={270}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full rounded-xl bg-muted" />
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <Link href={specHref(p)} className="transition-colors hover:text-primary">
                    <h4 className="line-clamp-2 font-serif text-lg font-bold leading-snug tracking-tight">
                      {p.name}
                    </h4>
                  </Link>

                  {p.brand && (
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {p.brand}
                    </p>
                  )}
                  {p.shortDescription && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {p.shortDescription}
                    </p>
                  )}

                  {p.priceText && (
                    <p className="mt-3 text-lg font-bold">
                      {p.priceText}{' '}
                      {p.isExpectedPrice && (
                        <span className="text-xs font-normal text-muted-foreground">(Expected)</span>
                      )}
                    </p>
                  )}

                  <div className="mt-auto pt-4">
                    <Link
                      href={specHref(p)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      View Full Specs <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
