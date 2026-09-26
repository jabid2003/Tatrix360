'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Link2, X, Search, Check } from 'lucide-react';

export interface LinkedProduct {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  category: string;
  price_text?: string | null;
  thumbnail_url?: string | null;
  images?: string[] | null;
}

interface ProductLinkPickerProps {
  value: LinkedProduct | null;
  onSelect: (p: LinkedProduct | null) => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  mobile: 'Mobile',
  laptop: 'Laptop',
  gadget: 'Gadget',
};

/**
 * Single-select spec-product picker for listicle items. Picking a product
 * links the item to the live catalog entry — the same product can be linked
 * from unlimited articles (e.g. "Best phones under 20000" and
 * "Top 5 camera phones").
 */
export function ProductLinkPicker({ value, onSelect }: ProductLinkPickerProps) {
  const [products, setProducts] = useState<LinkedProduct[]>([]);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  function ensureLoaded() {
    if (loaded || loading) return;
    setLoading(true);
    fetch('/api/admin/products?limit=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.products)) {
          setProducts(data.products);
          setLoaded(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (open) ensureLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  const q = query.trim().toLowerCase();
  const candidates = useMemo(
    () =>
      products
        .filter((p) => !catFilter || p.category === catFilter)
        .filter(
          (p) =>
            q === '' ||
            p.name.toLowerCase().includes(q) ||
            (p.brand ?? '').toLowerCase().includes(q)
        )
        .slice(0, 20),
    [products, catFilter, q]
  );

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2">
        {(value.thumbnail_url || value.images?.[0]) && (
          <span className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            <Image src={value.thumbnail_url || value.images![0]} alt="" width={32} height={32} className="h-full w-auto object-contain p-0.5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{value.name}</p>
          <p className="text-[11px] text-muted-foreground">
            Linked product · {CATEGORY_LABEL[value.category] ?? value.category}
            {value.price_text ? ` · ${value.price_text}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="flex-shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Unlink product"
          title="Unlink (keeps the typed fields)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); ensureLoaded(); }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Link2 className="h-4 w-4" />
        {open ? 'Hide product catalog' : 'Link an existing spec product…'}
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-border p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {['', 'mobile', 'laptop', 'gadget'].map((c) => (
              <button
                key={c || 'all'}
                type="button"
                onClick={() => setCatFilter(c)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  catFilter === c ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {c === '' ? 'All' : CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by name or brand…"
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          {loading ? (
            <p className="py-3 text-center text-xs text-muted-foreground">Loading products…</p>
          ) : candidates.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted-foreground">No matching products.</p>
          ) : (
            <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto">
              {candidates.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => { onSelect(p); setOpen(false); setQuery(''); }}
                    className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {CATEGORY_LABEL[p.category] ?? p.category}
                        {p.brand ? ` · ${p.brand}` : ''}
                        {p.price_text ? ` · ${p.price_text}` : ''}
                      </p>
                    </div>
                    <span className="flex flex-shrink-0 items-center gap-1 text-xs font-medium text-primary">
                      <Check className="h-3.5 w-3.5" /> Select
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Selecting fills title, brand, price and image from the product (only empty fields). The item stays linked for live specs + View Full Specs.
          </p>
        </div>
      )}
    </div>
  );
}
