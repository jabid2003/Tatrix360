'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Loader2,
  Upload,
  X,
  Link2,
  FileText,
  ArrowLeft,
  Download,
  List,
  File,
  Shield,
  Eye,
  EyeOff,
  Pin,
  PinOff,
} from 'lucide-react';
import type { MainCategory, CategorySection, Article } from '@/lib/sections';
import { getActiveAuthors } from '@/lib/authors';
import type { AuthorFull } from '@/lib/authors';
import { ReadAlsoPicker } from '@/components/site/admin/read-also-picker';
import { RelatedProductsPicker } from '@/components/site/admin/related-products-picker';
import { Markdown } from '@/components/site/markdown';

function slugifyClient(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export interface NewArticleFormProps {
  mainCategories: MainCategory[];
  mode: 'create' | 'edit';
  articleId?: string;
  initialArticle?: Article;
  allArticles?: Article[];
}

export function NewArticleForm({ mainCategories, mode, articleId, initialArticle, allArticles = [] }: NewArticleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialArticle?.title ?? '');
  const [subtitle, setSubtitle] = useState(initialArticle?.subtitle ?? '');
  const [slug, setSlug] = useState(initialArticle?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [content, setContent] = useState(initialArticle?.content ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialArticle?.thumbnailUrl ?? '');

  // Cascading selects: Main Category (static 7) -> Section (fetched dynamically)
  const [mainCategoryId, setMainCategoryId] = useState(initialArticle?.mainCategoryId ?? mainCategories[0]?.id ?? '');
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionId, setSectionId] = useState(initialArticle?.sectionId ?? '');

  // Author
  const [authors, setAuthors] = useState<AuthorFull[]>([]);
  const [authorId, setAuthorId] = useState<number | null>(initialArticle?.authorId ?? null);

  // SEO & Publishing
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialArticle?.seoDescription ?? '');
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Archived'>(initialArticle?.status ?? 'Published');
  const [publishedAt, setPublishedAt] = useState(initialArticle?.publishedAt ?? '');
  const [isVisible, setIsVisible] = useState(initialArticle?.isVisible ?? true);
  const [isLatest, setIsLatest] = useState(initialArticle?.isLatest ?? true);
  const [isPinned, setIsPinned] = useState(initialArticle?.isPinned ?? false);
  const [latestOrder, setLatestOrder] = useState(initialArticle?.latestOrder ?? 0);
  const [pinnedOrder, setPinnedOrder] = useState(initialArticle?.pinnedOrder ?? 0);
  const [articleType, setArticleType] = useState<'standard' | 'listicle'>(initialArticle?.articleType ?? 'standard');
  const [introContent, setIntroContent] = useState(initialArticle?.introContent ?? '');
  const [conclusionContent, setConclusionContent] = useState(initialArticle?.conclusionContent ?? '');
  const [readAlsoIds, setReadAlsoIds] = useState<string[]>(initialArticle?.readAlsoIds ?? []);
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(initialArticle?.relatedProductIds ?? []);

  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');

  // Fetch authors on mount
  useEffect(() => {
    getActiveAuthors().then(setAuthors).catch(() => setAuthors([]));
  }, []);

  // --- Draft autosave (A3): snapshot to localStorage every 30s ---
  const draftKey = `tatrix360-draft-${mode}-${articleId ?? 'new'}`;
  const [draftNotice, setDraftNotice] = useState<{ savedAt: number } | null>(null);
  const [lastAutosaved, setLastAutosaved] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Offer to restore an unsaved draft on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d && typeof d === 'object' && (d.title || d.content) && d.title !== (initialArticle?.title ?? '')) {
        setDraftNotice({ savedAt: typeof d.savedAt === 'number' ? d.savedAt : Date.now() });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave every 30s (timer restarts on each keystroke — effectively
  // "30s after the last change").
  useEffect(() => {
    const t = setInterval(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({
          title, subtitle, slug, content, thumbnailUrl,
          mainCategoryId, sectionId, authorId,
          seoTitle, seoDescription, status, publishedAt,
          isVisible, isLatest, isPinned, latestOrder, pinnedOrder,
          articleType, introContent, conclusionContent, readAlsoIds, relatedProductIds,
          savedAt: Date.now(),
        }));
        setLastAutosaved(new Date().toLocaleTimeString());
      } catch {}
    }, 30000);
    return () => clearInterval(t);
  }, [title, subtitle, slug, content, thumbnailUrl, mainCategoryId, sectionId, authorId, seoTitle, seoDescription, status, publishedAt, isVisible, isLatest, isPinned, latestOrder, pinnedOrder, articleType, introContent, conclusionContent, readAlsoIds, relatedProductIds, draftKey]);

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      setTitle(d.title ?? '');
      setSubtitle(d.subtitle ?? '');
      setSlug(d.slug ?? '');
      setSlugTouched(true);
      setContent(d.content ?? '');
      setThumbnailUrl(d.thumbnailUrl ?? '');
      if (d.mainCategoryId) setMainCategoryId(d.mainCategoryId);
      if (d.sectionId !== undefined) setSectionId(d.sectionId ?? '');
      if (d.authorId !== undefined) setAuthorId(d.authorId);
      setSeoTitle(d.seoTitle ?? '');
      setSeoDescription(d.seoDescription ?? '');
      if (d.status) setStatus(d.status);
      setPublishedAt(d.publishedAt ?? '');
      if (d.isVisible !== undefined) setIsVisible(!!d.isVisible);
      if (d.isLatest !== undefined) setIsLatest(!!d.isLatest);
      if (d.isPinned !== undefined) setIsPinned(!!d.isPinned);
      if (d.latestOrder !== undefined) setLatestOrder(Number(d.latestOrder) || 0);
      if (d.pinnedOrder !== undefined) setPinnedOrder(Number(d.pinnedOrder) || 0);
      if (d.articleType) setArticleType(d.articleType);
      setIntroContent(d.introContent ?? '');
      setConclusionContent(d.conclusionContent ?? '');
      if (Array.isArray(d.readAlsoIds)) setReadAlsoIds(d.readAlsoIds);
      if (Array.isArray(d.relatedProductIds)) setRelatedProductIds(d.relatedProductIds);
    } catch {}
    setDraftNotice(null);
  }

  function discardDraft() {
    try { localStorage.removeItem(draftKey); } catch {}
    setDraftNotice(null);
  }

  // Fetch sections whenever the main category changes.
  useEffect(() => {
    if (!mainCategoryId) {
      setSections([]);
      setSectionId('');
      return;
    }
    let cancelled = false;
    setSectionsLoading(true);
    fetch(`/api/admin/sections?mainCategoryId=${encodeURIComponent(mainCategoryId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list: CategorySection[] = Array.isArray(data.sections) ? data.sections : [];
        setSections(list);
        setSectionId((prev) => (prev && list.some((s) => s.id === prev) ? prev : ''));
      })
      .catch(() => { if (!cancelled) setSections([]); })
      .finally(() => { if (!cancelled) setSectionsLoading(false); });
    return () => { cancelled = true; };
  }, [mainCategoryId]);

  const selectedCategory = mainCategories.find((c) => c.id === mainCategoryId);
  const selectedSection = sections.find((s) => s.id === sectionId);
  const selectedAuthor = authors.find((a) => a.id === authorId);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugifyClient(value));
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error || 'Image upload failed.'); return; }
      setThumbnailUrl(data.url);
    } catch { setError('Image upload failed. Please try again.'); }
    finally { setUploading(false); }
  }

  async function handleImageUrl() {
    const value = imageUrl.trim();
    if (!value) return;
    setUploading(true); setError('');
    try {
      const res = await fetch('/api/admin/upload-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value, title }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error || 'Image import failed.'); return; }
      setThumbnailUrl(data.url);
      setImageUrl('');
    } catch { setError('Image import failed. Please try again.'); }
    finally { setUploading(false); }
  }

  function validate(): string | null {
    if (!title.trim()) return 'Title is required.';
    if (!slug.trim()) return 'Slug is required.';
    if (!mainCategoryId) return 'Main category is required.';
    if (!content.trim()) return 'Content is required.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setSubmitting(true);
    try {
      const url = mode === 'create' ? '/api/admin/posts' : `/api/admin/posts/${articleId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slugifyClient(slug),
          subtitle: subtitle.trim() || undefined,
          content: content.trim(),
          // Send raw: '' = user explicitly removed the thumbnail (clears it),
          // non-empty = new/unchanged URL. The API preserves the existing
          // thumbnail only when the key is absent entirely.
          thumbnailUrl: thumbnailUrl,
          mainCategoryId,
          sectionId: sectionId || undefined,
          authorId,
          seoTitle: seoTitle.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
          status,
          publishedAt: publishedAt || undefined,
          isVisible,
          isLatest,
          isPinned,
          latestOrder: Number.isFinite(Number(latestOrder)) ? Number(latestOrder) : 0,
          pinnedOrder: Number.isFinite(Number(pinnedOrder)) ? Number(pinnedOrder) : 0,
          articleType,
          introContent: introContent.trim() || undefined,
          conclusionContent: conclusionContent.trim() || undefined,
          readAlsoIds,
          relatedProductIds: relatedProductIds.length > 0 ? relatedProductIds : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error || 'Failed to save article.'); setSubmitting(false); return; }
      try { localStorage.removeItem(draftKey); } catch {}
      window.location.href = '/adminmja';
    } catch { setError('Something went wrong. Please try again.'); setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Unsaved draft notice (A3) */}
      {draftNotice && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <p className="font-medium">Unsaved draft found (autosaved {new Date(draftNotice.savedAt).toLocaleString()}).</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={restoreDraft} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              Restore draft
            </button>
            <button type="button" onClick={discardDraft} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="text-sm font-medium" htmlFor="title">
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            Title *
          </span>
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter article title..."
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-lg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="text-sm font-medium" htmlFor="subtitle">Subtitle</label>
        <input
          id="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Optional short description"
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="text-sm font-medium" htmlFor="slug">Slug *</label>
        <input
          id="slug"
          required
          value={slug}
          onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          URL: <span className="font-mono">/{selectedCategory?.slug ?? '[category]'}/{selectedSection?.slug ? `${selectedSection.slug}/` : ''}{slug || '[slug]'}</span>
        </p>
      </div>

      {/* Main Category (static 7) */}
      <div>
        <label className="text-sm font-medium" htmlFor="mainCategory">Main Category *</label>
        <select
          id="mainCategory"
          value={mainCategoryId}
          onChange={(e) => setMainCategoryId(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        >
          {mainCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.displayName}</option>
          ))}
        </select>
      </div>

      {/* Section (fetched dynamically for the chosen category) */}
      <div>
        <label className="text-sm font-medium" htmlFor="section">Section</label>
        <p className="mt-1 text-xs text-muted-foreground">
          Sections update automatically when you change the main category.
        </p>
        <select
          id="section"
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          disabled={sectionsLoading || sections.length === 0}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        >
          <option value="">
            {sectionsLoading ? 'Loading sections…' : sections.length === 0 ? 'No sections — article stays unsectioned' : 'No section (unsectioned)'}
          </option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}{s.isHidden ? ' (hidden)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Author */}
      <div>
        <label className="text-sm font-medium" htmlFor="author">Author</label>
        <select
          id="author"
          value={authorId ? String(authorId) : ''}
          onChange={(e) => setAuthorId(e.target.value ? Number(e.target.value) : null)}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">— No author —</option>
          {authors.map((a) => (
            <option key={a.id} value={String(a.id)}>
              {a.name}{a.role ? ` (${a.role})` : ''}
            </option>
          ))}
        </select>
        {selectedAuthor && (
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedAuthor.bio && <span>{selectedAuthor.bio}</span>}
          </p>
        )}
      </div>

      {/* Thumbnail */}
      <div>
        <label className="text-sm font-medium">Thumbnail</label>
        {thumbnailUrl ? (
          <div className="mt-1.5">
            <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border sm:h-56">
              <Image src={thumbnailUrl} alt="Thumbnail preview" fill className="object-cover" sizes="(max-width: 640px) 100vw, 640px" />
              <button
                type="button"
                onClick={() => setThumbnailUrl('')}
                className="absolute right-2 top-2 flex items-center gap-1.5 rounded-lg bg-background/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1.5 space-y-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => setImageMode('upload')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${imageMode === 'upload' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
                <Upload className="h-3.5 w-3.5" /> Upload File
              </button>
              <button type="button" onClick={() => setImageMode('url')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${imageMode === 'url' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
                <Link2 className="h-3.5 w-3.5" /> Paste URL
              </button>
            </div>
            {imageMode === 'upload' ? (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                {uploading ? 'Uploading...' : 'Click to upload or drag image here'}
              </button>
            ) : (
              <div className="flex gap-2">
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleImageUrl(); } }} />
                <button type="button" onClick={handleImageUrl} disabled={!imageUrl.trim() || uploading} className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {uploading ? 'Importing...' : 'Import'}
                </button>
              </div>
            )}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageSelect} className="hidden" />
      </div>

      {/* Article Type */}
      <div>
        <label className="text-sm font-medium">Article Type</label>
        <div className="mt-1.5 flex gap-3">
          <label className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm cursor-pointer transition-colors ${articleType === 'standard' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
            <input type="radio" name="articleType" value="standard" checked={articleType === 'standard'} onChange={() => setArticleType('standard')} className="h-4 w-4 text-primary" />
            <File className="h-4 w-4" />
            <span>Standard article</span>
          </label>
          <label className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm cursor-pointer transition-colors ${articleType === 'listicle' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
            <input type="radio" name="articleType" value="listicle" checked={articleType === 'listicle'} onChange={() => setArticleType('listicle')} className="h-4 w-4 text-primary" />
            <List className="h-4 w-4" />
            <span>Product/List article</span>
          </label>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {articleType === 'standard' ? 'Regular article with single content body.' : 'Multi-item product list (best-of, roundups). Items managed separately after save.'}
        </p>
      </div>

      {/* Read Also — plain-title links with embedded article URLs */}
      <ReadAlsoPicker articles={allArticles} value={readAlsoIds} onChange={setReadAlsoIds} />

      {/* Related Products — product cards grouped by category on the article page */}
      <RelatedProductsPicker value={relatedProductIds} onChange={setRelatedProductIds} />

      {/* Content — only for standard type */}
      {articleType === 'standard' && (
        <div>
          <label className="text-sm font-medium" htmlFor="content">Content *</label>
          <div className="mt-1.5 rounded-xl border border-input bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <div className="flex flex-wrap gap-1 border-b border-border px-3 py-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono">## Heading</span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono">- Bullet</span>
            </div>
            <textarea id="content" rows={16} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your article content here..." className="w-full resize-y rounded-b-xl border-0 bg-transparent px-4 py-3 font-mono text-sm leading-relaxed outline-none" />
          </div>
        </div>
      )}

      {/* Listicle fields — only for listicle type */}
      {articleType === 'listicle' && (
        <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/50">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4"/> Listicle Content</h3>
          <div>
            <label className="text-sm font-medium" htmlFor="introContent">Introduction</label>
            <textarea id="introContent" rows={6} value={introContent} onChange={(e) => setIntroContent(e.target.value)} placeholder="Introductory text before the product list..." className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="conclusionContent">Conclusion</label>
            <textarea id="conclusionContent" rows={4} value={conclusionContent} onChange={(e) => setConclusionContent(e.target.value)} placeholder="Final thoughts after the list..." className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:border-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Product items are added/edited via the "Items" tab after saving this article.</p>
        </div>
      )}

      {/* SEO Fields */}
      <details className="group rounded-xl border border-border p-4">
        <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-medium">
          <Shield className="h-4 w-4 text-muted-foreground" />
          SEO & Publishing
        </summary>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm"><span className="font-medium">SEO Title</span>
              <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Leave empty to use article title" className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-1 text-sm"><span className="font-medium">SEO Description</span>
              <input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Leave empty to auto-generate from subtitle" className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="status" value="Draft" checked={status === 'Draft'} onChange={() => setStatus('Draft')} className="h-4 w-4 text-primary" />
              <span>Draft</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="status" value="Published" checked={status === 'Published'} onChange={() => setStatus('Published')} className="h-4 w-4 text-primary" />
              <span>Published</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="status" value="Archived" checked={status === 'Archived'} onChange={() => setStatus('Archived')} className="h-4 w-4 text-primary" />
              <span>Archived</span>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Published At (ISO)</span>
            <input type="datetime-local" value={publishedAt ? publishedAt.slice(0, 16) : ''} onChange={(e) => setPublishedAt(e.target.value ? new Date(e.target.value).toISOString() : '')} className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
          </label>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="h-4 w-4 text-primary" />
              <span>Visible on site</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isLatest} onChange={(e) => setIsLatest(e.target.checked)} className="h-4 w-4 text-primary" />
              <span>Show in Latest</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="h-4 w-4 text-primary" />
              <span>Pin to Top</span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Latest Order (priority)</span>
              <input type="number" value={latestOrder} onChange={(e) => setLatestOrder(Number(e.target.value) || 0)} min={0} className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Pinned Order (priority)</span>
              <input type="number" value={pinnedOrder} onChange={(e) => setPinnedOrder(Number(e.target.value) || 0)} min={0} className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
            </label>
          </div>
        </div>
      </details>

      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 font-semibold transition-colors hover:bg-muted"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button type="submit" disabled={submitting || uploading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50">
          {submitting ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> {mode === 'create' ? 'Publishing...' : 'Saving...'}</>
          ) : (
            mode === 'create' ? 'Publish Article' : 'Save Changes'
          )}
        </button>
      </div>
      {lastAutosaved && (
        <p className="-mt-4 text-xs text-muted-foreground">Draft autosaved at {lastAutosaved}. Restores if the browser closes unexpectedly.</p>
      )}

      {/* Article preview modal (A2) */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4" onClick={() => setShowPreview(false)}>
          <div
            className="mx-auto my-8 w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preview</h3>
              <button onClick={() => setShowPreview(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted" aria-label="Close preview">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-6 sm:px-8">
              {thumbnailUrl && (
                <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
                  <Image src={thumbnailUrl} alt="" fill className="object-contain" sizes="(max-width: 768px) 100vw, 48rem" />
                </div>
              )}
              <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{title || 'Untitled article'}</h1>
              {subtitle && <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>}
              <div className="prose-article mt-6">
                {articleType === 'listicle' ? (
                  <>
                    {introContent && <Markdown content={introContent} />}
                    <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                      Product items are managed separately and will render here.
                    </p>
                    {conclusionContent && <Markdown content={conclusionContent} />}
                  </>
                ) : (
                  content ? <Markdown content={content} /> : <p className="text-sm text-muted-foreground">No content yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}