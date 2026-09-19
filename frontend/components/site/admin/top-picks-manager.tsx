'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GripVertical, Plus, Trash2, Loader2, ArrowUp, ArrowDown, Save, Smartphone, Laptop, Tablet, Search } from 'lucide-react';

type Cat = 'mobile' | 'laptop' | 'gadget';

interface ProductLite {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  category: string;
  price_text?: string | null;
  thumbnail_url?: string | null;
  images?: string[] | null;
}

export function TopPicksManager({
  initialCategory,
  initialAll,
  initialPicks,
}: {
  initialCategory: Cat;
  initialAll: any[];
  initialPicks: any[];
}) {
  const router = useRouter();
  const [category, setCategory] = useState<Cat>(initialCategory);
  const [all, setAll] = useState<ProductLite[]>(initialAll.map(mapLite));
  const [picked, setPicked] = useState<ProductLite[]>(initialPicks.map(mapLite));
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  function mapLite(r: any): ProductLite {
    return { id: r.id, name: r.name, slug: r.slug, brand: r.brand, category: r.category, price_text: r.price_text, thumbnail_url: r.thumbnail_url, images: r.images };
  }

  useEffect(() => {
    // fetch when category changes
    fetch(`/api/admin/products?category=${category}&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setAll(data.products.map(mapLite));
      });
    fetch(`/api/admin/top-picks?category=${category}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.picks) {
          const rows = data.picks.map((x: any) => x.product ?? x).filter(Boolean);
          // data.picks is like [{sort_order, product}] from GET? Actually our GET returns picks as mapped product rows.
          // For top-picks GET, picks is [{product:row}]? We used supabaseAdmin directly in page, but client fetch returns picks as enriched.
          // Simplify: if picks contain product field, extract.
          const prods: ProductLite[] = rows.map((r: any) => (r.product ? mapLite(r.product) : mapLite(r)));
          // fallback: fetch via picks array shape from page? We'll just keep initialPicks if fetch mismatch.
          if (prods.length > 0) setPicked(prods);
          else if (Array.isArray(data.picks) && data.picks.length === 0) setPicked([]);
        }
      });
    // also use router refresh to sync URL?
  }, [category]);

  function showFlash(kind: 'success' | 'error', text: string) {
    setFlash({ kind, text }); setTimeout(() => setFlash(null), 4000);
  }

  const pickedIds = new Set(picked.map((p) => p.id));
  const filteredAll = all.filter((p) => !pickedIds.has(p.id)).filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 30);

  function addProduct(p: ProductLite) {
    if (picked.length >= 10) { showFlash('error', 'Maximum 10 products. Remove one first.'); return; }
    setPicked((prev) => [...prev, p]);
  }
  function removeProduct(id: string) { setPicked((prev) => prev.filter((p) => p.id !== id)); }
  function move(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= picked.length) return;
    setPicked((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(newIdx, 0, item);
      return copy;
    });
  }

  async function handlePublish() {
    if (picked.length !== 5 && picked.length !== 10 && picked.length !== 0) {
      showFlash('error', 'Please select exactly 5 or 10 products (or 0 to clear). Currently: ' + picked.length);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/top-picks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, orderedIds: picked.map((p) => p.id) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { showFlash('error', data.error || 'Failed to publish'); return; }
      showFlash('success', `Published Top ${picked.length || 'cleared'} for ${category}`);
      router.refresh();
    } catch { showFlash('error', 'Failed'); } finally { setSaving(false); }
  }

  const label = category === 'mobile' ? 'Mobiles' : category === 'laptop' ? 'Laptops' : 'Gadgets';
  const pluralPath = category === 'mobile' ? 'mobiles' : category === 'laptop' ? 'laptops' : 'gadgets';

  return (
    <div className="flex flex-col gap-6">
      {flash && <p className={`rounded-xl border px-4 py-3 text-sm ${flash.kind === 'success' ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5 text-destructive'}`}>{flash.text}</p>}

      <div className="flex flex-wrap gap-2">
        {(['mobile','laptop','gadget'] as Cat[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium ${category === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
          >
            {cat === 'mobile' ? <Smartphone className="h-4 w-4" /> : cat === 'laptop' ? <Laptop className="h-4 w-4" /> : <Tablet className="h-4 w-4" />}
            {cat === 'mobile' ? 'Mobile' : cat === 'laptop' ? 'Laptop' : 'Gadget'}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Selected: <strong className={picked.length === 5 || picked.length === 10 ? 'text-green-600' : 'text-amber-600'}>{picked.length}</strong> / 5 or 10</span>
          <a href={`/top/${pluralPath}`} target="_blank" className="rounded-lg border border-border px-3 py-2 hover:bg-muted">View Top Page</a>
          <a href={`/specs/${pluralPath}`} target="_blank" className="rounded-lg border border-border px-3 py-2 hover:bg-muted">View Specs</a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Picked / Ordered */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">Top {label} &mdash; Ordered ({picked.length})</h2>
          <p className="text-xs text-muted-foreground mt-1">Drag with arrows. Publish to make live on /top/{pluralPath}.</p>
          {picked.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No products selected. Add from the right.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {picked.map((p, idx) => (
                <li key={p.id} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 bg-muted/20">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{idx + 1}</span>
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border bg-muted flex-shrink-0">
                    {p.thumbnail_url ? <Image src={p.thumbnail_url} alt={p.name} width={40} height={40} className="h-full w-auto object-contain p-0.5" /> : p.images?.[0] ? <Image src={p.images[0]} alt={p.name} width={40} height={40} className="h-full w-auto object-contain p-0.5" /> : <div className="h-full w-full bg-muted" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.brand ?? ''} · {p.price_text ?? '—'}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => move(idx, -1)} disabled={idx === 0} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button onClick={() => move(idx, 1)} disabled={idx === picked.length - 1} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                  </div>
                  <button onClick={() => removeProduct(p.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={handlePublish} disabled={saving || (picked.length !== 0 && picked.length !== 5 && picked.length !== 10)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:shadow-glow">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Publish Top {label}
          </button>
          <p className="mt-1 text-xs text-muted-foreground text-center">Must be exactly 5 or 10 to publish. 0 clears the Top page.</p>
        </section>

        {/* All products */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Available {label}</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </div>
          <div className="mt-3 max-h-[520px] overflow-y-auto flex flex-col gap-2 pr-1">
            {filteredAll.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No matching products.</p>
            ) : (
              filteredAll.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border bg-muted flex-shrink-0">
                    {p.thumbnail_url ? <Image src={p.thumbnail_url} alt={p.name} width={40} height={40} className="h-full w-auto object-contain p-0.5" /> : p.images?.[0] ? <Image src={p.images[0]} alt={p.name} width={40} height={40} className="h-full w-auto object-contain p-0.5" /> : <div className="h-full w-full bg-muted" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.price_text ?? '—'}</p>
                  </div>
                  <button onClick={() => addProduct(p)} disabled={picked.length >= 10} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
