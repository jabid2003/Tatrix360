'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Plus,
  Loader2,
  Trash2,
  Pencil,
  X,
  Check,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Images,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';
import type { ArticleItem } from '@/lib/article-items';

function slugifyClient(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const EMPTY_FORM = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  imageUrl: '',
  imageAlt: '',
  brand: '',
  priceText: '',
  productUrl: '',
  badge: '',
  releaseDate: '',
  rating: '',
  prosText: '',
  consText: '',
  specsText: '',
  isVisible: true,
};

function specsToLines(specs?: Record<string, string>): string {
  if (!specs) return '';
  return Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join('\n');
}

function linesToSpecs(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim();
      if (k && v) out[k] = v;
    }
  }
  return out;
}

function linesToList(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

interface Props {
  articleId: string;
  articleTitle: string;
  initialItems: ArticleItem[];
}

export function ArticleItemsManager({ articleId, articleTitle, initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<ArticleItem[]>(
    [...initialItems].sort((a, b) => a.displayOrder - b.displayOrder)
  );
  const [flash, setFlash] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState('');
  const [creating, setCreating] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expandedForm, setExpandedForm] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState<Record<string, string | boolean>>({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  function showFlash(kind: 'success' | 'error', text: string) {
    setFlash({ kind, text });
    setTimeout(() => setFlash(null), 4000);
  }

  async function handleUpload(file: File, target: 'create' | string) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', `item-${Date.now()}`);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'Upload failed');
    if (target === 'create') setForm((prev) => ({ ...prev, imageUrl: data.url }));
    else setEditForm((prev) => ({ ...prev, imageUrl: data.url }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const displayOrder = items.length;
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        summary: form.summary.trim() || undefined,
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        imageAlt: form.imageAlt.trim() || undefined,
        brand: form.brand.trim() || undefined,
        priceText: form.priceText.trim() || undefined,
        productUrl: form.productUrl.trim() || undefined,
        badge: form.badge.trim() || undefined,
        releaseDate: form.releaseDate.trim() || undefined,
        rating: form.rating !== '' ? Number(form.rating) : undefined,
        pros: linesToList(form.prosText),
        cons: linesToList(form.consText),
        specifications: linesToSpecs(form.specsText),
        displayOrder,
        isVisible: form.isVisible,
      };
      const res = await fetch(`/api/admin/articles/${articleId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { showFlash('error', data.error || 'Create failed'); return; }
      showFlash('success', 'Item added.');
      setForm({ ...EMPTY_FORM });
      setItems((prev) => [...prev, data.item]);
      router.refresh();
    } catch { showFlash('error', 'Something went wrong'); }
    finally { setCreating(false); }
  }

  function startEdit(item: ArticleItem) {
    setEditingId(item.id);
    setExpandedForm(item.id);
    setEditForm({
      title: item.title,
      slug: item.slug || '',
      summary: item.summary || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      imageAlt: item.imageAlt || '',
      brand: item.brand || '',
      priceText: item.priceText || '',
      productUrl: item.productUrl || '',
      badge: item.badge || '',
      releaseDate: item.releaseDate || '',
      rating: item.rating !== undefined && item.rating !== null ? String(item.rating) : '',
      prosText: item.pros.join('\n'),
      consText: item.cons.join('\n'),
      specsText: specsToLines(item.specifications),
      isVisible: item.isVisible,
    });
  }

  async function saveEdit(id: string) {
    setBusy(`edit:${id}`);
    try {
      const payload = {
        title: String(editForm.title).trim(),
        slug: String(editForm.slug).trim() || undefined,
        summary: String(editForm.summary).trim() || undefined,
        description: String(editForm.description).trim() || undefined,
        imageUrl: String(editForm.imageUrl).trim() || undefined,
        imageAlt: String(editForm.imageAlt).trim() || undefined,
        brand: String(editForm.brand).trim() || undefined,
        priceText: String(editForm.priceText).trim() || undefined,
        productUrl: String(editForm.productUrl).trim() || undefined,
        badge: String(editForm.badge).trim() || undefined,
        releaseDate: String(editForm.releaseDate).trim() || undefined,
        rating: editForm.rating !== '' ? Number(editForm.rating) : null,
        pros: linesToList(String(editForm.prosText)),
        cons: linesToList(String(editForm.consText)),
        specifications: linesToSpecs(String(editForm.specsText)),
        isVisible: editForm.isVisible,
      };
      const res = await fetch(`/api/admin/articles/${articleId}/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { showFlash('error', data.error || 'Save failed'); return; }
      showFlash('success', 'Item saved.');
      setEditingId(null);
      setExpandedForm(null);
      router.refresh();
      const updated = await (await fetch(`/api/admin/articles/${articleId}/items`)).json();
      if (updated.ok && Array.isArray(updated.items)) setItems(updated.items);
    } catch { showFlash('error', 'Something went wrong'); }
    finally { setBusy(''); }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete item "${title}"? This cannot be undone.`)) return;
    setBusy(`delete:${id}`);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/items/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) { showFlash('error', data.error || 'Delete failed'); return; }
      showFlash('success', 'Item deleted.');
      setItems((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    } catch { showFlash('error', 'Something went wrong'); }
    finally { setBusy(''); }
  }

  async function toggleVisible(item: ArticleItem) {
    setBusy(`toggle:${item.id}`);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !item.isVisible }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { showFlash('error', data.error || 'Failed'); return; }
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isVisible: !item.isVisible } : i)));
      router.refresh();
    } catch { showFlash('error', 'Something went wrong'); }
    finally { setBusy(''); }
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= items.length) return;
    const newOrder = [...items];
    [newOrder[idx], newOrder[target]] = [newOrder[target], newOrder[idx]];
    setBusy('reorder');
    try {
      const orderedIds = newOrder.map((i) => i.id);
      const payload: { orderedIds: string[]; items: Partial<ArticleItem>[] } = {
        orderedIds,
        items: newOrder.map((i, n) => ({
          id: i.id,
          title: i.title,
          slug: i.slug,
          summary: i.summary,
          description: i.description,
          imageUrl: i.imageUrl,
          imageAlt: i.imageAlt,
          brand: i.brand,
          priceText: i.priceText,
          productUrl: i.productUrl,
          badge: i.badge,
          releaseDate: i.releaseDate,
          rating: i.rating,
          pros: i.pros,
          cons: i.cons,
          specifications: i.specifications,
          displayOrder: n,
          isVisible: i.isVisible,
        })),
      };
      const res = await fetch(`/api/admin/articles/${articleId}/items/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { showFlash('error', data.error || 'Reorder failed'); return; }
      showFlash('success', 'Order saved.');
      setItems(newOrder);
      router.refresh();
    } catch { showFlash('error', 'Failed'); }
    finally { setBusy(''); }
  }

  function setEditField(key: string, value: string | boolean) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6">
      {flash && <p className={`rounded-xl border px-4 py-3 text-sm ${flash.kind === 'success' ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5 text-destructive'}`}>{flash.text}</p>}

      {/* Create form */}
      <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Plus className="h-4 w-4 text-primary" /> Add product / list item</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs sm:col-span-2 lg:col-span-1"><span className="font-medium">Title *</span>
            <input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); if (!form.slug) setForm((p) => ({ ...p, slug: slugifyClient(e.target.value) })); }} placeholder="Samsung Galaxy S25" className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Slug</span>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugifyClient(e.target.value) })} className="rounded-xl border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Brand</span>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Samsung" className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Price / text</span>
            <input value={form.priceText} onChange={(e) => setForm({ ...form, priceText: e.target.value })} placeholder="$799 or Starting $799" className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Rating (0-5)</span>
            <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Badge</span>
            <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Best Overall" className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Release date</span>
            <input type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs sm:col-span-2"><span className="font-medium">Product URL</span>
            <input value={form.productUrl} onChange={(e) => setForm({ ...form, productUrl: e.target.value })} placeholder="https://…" className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs sm:col-span-2 lg:col-span-1"><span className="font-medium">Image</span>
            <div className="flex gap-2">
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <label className="flex cursor-pointer items-center rounded-xl border border-border px-3 text-muted-foreground hover:bg-muted">
                <Images className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { await handleUpload(f, 'create'); } catch (err) { showFlash('error', (err as Error).message); } }} />
              </label>
            </div>
            {form.imageUrl && <Image src={form.imageUrl} alt="preview" width={160} height={90} className="mt-2 h-20 w-40 rounded-lg border border-border object-cover" unoptimized />}
          </label>
          <label className="flex flex-col gap-1 text-xs sm:col-span-2"><span className="font-medium">Image alt</span>
            <input value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs sm:col-span-2 lg:col-span-3"><span className="font-medium">Summary</span>
            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs sm:col-span-2 lg:col-span-3"><span className="font-medium">Description</span>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Pros (one per line)</span>
            <textarea value={form.prosText} onChange={(e) => setForm({ ...form, prosText: e.target.value })} rows={3} placeholder={'Great camera\nLong battery'} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Cons (one per line)</span>
            <textarea value={form.consText} onChange={(e) => setForm({ ...form, consText: e.target.value })} rows={3} placeholder={'No charger\nExpensive'} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Specifications (Key: Value, one per line)</span>
            <textarea value={form.specsText} onChange={(e) => setForm({ ...form, specsText: e.target.value })} rows={3} placeholder={'Display: 6.7" AMOLED\nBattery: 5000 mAh'} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
          <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} className="h-4 w-4 text-primary" /> Visible</label>
            <button type="submit" disabled={creating || !form.title.trim()} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add item</button>
          </div>
        </div>
      </form>

      {/* Items list */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">Items ({items.length})</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {items.length === 0 && <li className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">No items yet. Add the first product or list entry above.</li>}
          {items.map((item, idx) => {
            const isOpen = expandedForm === item.id;
            const isEditing = editingId === item.id;
            return (
              <li key={item.id} className={`rounded-xl border border-border ${!item.isVisible ? 'opacity-70' : ''}`}>
                {/* Header row */}
                <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <button onClick={() => move(item.id, -1)} className="rounded-lg p-1.5 hover:bg-muted" disabled={idx === 0} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                    <button onClick={() => move(item.id, 1)} className="rounded-lg p-1.5 hover:bg-muted" disabled={idx === items.length - 1} aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                    <span className="ml-1 text-xs tabular-nums">{idx + 1}</span>
                  </div>
                  <button onClick={() => { setExpandedForm(isOpen ? null : item.id); if (isEditing && isOpen !== isEditing) { } }} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={isOpen}>
                    {item.imageUrl ? <Image src={item.imageUrl} alt="" width={56} height={56} className="h-12 w-12 rounded-lg border border-border object-cover" unoptimized /> : <div className="h-12 w-12 rounded-lg border border-border bg-muted" />}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{item.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{item.brand} {item.priceText && <>· {item.priceText}</>} {item.rating !== null && item.rating !== undefined && <span className="inline-flex items-center gap-0.5 text-primary"><Star className="h-3 w-3 fill-current" />{item.rating.toFixed(1)}</span>}</span>
                    </span>
                  </button>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex gap-1.5">
                    <button onClick={() => toggleVisible(item)} disabled={busy === `toggle:${item.id}`} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50" aria-label="Toggle visibility">{item.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button onClick={() => isEditing ? setEditingId(null) : startEdit(item)} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(item.id, item.title)} disabled={busy === `delete:${item.id}`} className="rounded-lg border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50" aria-label="Delete">{busy === `delete:${item.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
                  </div>
                </div>

                {/* Edit / expanded panel */}
                {isOpen && (
                  <div className="border-t border-border p-3 sm:p-4">
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <label className="flex flex-col gap-1 text-xs lg:col-span-1"><span className="font-medium">Title</span><input value={String(editForm.title)} onChange={(e) => setEditField('title', e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Slug</span><input value={String(editForm.slug)} onChange={(e) => setEditField('slug', slugifyClient(e.target.value))} className="rounded-xl border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Brand</span><input value={String(editForm.brand)} onChange={(e) => setEditField('brand', e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Price</span><input value={String(editForm.priceText)} onChange={(e) => setEditField('priceText', e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Rating (0-5)</span><input type="number" min={0} max={5} step={0.1} value={String(editForm.rating)} onChange={(e) => setEditField('rating', e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Badge</span><input value={String(editForm.badge)} onChange={(e) => setEditField('badge', e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Release date</span><input type="date" value={String(editForm.releaseDate)} onChange={(e) => setEditField('releaseDate', e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs sm:col-span-2"><span className="font-medium">Product URL</span><input value={String(editForm.productUrl)} onChange={(e) => setEditField('productUrl', e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Image URL</span>
                          <div className="flex gap-2">
                            <input value={String(editForm.imageUrl)} onChange={(e) => setEditField('imageUrl', e.target.value)} className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                            <label className="flex cursor-pointer items-center rounded-xl border border-border px-3 text-muted-foreground hover:bg-muted"><Images className="h-4 w-4" /><input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { await handleUpload(f, item.id); } catch (err) { showFlash('error', (err as Error).message); } }} /></label>
                          </div>
                        </label>
                        <label className="flex flex-col gap-1 text-xs sm:col-span-2"><span className="font-medium">Image alt</span><input value={String(editForm.imageAlt)} onChange={(e) => setEditField('imageAlt', e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs sm:col-span-2 lg:col-span-3"><span className="font-medium">Summary</span><textarea value={String(editForm.summary)} onChange={(e) => setEditField('summary', e.target.value)} rows={2} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs sm:col-span-2 lg:col-span-3"><span className="font-medium">Description</span><textarea value={String(editForm.description)} onChange={(e) => setEditField('description', e.target.value)} rows={4} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Pros</span><textarea value={String(editForm.prosText)} onChange={(e) => setEditField('prosText', e.target.value)} rows={3} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Cons</span><textarea value={String(editForm.consText)} onChange={(e) => setEditField('consText', e.target.value)} rows={3} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <label className="flex flex-col gap-1 text-xs"><span className="font-medium">Specifications</span><textarea value={String(editForm.specsText)} onChange={(e) => setEditField('specsText', e.target.value)} rows={3} className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></label>
                        <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-3">
                          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!editForm.isVisible} onChange={(e) => setEditField('isVisible', e.target.checked)} className="h-4 w-4 text-primary" /> Visible</label>
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(item.id)} disabled={busy === `edit:${item.id}`} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50">{busy === `edit:${item.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save</button>
                            <button onClick={() => { setEditingId(null); }} className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium"><X className="h-4 w-4" /> Cancel</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {item.summary && <p className="text-sm text-muted-foreground">{item.summary}</p>}
                        {Object.keys(item.specifications || {}).length > 0 && (
                          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
                            {Object.entries(item.specifications).slice(0, 8).map(([k, v]) => (
                              <div key={k} className="rounded-lg border border-border bg-muted/40 p-2"><dt className="font-medium">{k}</dt><dd className="mt-0.5 text-muted-foreground">{v}</dd></div>
                            ))}
                          </dl>
                        )}
                        {(item.pros.length > 0 || item.cons.length > 0) && (
                          <div className="flex flex-wrap gap-4 text-xs">
                            {item.pros.length > 0 && <ul className="list-disc pl-4 text-green-700"><span className="font-semibold text-foreground">Pros:</span> {item.pros.map((p) => <li key={p}>{p}</li>)}</ul>}
                            {item.cons.length > 0 && <ul className="list-disc pl-4 text-red-700"><span className="font-semibold text-foreground">Cons:</span> {item.cons.map((c) => <li key={c}>{c}</li>)}</ul>}
                          </div>
                        )}
                        <div className="flex justify-end">
                          <button onClick={() => startEdit(item)} className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20">Edit fields</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}