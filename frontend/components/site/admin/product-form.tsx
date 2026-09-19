'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Loader2, Upload, X, Link2, ArrowLeft, Trash2, Plus, GripVertical,
  Star, Smartphone, Laptop, Tablet, Settings2, Image as ImageIcon, DollarSign, Calendar, Award, FileText,
} from 'lucide-react';
import type { Product, ProductCategory, SpecSection, KeySpec } from '@/lib/products';
import { ReadAlsoSection } from './read-also-section';

const DEFAULT_SPECS: Record<ProductCategory, SpecSection[]> = {
  mobile: [
    { title: 'Display', icon: 'Display', fields: [{ label: 'Display Size', value: '' }, { label: 'Display Type', value: '' }, { label: 'Resolution', value: '' }, { label: 'Refresh Rate', value: '' }] },
    { title: 'Performance', icon: 'Cpu', fields: [{ label: 'Processor', value: '' }, { label: 'GPU', value: '' }] },
    { title: 'Memory & Storage', icon: 'Memory', fields: [{ label: 'RAM', value: '' }, { label: 'Storage', value: '' }, { label: 'Expandable Storage', value: '' }] },
    { title: 'Cameras', icon: 'Camera', fields: [{ label: 'Rear Camera', value: '' }, { label: 'Front Camera', value: '' }, { label: 'Video Recording', value: '' }] },
    { title: 'Battery & Charging', icon: 'Battery', fields: [{ label: 'Battery Capacity', value: '' }, { label: 'Charging Speed', value: '' }, { label: 'Wireless Charging', value: '' }] },
    { title: 'Software', icon: 'Settings', fields: [{ label: 'Operating System', value: '' }, { label: 'UI', value: '' }] },
    { title: 'Connectivity', icon: 'Wifi', fields: [{ label: '5G', value: '' }, { label: 'Wi-Fi', value: '' }, { label: 'Bluetooth', value: '' }, { label: 'SIM', value: '' }, { label: 'USB Port', value: '' }, { label: 'NFC', value: '' }] },
    { title: 'Build & Design', icon: 'Box', fields: [{ label: 'Build Material', value: '' }, { label: 'IP Rating', value: '' }, { label: 'Colors', value: '' }] },
    { title: 'Dimensions & Weight', icon: 'Ruler', fields: [{ label: 'Height', value: '' }, { label: 'Width', value: '' }, { label: 'Thickness', value: '' }, { label: 'Weight', value: '' }] },
  ],
  laptop: [
    { title: 'Display', icon: 'Display', fields: [{ label: 'Screen Size', value: '' }, { label: 'Panel Type', value: '' }, { label: 'Resolution', value: '' }, { label: 'Refresh Rate', value: '' }, { label: 'Brightness', value: '' }, { label: 'Color Accuracy', value: '' }] },
    { title: 'Performance', icon: 'Cpu', fields: [{ label: 'Processor', value: '' }, { label: 'Cores / Threads', value: '' }, { label: 'Base Clock', value: '' }, { label: 'Boost Clock', value: '' }] },
    { title: 'Memory & Storage', icon: 'Memory', fields: [{ label: 'RAM', value: '' }, { label: 'RAM Type', value: '' }, { label: 'Storage', value: '' }, { label: 'Storage Type', value: '' }, { label: 'Expandable Storage', value: '' }] },
    { title: 'Graphics', icon: 'Settings', fields: [{ label: 'GPU', value: '' }, { label: 'GPU VRAM', value: '' }, { label: 'TGP', value: '' }] },
    { title: 'Battery & Charging', icon: 'Battery', fields: [{ label: 'Battery Capacity', value: '' }, { label: 'Charging Speed', value: '' }, { label: 'Battery Life', value: '' }] },
    { title: 'Software', icon: 'Settings', fields: [{ label: 'Operating System', value: '' }, { label: 'Pre-installed Software', value: '' }] },
    { title: 'Connectivity', icon: 'Wifi', fields: [{ label: 'Wi-Fi', value: '' }, { label: 'Bluetooth', value: '' }, { label: 'Thunderbolt', value: '' }, { label: 'USB Ports', value: '' }, { label: 'HDMI', value: '' }, { label: 'Ethernet', value: '' }] },
    { title: 'Ports & Features', icon: 'Settings', fields: [{ label: 'Keyboard', value: '' }, { label: 'Trackpad', value: '' }, { label: 'Webcam', value: '' }, { label: 'Speakers', value: '' }, { label: 'Fingerprint Reader', value: '' }] },
    { title: 'Build & Design', icon: 'Box', fields: [{ label: 'Build Material', value: '' }, { label: 'Colors', value: '' }] },
    { title: 'Dimensions & Weight', icon: 'Ruler', fields: [{ label: 'Height', value: '' }, { label: 'Width', value: '' }, { label: 'Thickness', value: '' }, { label: 'Weight', value: '' }] },
  ],
  gadget: [
    { title: 'Display', icon: 'Display', fields: [{ label: 'Display Size', value: '' }, { label: 'Display Type', value: '' }, { label: 'Resolution', value: '' }, { label: 'Refresh Rate', value: '' }] },
    { title: 'Performance', icon: 'Cpu', fields: [{ label: 'Processor', value: '' }, { label: 'GPU', value: '' }] },
    { title: 'Memory & Storage', icon: 'Memory', fields: [{ label: 'RAM', value: '' }, { label: 'Storage', value: '' }, { label: 'Expandable Storage', value: '' }] },
    { title: 'Battery & Charging', icon: 'Battery', fields: [{ label: 'Battery Capacity', value: '' }, { label: 'Charging Speed', value: '' }, { label: 'Wireless Charging', value: '' }] },
    { title: 'Software', icon: 'Settings', fields: [{ label: 'Operating System', value: '' }, { label: 'UI', value: '' }] },
    { title: 'Connectivity', icon: 'Wifi', fields: [{ label: 'Wi-Fi', value: '' }, { label: 'Bluetooth', value: '' }, { label: 'NFC', value: '' }] },
    { title: 'Sensors', icon: 'Settings', fields: [{ label: 'Accelerometer', value: '' }, { label: 'Gyroscope', value: '' }, { label: 'Heart Rate', value: '' }, { label: 'SpO2', value: '' }] },
    { title: 'Build & Design', icon: 'Box', fields: [{ label: 'Build Material', value: '' }, { label: 'Water Resistance', value: '' }, { label: 'Colors', value: '' }] },
    { title: 'Dimensions & Weight', icon: 'Ruler', fields: [{ label: 'Height', value: '' }, { label: 'Width', value: '' }, { label: 'Thickness', value: '' }, { label: 'Weight', value: '' }] },
  ],
};

