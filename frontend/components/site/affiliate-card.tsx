import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';

type AffiliateProduct = {
  image?: string;
  name: string;
  description: string;
  specs: string[];
  amazonUrl?: string;
  flipkartUrl?: string;
};

export function AffiliateCard({ product }: { product: AffiliateProduct }) {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-accent/40 to-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-lg bg-muted p-0.5 sm:w-32">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              sizes="(max-width: 640px) 100vw, 128px"
              className="h-full w-auto object-contain"
              width={128}
              height={128}
            />
          ) : null}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
              Editor&apos;s pick
            </span>
            <span className="text-xs text-muted-foreground">affiliate</span>
          </div>

          <h4 className="mt-2 font-serif text-lg font-bold">{product.name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {product.specs.map((s) => (
              <li
                key={s}
                className="rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground/80"
              >
                {s}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.amazonUrl && (
              <a
                href={product.amazonUrl}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Check price on Amazon
              </a>
            )}

            {product.flipkartUrl && (
              <a
                href={product.flipkartUrl}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2874f0] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1a5fc4]"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Check price on Flipkart
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}