'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GripVertical, Plus, Trash2, Loader2, ArrowUp, ArrowDown, Save, Smartphone, Laptop, Tablet, Search, Package } from 'lucide-react';
import type { MainCategory, CategorySection } from '@/lib/sections';

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

const CAT_LABEL: Record<Cat, string> = { mobile: 'Mobile', laptop: 'Laptop', gadget: 'Gadget' };
const CAT_META: Record<Cat, string> = {
  mobile: 'Best Phones Under ₹20000',
  laptop: 'Best Laptops for Students',
  gadget: 'Top 5 Camera Phones',
};

export function TopPicksManager({
  initialCategory,
  initialAll,
  mainCategories,
}: {
  initialCategory: Cat;
  initialAll: any[];
  mainCategories: MainCategory[];
}) {
  const [category, setCategory] = useState<Cat>(initialCategory);
  const [all, setAll] = useState<ProductLite[]>(initialAll.map(mapLite));
  // Picks persist across category tabs — the same product can go into many
  // lists (e.g. "Best Phone Under 20k" AND "Best Camera Phone").
  const [picked, setPicked] = useState<ProductLite[]>([]);
  const [query, setQuery] = useState('');

  // New list details — title + description first, then products, then publish.
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainCategoryId, setMainCategoryId] = useState(mainCategories[0]?.id ?? '');
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [sectionId, setSectionId] = useState('');
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  function mapLite(r: any): ProductLite {
    return { id: r.id, name: r.name, slug: r.slug, brand: r.brand, category: r.category, price_text: r.price_text, thumbnail_url: r.thumbnail_url, images: r.images };
  }

  useEffect(() => {
    fetch(`/api/admin/products?category=${category}&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setAll((data.products ?? []).map(mapLite));
      })
      .catch(() => {});
  }, [category]);

  // Cascading sections for the target article location.
  useEffect(() => {
    if (!mainCategoryId) { setSections([]); setSectionId(''); return; }
    let cancelled = false;
    setSectionsLoading(true);
    fetch(`/api/admin/sections?mainCategoryId=${encodeURIComponent(mainCategoryId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list: CategorySection[] = Array.isArray(data.sections) ? data.sections : [];
        setSections(list);
        setSectionId((prev) => (list.some((s) => s.id === prev) ? prev : ''));
      })
      .catch(() => { if (!cancelled) setSections([]); })
      .finally(() => { if (!cancelled) setSectionsLoading(false); });
    return () => { cancelled = true; };
  }, [mainCategoryId]);

  function showFlash(kind: 'success' | 'error', text: string) {
    setFlash({ kind, text }); setTimeout(() => setFlash(null), 5000);
  }

  const pickedIds = new Set(picked.map((p) => p.id));
  const filteredAll = all.filter((p) => !pickedIds.has(p.id)).filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || (p.brand ?? '').toLowerCase().includes(query.toLowerCase())).slice(0, 30);

  function addProduct(p: ProductLite) {
    if (picked.length >= 50) { showFlash('error', 'Maximum 50 products. Remove one first.'); return; }
    if (pickedIds.has(p.id)) return;
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
    if (!title.trim()) { showFlash('error', 'Give the list a title first.'); return; }
    if (picked.length === 0) { showFlash('error', 'Add at least 1 product.'); return; }
    if (!mainCategoryId) { showFlash('error', 'Choose where the article will live (category).'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/best-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          mainCategoryId,
          sectionId: sectionId || undefined,
          orderedIds: picked.map((p) => p.id),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { showFlash('error', data.error || 'Failed to publish'); return; }
      showFlash('success', 'Article published! Opening its items…');
      window.location.href = `/adminmja/posts/${data.articleId}/items`;
    } catch { showFlash('error', 'Failed'); } finally { setSaving(false); }
  }

  const label = CAT_LABEL[category];

  return (
    <div className="flex flex-col gap-6">
      {flash && <p className={`rounded-xl border px-4 py-3 text-sm ${flash.kind === 'success' ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5 text-destructive'}`}>{flash.text}</p>}

      {/* Category tabs — the catalog shown below; picks carry across tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {(['mobile', 'laptop', 'gadget'] as Cat[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-medium ${category === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
          >
            {cat === 'mobile' ? <Smartphone className="h-4 w-4" /> : cat === 'laptop' ? <Laptop className="h-4 w-4" /> : <Tablet className="h-4 w-4" />}
            {CAT_LABEL[cat]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setTitle((t) => t || CAT_META[category])}
          title="Fill title example"
          className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Package className="h-4 w-4" /> Example title
        </button>
      </div>

      {/* 1 — Title + description */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold">1 · Name the list</h2>
        <p className="mt-1 text-xs text-muted-foreground">E.g. &ldquo;Best Phone Under 20k&rdquo; — this becomes a separate article page. The same products can be reused in another list later.</p>
        <label className="mt-3 flex flex-col gap-1 text-xs">
          <span className="font-medium">Title *</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Best Phone Under 20k"
            className="rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-colors focus:border-primary"
          />
        </label>
        <label className="mt-3 flex flex-col gap-1 text-xs">
          <span className="font-medium">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Short intro shown at the top of the article — what this list covers and who it is for…"
            className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Publish under category *</span>
            <select
              value={mainCategoryId}
              onChange={(e) => setMainCategoryId(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {mainCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Section (optional)</span>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              disabled={sectionsLoading}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">— No section —</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 2 — Selected products: cards in publish order */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">2 · Selected products — Cards ({picked.length})</h2>
          <p className="mt-1 text-xs text-muted-foreground">Reorder with arrows. Products stay available for future lists.</p>
          {picked.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No products yet. Add from the catalog on the right.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {picked.map((p, idx) => (
                <li key={p.id} className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2">
                  <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{idx + 1}</span>
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    {p.thumbnail_url ? <Image src={p.thumbnail_url} alt={p.name} width={40} height={40} className="h-full w-auto object-contain p-0.5" /> : p.images?.[0] ? <Image src={p.images[0]} alt={p.name} width={40} height={40} className="h-full w-auto object-contain p-0.5" /> : <div className="h-full w-full bg-muted" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{CAT_LABEL[p.category as Cat] ?? p.category}{p.brand ? ` · ${p.brand}` : ''}{p.price_text ? ` · ${p.price_text}` : ''}</p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col gap-0.5">
                    <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="rounded p-1 hover:bg-muted disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => move(idx, 1)} disabled={idx === picked.length - 1} className="rounded p-1 hover:bg-muted disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
                  </div>
                  <button type="button" onClick={() => removeProduct(p.id)} className="flex-shrink-0 rounded-lg p-2 text-destructive hover:bg-destructive/10" aria-label={`Remove ${p.name}`}><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 3 — Catalog: add from any category */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">3 · Add {label} products</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${label.toLowerCase()} products…`} className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </div>
          <div className="mt-3 max-h-[520px] overflow-y-auto flex flex-col gap-2 pr-1">
            {filteredAll.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No matching products. Try another tab or search.</p>
            ) : (
              filteredAll.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    {p.thumbnail_url ? <Image src={p.thumbnail_url} alt={p.name} width={40} height={40} className="h-full w-auto object-contain p-0.5" /> : p.images?.[0] ? <Image src={p.images[0]} alt={p.name} width={40} height={40} className="h-full w-auto object-contain p-0.5" /> : <div className="h-full w-full bg-muted" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.brand ?? ''}{p.price_text ? ` · ${p.price_text}` : ''}</p>
                  </div>
                  <button type="button" onClick={() => addProduct(p)} disabled={picked.length >= 50} className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90"><Plus className="h-3 w-3" /> Add</button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 4 — Publish */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <button onClick={handlePublish} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:shadow-glow">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Publishing…' : `Publish “${title.trim() || 'Best Products'}” as article`}
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Creates a listicle article ({picked.length} linked {picked.length === 1 ? 'product' : 'products'}) and opens its items for final tweaks. Products stay reusable in other lists.
        </p>
      </section>
    </div>
  );
}
