'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Package, Plus, X, Search } from 'lucide-react';

interface PickerProduct {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  category: 'mobile' | 'laptop' | 'gadget' | string;
  price_text?: string | null;
  thumbnail_url?: string | null;
  images?: string[] | null;
}

interface RelatedProductsPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

const CATEGORY_SLUG: Record<string, string> = {
  mobile: 'mobiles',
  laptop: 'laptops',
  gadget: 'gadgets',
};

const CATEGORY_LABEL: Record<string, string> = {
  mobile: 'Mobile',
  laptop: 'Laptop',
  gadget: 'Gadget',
};

export function specHref(p: Pick<PickerProduct, 'category' | 'slug'>): string {
  return `/specs/${CATEGORY_SLUG[p.category] ?? p.category}/${p.slug}`;
}

export function RelatedProductsPicker({ value, onChange }: RelatedProductsPickerProps) {
  const [products, setProducts] = useState<PickerProduct[]>([]);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/products?limit=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.products)) setProducts(data.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const selected = value.map((id) => byId.get(id)).filter(Boolean) as PickerProduct[];
  const selectedIds = useMemo(() => new Set(value), [value]);

  const q = query.trim().toLowerCase();
  const candidates = products
    .filter((p) => !selectedIds.has(p.id))
    .filter((p) => !catFilter || p.category === catFilter)
    .filter((p) => q === '' || p.name.toLowerCase().includes(q) || (p.brand ?? '').toLowerCase().includes(q))
    .slice(0, 25);

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  function add(id: string) {
    if (selectedIds.has(id)) return;
    onChange([...value, id]);
    setQuery('');
  }

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Package className="h-4 w-4 text-primary" />
        Related Products
      </h3>
      <p className="text-xs text-muted-foreground">
        Pick products to show as &ldquo;Related products&rdquo; cards inside this article.
        Each card links to the product&apos;s spec page in its own category
        (mobile → Mobiles, laptop → Laptops, gadget → Gadgets).
      </p>

      {/* Selected list */}
      {selected.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {selected.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
            >
              <span className="flex-shrink-0 text-[10px] font-semibold text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              {(p.thumbnail_url || p.images?.[0]) && (
                <span className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image src={p.thumbnail_url || p.images![0]} alt="" width={32} height={32} className="h-full w-auto object-contain p-0.5" />
                </span>
              )}
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary flex-shrink-0">
                {CATEGORY_LABEL[p.category] ?? p.category}
              </span>
              <a
                href={specHref(p)}
                className="min-w-0 flex-1 truncate text-sm text-foreground underline underline-offset-2 hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
                title={`${p.brand ?? ''} ${p.name}`}
              >
                {p.name}
              </a>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="flex-shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${p.name} from Related Products`}
                title="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          No related products yet. Search below to add some.
        </p>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
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

      {/* Add search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all products to add…"
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {loading ? (
        <p className="py-2 text-center text-xs text-muted-foreground">Loading products…</p>
      ) : (
        candidates.length > 0 && (
          <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {candidates.map((p) => (
              <li key={p.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {CATEGORY_LABEL[p.category] ?? p.category}
                    {p.brand ? ` · ${p.brand}` : ''}
                    {p.price_text ? ` · ${p.price_text}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => add(p.id)}
                  className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