function slugifyClient(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const CATEGORY_OPTIONS: { value: ProductCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'mobile', label: 'Mobile', icon: <Smartphone className="h-4 w-4" /> },
  { value: 'laptop', label: 'Laptop', icon: <Laptop className="h-4 w-4" /> },
  { value: 'gadget', label: 'Gadget', icon: <Tablet className="h-4 w-4" /> },
];

const ICON_OPTIONS = [
  'Display', 'Monitor', 'Cpu', 'Memory', 'HardDrive', 'Camera', 'Battery',
  'Software', 'Settings', 'Settings2', 'Wifi', 'Bluetooth', 'Nfc', 'Shield',
  'Ruler', 'Star', 'Zap', 'Layers', 'Box', 'Smartphone', 'Laptop',
  'Award', 'Heart', 'Thermometer', 'Activity', 'Droplets', 'Gauge', 'Vibrate',
  'Fingerprint', 'Eye', 'Volume2', 'Globe', 'Sun', 'Usb', 'Cable',
];

export function ProductForm({
  mode,
  product,
}: {
  mode: 'create' | 'edit';
  product?: Product;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const initialCat = product?.category ?? 'mobile';
  const [category, setCategory] = useState<ProductCategory>(initialCat);
  const [priceText, setPriceText] = useState(product?.priceText ?? '');
  const [priceValue, setPriceValue] = useState(product?.priceValue?.toString() ?? '');
  const [isExpectedPrice, setIsExpectedPrice] = useState(product?.isExpectedPrice ?? false);
  const [launchDateText, setLaunchDateText] = useState(product?.launchDateText ?? '');
  const [rating, setRating] = useState(product?.rating?.toString() ?? '');
  const [ratingCountText, setRatingCountText] = useState(product?.ratingCountText ?? '');
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [thumbnailUrl, setThumbnailUrl] = useState(product?.thumbnailUrl ?? product?.images?.[0] ?? '');
  const [specs, setSpecs] = useState<SpecSection[]>(product?.specs ?? (mode === 'create' ? DEFAULT_SPECS[initialCat] : []));
  const [keySpecs, setKeySpecs] = useState<KeySpec[]>(product?.keySpecs ?? []);
  const [pros, setPros] = useState<string[]>(product?.pros ?? []);
  const [cons, setCons] = useState<string[]>(product?.cons ?? []);
  const [specialFeatures, setSpecialFeatures] = useState<string[]>(product?.specialFeatures ?? []);
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Archived'>(product?.status ?? 'Published');
  const [isVisible, setIsVisible] = useState(product?.isVisible ?? true);
  const [showUserReviews, setShowUserReviews] = useState(product?.showUserReviews ?? false);
  const [readAlsoIds, setReadAlsoIds] = useState<string[]>(product?.readAlsoIds ?? []);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  function handleTitleChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugifyClient(v));
  }

  function handleCategoryChange(c: ProductCategory) {
    setCategory(c);
    if (mode === 'create') {
      setSpecs(DEFAULT_SPECS[c]);
    }
  }

  async function uploadFile(file: File) {
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', name || 'product');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error || 'Upload failed'); return null; }
      return data.url as string;
    } catch { setError('Upload failed'); return null; } finally { setUploading(false); }
  }

  async function handleGallerySelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) {
        setImages((prev) => [...prev, url]);
        if (!thumbnailUrl) setThumbnailUrl(url);
      }
    }
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  }

  async function handleThumbSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) { setThumbnailUrl(url); if (!images.includes(url)) setImages((p) => [url, ...p]); }
  }

  function addImageUrl() {
    const v = imageUrlInput.trim();
    if (!v) return;
    setImages((p) => [...p, v]);
    if (!thumbnailUrl) setThumbnailUrl(v);
    setImageUrlInput('');
  }

  // Spec sections
  function addSection() {
    setSpecs((prev) => [...prev, { title: 'New Section', icon: 'Settings', fields: [{ label: '', value: '' }] }]);
  }
  function updateSection(idx: number, patch: Partial<SpecSection>) {
    setSpecs((prev) => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  }
  function removeSection(idx: number) { setSpecs((prev) => prev.filter((_, i) => i !== idx)); }
  function addField(secIdx: number) {
    setSpecs((prev) => prev.map((s, i) => i === secIdx ? { ...s, fields: [...s.fields, { label: '', value: '' }] } : s));
  }
  function updateField(secIdx: number, fieldIdx: number, patch: Partial<SpecSection['fields'][number]>) {
    setSpecs((prev) => prev.map((s, i) => {
      if (i !== secIdx) return s;
      const fields = s.fields.map((f, j) => j === fieldIdx ? { ...f, ...patch } : f);
      return { ...s, fields };
    }));
  }
  function removeField(secIdx: number, fieldIdx: number) {
    setSpecs((prev) => prev.map((s, i) => i === secIdx ? { ...s, fields: s.fields.filter((_, j) => j !== fieldIdx) } : s));
  }

  // Key specs
  function addKeySpec() { setKeySpecs((p) => [...p, { label: '', value: '', sublabel: '', icon: '' }]); }
  function updateKeySpec(idx: number, patch: Partial<KeySpec>) { setKeySpecs((p) => p.map((k, i) => i === idx ? { ...k, ...patch } : k)); }
  function removeKeySpec(idx: number) { setKeySpecs((p) => p.filter((_, i) => i !== idx)); }

  // Pros/Cons/Features
  function addList(setter: React.Dispatch<React.SetStateAction<string[]>>) { setter((p) => [...p, '']); }
  function updateList(setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number, val: string) { setter((p) => p.map((v, i) => i === idx ? val : v)); }
  function removeList(setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) { setter((p) => p.filter((_, i) => i !== idx)); }

  function validate(): string | null {
    if (!name.trim()) return 'Name is required.';
    if (!slug.trim()) return 'Slug is required.';
    if (!category) return 'Category is required.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true); setError('');
    try {
      const payload: any = {
        name: name.trim(),
        slug: slugifyClient(slug),
        brand: brand.trim() || undefined,
        category,
        priceText: priceText.trim() || undefined,
        priceValue: priceValue ? Number(priceValue) : undefined,
        isExpectedPrice,
        launchDateText: launchDateText.trim() || undefined,
        rating: rating ? Number(rating) : undefined,
        ratingCountText: ratingCountText.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        images,
        thumbnailUrl: thumbnailUrl || images[0] || undefined,
        specs: specs.filter((s) => s.title.trim()).map((s) => ({ ...s, title: s.title.trim(), fields: s.fields.filter((f) => f.label.trim()) })),
        keySpecs: keySpecs.filter((k) => k.label.trim() || k.value.trim()),
        pros: pros.filter((x) => x.trim()),
        cons: cons.filter((x) => x.trim()),
        specialFeatures: specialFeatures.filter((x) => x.trim()),
        status,
        isVisible,
        showUserReviews,
        readAlsoIds: readAlsoIds.length > 0 ? readAlsoIds : undefined,
      };
      const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${product!.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { setError(data.error || 'Failed to save'); setSubmitting(false); return; }
      router.push('/adminmja/specs');
      router.refresh();
    } catch (err: any) { setError(err.message || 'Failed'); setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <button type="button" onClick={() => router.back()} className="flex items-center gap-2 self-start text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Basic */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-primary" /> Basic Info</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2"><span className="font-medium">Product Name *</span>
            <input value={name} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g., Galaxy S26 Ultra" className="rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary" />
          </label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Slug *</span>
            <input value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} placeholder="galaxy-s26-ultra" className="rounded-xl border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none focus:border-primary" />
            <span className="text-xs text-muted-foreground">/specs/{category === 'mobile' ? 'mobiles' : category === 'laptop' ? 'laptops' : 'gadgets'}/{slug || '...'}</span>
          </label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Brand</span>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Samsung" className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
          </label>
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Category *</span>
            <div className="flex gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => handleCategoryChange(opt.value)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium ${category === opt.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Price Text</span>
            <input value={priceText} onChange={(e) => setPriceText(e.target.value)} placeholder="₹ 1,29,999" className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
            <label className="flex items-center gap-1.5 text-xs mt-1"><input type="checkbox" checked={isExpectedPrice} onChange={(e) => setIsExpectedPrice(e.target.checked)} className="h-3.5 w-3.5" /> Expected Price</label>
          </label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Price Value (numeric)</span>
            <input type="number" value={priceValue} onChange={(e) => setPriceValue(e.target.value)} placeholder="129999" className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
          </label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Launch Date</span>
            <input value={launchDateText} onChange={(e) => setLaunchDateText(e.target.value)} placeholder="Jan 2026" className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm"><span className="font-medium flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Rating (0-5)</span>
              <input type="number" step="0.1" min="0" max="5" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="4.6" className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Rating Count</span>
              <input value={ratingCountText} onChange={(e) => setRatingCountText(e.target.value)} placeholder="2.4k ratings" className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2"><span className="font-medium">Short Description (tagline)</span>
            <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Powerful Performance. Pro-Grade Cameras." className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2"><span className="font-medium">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Long description paragraph..." className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
          </label>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><ImageIcon className="h-4 w-4 text-primary" /> Images</h2>
        <div className="mt-3">
          {thumbnailUrl && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Thumbnail (used on Top page & card)</p>
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-border">
                <Image src={thumbnailUrl} alt="thumb" width={128} height={128} className="h-full w-auto object-contain p-0.5" />
                <button type="button" onClick={() => setThumbnailUrl('')} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                <Image src={img} alt={`img-${idx}`} width={80} height={80} className="h-full w-auto object-contain p-0.5" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                  <button type="button" onClick={() => setThumbnailUrl(img)} title="Set as thumbnail" className="bg-white text-black rounded-full p-1"><Star className="h-3 w-3" /></button>
                  <button type="button" onClick={() => setImages((p) => p.filter((_, i) => i !== idx))} className="bg-red-500 text-white rounded-full p-1"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload Images
            </button>
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm cursor-pointer hover:bg-muted">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleThumbSelect} className="hidden" />
              <ImageIcon className="h-4 w-4" /> Thumbnail
            </label>
            <div className="flex gap-2">
              <input value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} placeholder="Paste image URL" className="rounded-lg border border-input bg-background px-3 py-2 text-sm w-48 outline-none focus:border-primary" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())} />
              <button type="button" onClick={addImageUrl} className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"><Link2 className="h-4 w-4" /></button>
            </div>
          </div>
          <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGallerySelect} className="hidden" />
          <p className="mt-1 text-xs text-muted-foreground">First image becomes thumbnail if none selected. Hover to set / delete. Upload multiple.</p>
        </div>
      </section>

      {/* Key Specs for Top page */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Award className="h-4 w-4 text-primary" /> Key Specs (for Top page) — shows 4 on card</h2>
          <button type="button" onClick={addKeySpec} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {keySpecs.length === 0 && <p className="text-xs text-muted-foreground border border-dashed border-border rounded-lg p-3 text-center">No key specs yet. Add up to 4-6 for top display e.g., 5G, 200MP, 5000mAh, 6.9&quot;</p>}
          {keySpecs.map((k, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 items-center">
              <input value={k.label} onChange={(e) => updateKeySpec(idx, { label: e.target.value })} placeholder="Label e.g., 5G" className="rounded-lg border border-input bg-background px-2 py-2 text-sm outline-none focus:border-primary" />
              <input value={k.value} onChange={(e) => updateKeySpec(idx, { value: e.target.value })} placeholder="Value e.g., 200MP" className="rounded-lg border border-input bg-background px-2 py-2 text-sm outline-none focus:border-primary" />
              <input value={k.sublabel ?? ''} onChange={(e) => updateKeySpec(idx, { sublabel: e.target.value })} placeholder="Sub e.g., 5G Support" className="rounded-lg border border-input bg-background px-2 py-2 text-sm outline-none focus:border-primary" />
              <div className="flex gap-1">
                <input value={k.icon ?? ''} onChange={(e) => updateKeySpec(idx, { icon: e.target.value })} placeholder="Icon" className="flex-1 rounded-lg border border-input bg-background px-2 py-2 text-xs outline-none focus:border-primary" />
                <button type="button" onClick={() => removeKeySpec(idx)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spec Sections */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Settings2 className="h-4 w-4 text-primary" /> Full Specifications — custom sections & fields</h2>
          <button type="button" onClick={addSection} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground flex items-center gap-1"><Plus className="h-3 w-3" /> Add Section</button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Create sections like Display, Processor, Camera, Battery, Connectivity, Design etc. or add your own. Each section renders as a card on the full-spec page.</p>
        <div className="mt-4 flex flex-col gap-4">
          {specs.length === 0 && <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-4 text-center">No spec sections yet. Click &quot;Add Section&quot;.</p>}
          {specs.map((section, sIdx) => (
            <div key={sIdx} className="rounded-xl border border-border p-3 bg-muted/20">
              <div className="flex gap-2 items-center">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <input value={section.title} onChange={(e) => updateSection(sIdx, { title: e.target.value })} placeholder="Section title e.g., Display" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary" />
                <select value={section.icon ?? ''} onChange={(e) => updateSection(sIdx, { icon: e.target.value })} className="rounded-lg border border-input bg-background px-2 py-2 text-xs">
                  <option value="">Icon</option>
                  {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                <button type="button" onClick={() => removeSection(sIdx)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {section.fields.map((field, fIdx) => (
                  <div key={fIdx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input value={field.label} onChange={(e) => updateField(sIdx, fIdx, { label: e.target.value })} placeholder="Label e.g., Display Size" className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                    <input value={field.value} onChange={(e) => updateField(sIdx, fIdx, { value: e.target.value })} placeholder="Value e.g., 6.9 inches" className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                    <button type="button" onClick={() => removeField(sIdx, fIdx)} className="p-2 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addField(sIdx)} className="self-start rounded-lg border border-dashed border-border px-3 py-1 text-xs hover:bg-muted flex items-center gap-1"><Plus className="h-3 w-3" /> Add field</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pros / Cons / Features */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold">Pros, Cons & Special Features</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-green-700">Pros</span><button type="button" onClick={() => addList(setPros)} className="text-xs border border-border rounded px-2 py-0.5 hover:bg-muted"><Plus className="h-3 w-3 inline" /> Add</button></div>
            <div className="mt-2 flex flex-col gap-1.5">
              {pros.map((v, i) => (
                <div key={i} className="flex gap-1"><input value={v} onChange={(e) => updateList(setPros, i, e.target.value)} placeholder="e.g., Stunning AMOLED display" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /><button type="button" onClick={() => removeList(setPros, i)} className="p-2 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button></div>
              ))}
              {pros.length === 0 && <p className="text-xs text-muted-foreground">No pros added.</p>}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-red-700">Cons</span><button type="button" onClick={() => addList(setCons)} className="text-xs border border-border rounded px-2 py-0.5 hover:bg-muted"><Plus className="h-3 w-3 inline" /> Add</button></div>
            <div className="mt-2 flex flex-col gap-1.5">
              {cons.map((v, i) => (
                <div key={i} className="flex gap-1"><input value={v} onChange={(e) => updateList(setCons, i, e.target.value)} placeholder="e.g., Expensive" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /><button type="button" onClick={() => removeList(setCons, i)} className="p-2 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button></div>
              ))}
              {cons.length === 0 && <p className="text-xs text-muted-foreground">No cons added.</p>}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold">Special Features</span><button type="button" onClick={() => addList(setSpecialFeatures)} className="text-xs border border-border rounded px-2 py-0.5 hover:bg-muted"><Plus className="h-3 w-3 inline" /> Add</button></div>
          <div className="mt-2 flex flex-col gap-1.5">
            {specialFeatures.map((v, i) => (
              <div key={i} className="flex gap-1"><input value={v} onChange={(e) => updateList(setSpecialFeatures, i, e.target.value)} placeholder="e.g., S Pen Support" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" /><button type="button" onClick={() => removeList(setSpecialFeatures, i)} className="p-2 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button></div>
            ))}
            {specialFeatures.length === 0 && <p className="text-xs text-muted-foreground">No special features.</p>}
          </div>
        </div>
      </section>

      {/* Read Also — link to related articles */}
      <ReadAlsoSection readAlsoIds={readAlsoIds} setReadAlsoIds={setReadAlsoIds} />

      {/* Status */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold">Publishing</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {(['Draft','Published','Archived'] as const).map((s) => (
            <label key={s} className={`flex items-center gap-2 rounded-xl border px-4 py-2 cursor-pointer ${status === s ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <input type="radio" name="status" checked={status===s} onChange={() => setStatus(s)} className="h-4 w-4" /> {s}
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="h-4 w-4" /> Visible on site</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={showUserReviews} onChange={(e) => setShowUserReviews(e.target.checked)} className="h-4 w-4" /> Show User Reviews section on this product (global toggle can also hide)</label>
        </div>
      </section>

      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

      <button type="submit" disabled={submitting || uploading} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground disabled:opacity-50 hover:shadow-glow">
        {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</> : mode === 'create' ? 'Create Product' : 'Save Changes'}
      </button>
    </form>
  );
}
