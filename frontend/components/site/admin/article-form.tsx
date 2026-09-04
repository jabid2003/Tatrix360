'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Loader2,
  Upload,
  X,
  Link2,
  FileText,
  Tag,
  Search,
  Star,
  Globe,
  ArrowLeft,
  Plus,
  Check,
  BookOpen,
  Download,
} from 'lucide-react';
import type { Category, Post, Subcategory, Tag } from '@/lib/types';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const POST_TYPES = ['News', 'Review', 'Guide', 'Opinion'] as const;
const STATUSES = ['Draft', 'Published', 'Archived'] as const;

export interface ArticleFormProps {
  categories: Category[];
  subcategories: Subcategory[];
  authorNames: string[];
  mode: 'create' | 'edit';
  postId?: number;
  initialPost?: Post;
  allPosts?: Post[];
  allTags?: Tag[];
}

export function ArticleForm({ categories, subcategories, authorNames, mode, postId, initialPost, allPosts = [], allTags = [] }: ArticleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [slug, setSlug] = useState(initialPost?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [subtitle, setSubtitle] = useState(initialPost?.subtitle ?? '');
  const [content, setContent] = useState(initialPost?.content ?? '');

  // Single category (admin can select only one)
  const initialCategoryId = initialPost?.categories?.[0]?.id ?? initialPost?.category?.id ?? '';
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>(initialCategoryId as number | '');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Single subcategory. Options are filtered by the selected main category.
  const [subcategoryId, setSubcategoryId] = useState<number | ''>(
    initialPost?.subcategory?.id ?? ''
  );

  // Subcategories belonging to the selected category
  const availableSubcategories = subcategories.filter((s) =>
    selectedCategoryId !== '' ? s.categoryId === selectedCategoryId : true
  );

  const [authorName, setAuthorName] = useState(initialPost?.author?.name ?? '');
  // Multi-select tags: names persist through the form, find-or-create on save.
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>(
    initialPost?.tags?.map((t) => t.name) ?? []
  );

  const [heroImage, setHeroImage] = useState(initialPost?.heroImage ?? '');
  const [heroPublicId, setHeroPublicId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [postType, setPostType] = useState(initialPost?.postType ?? '');
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialPost?.seoDescription ?? '');
  const [featured, setFeatured] = useState(initialPost?.featured ?? false);
  const [status, setStatus] = useState(initialPost?.status ?? 'Draft');

  // Read Also state
  const [readAlsoIds, setReadAlsoIds] = useState<number[]>(initialPost?.readAlsoIds ?? []);
  const [readAlsoSearch, setReadAlsoSearch] = useState('');
  const [showReadAlsoDropdown, setShowReadAlsoDropdown] = useState(false);

  // Tags state
  const [tagSearch, setTagSearch] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [showMoreTags, setShowMoreTags] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>(initialPost?.heroImage?.startsWith('http') && !initialPost?.heroImage?.includes('cloudinary') ? 'url' : 'upload');

  const [allCategories, setAllCategories] = useState<Category[]>(categories);

  // --- Category helpers ---
  const filteredCategories = allCategories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // --- Read Also helpers ---
  const filteredReadAlsoPosts = allPosts.filter((p) => {
    if (readAlsoIds.includes(p.id)) return false;
    if (postId && p.id === postId) return false; // exclude self
    return p.title.toLowerCase().includes(readAlsoSearch.toLowerCase());
  });

  const readAlsoSelectedPosts = allPosts.filter((p) => readAlsoIds.includes(p.id));

  function toggleReadAlso(postId: number) {
    setReadAlsoIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
    setReadAlsoSearch('');
    setShowReadAlsoDropdown(false);
  }

  // --- Tag helpers (multi-select via checkboxes) ---
  const tagQuery = tagSearch.trim().toLowerCase();
  const filteredAllTags = allTags
    .filter((t) => tagQuery === '' || t.name.toLowerCase().includes(tagQuery))
    .sort((a, b) => a.name.localeCompare(b.name));

  const tagLimit = showMoreTags ? filteredAllTags.length : 12;
  const visibleTags = filteredAllTags.slice(0, tagLimit);

  function toggleTag(name: string) {
    setSelectedTagNames((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  }

  function addCustomTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!selectedTagNames.includes(trimmed)) {
      setSelectedTagNames((prev) => [...prev, trimmed]);
    }
    setNewTagName('');
    setTagSearch('');
  }

  function selectCategory(categoryId: number) {
    const isSame = selectedCategoryId === categoryId;
    const next = isSame ? '' : categoryId;
    setSelectedCategoryId(next as number | '');
    // If we changed category and the chosen subcategory no longer belongs, clear it.
    if (subcategoryId) {
      const sub = subcategories.find((s) => s.id === Number(subcategoryId));
      if (sub && sub.categoryId !== undefined && sub.categoryId !== next) {
        setSubcategoryId('');
      }
    }
    setShowCategoryDropdown(false);
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) return;

    setCreatingCategory(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (data.ok && data.category) {
        setAllCategories((prev) => [...prev, data.category]);
        setSelectedCategoryId(data.category.id);
        setNewCategoryName('');
        setCategorySearch('');
        setShowCategoryDropdown(false);
      }
    } catch {
      // ignore
    } finally {
      setCreatingCategory(false);
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'Image upload failed.');
        setUploading(false);
        return;
      }

      setHeroImage(data.url);
      setHeroPublicId(data.publicId);
    } catch {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleImageUrl() {
    const value = imageUrl.trim();
    if (!value) return;

    setUploading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/upload-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value, title }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'Image import failed.');
        return;
      }

      setHeroImage(data.url);
      setHeroPublicId(data.publicId);
      setImageUrl('');
    } catch {
      setError('Image import failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage() {
    if (heroPublicId) {
      fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: heroPublicId }),
      });
    }
    setHeroImage('');
    setHeroPublicId('');
  }

  function validate(): string | null {
    if (!title.trim()) return 'Title is required.';
    if (!slug.trim()) return 'Slug is required.';

    if (status === 'Published') {
      if (selectedCategoryId === '') return 'A category is required to publish.';
      if (!authorName.trim()) return 'Author is required to publish.';
      if (selectedTagNames.length === 0) return 'At least one tag is required to publish.';
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const tagNames = [...new Set(selectedTagNames.map((t) => t.trim()).filter(Boolean))];

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      subtitle: subtitle.trim() || undefined,
      content: content.trim() || undefined,
      categoryId: selectedCategoryId === '' ? undefined : Number(selectedCategoryId),
      categoryIds: selectedCategoryId === '' ? [] : [Number(selectedCategoryId)],
      subcategoryId: subcategoryId === '' ? undefined : Number(subcategoryId),
      authorName: authorName.trim(),
      tagNames,
      heroImage: heroImage || undefined,
      postType: postType || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      featured,
      status,
      readAlsoIds: readAlsoIds.length > 0 ? readAlsoIds : undefined,
    };

    try {
      const url = mode === 'create' ? '/api/admin/posts' : `/api/admin/posts/${postId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'Failed to save article.');
        setSubmitting(false);
        return;
      }

      // Hard reload after publishing so the dashboard (and public cache)
      // immediately reflects the latest article / UI changes.
      window.location.href = '/adminmja';
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  // Full-load guard: never allow editing/saving until the post is fully loaded.
  const fullyLoaded = mode === 'create' || !!initialPost?.id && !!title;
  if (mode === 'edit' && !fullyLoaded) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          Post data is still loading. Please wait a moment before editing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

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
          URL: <span className="font-mono">/{allCategories.find((c) => c.id === selectedCategoryId)?.slug ?? '[category]'}/{slug || '[slug]'}</span>
        </p>
      </div>

      {/* Subtitle */}
      <div>
        <label className="text-sm font-medium" htmlFor="subtitle">Subtitle / Summary</label>
        <input
          id="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Brief summary of the article..."
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Hero Image */}
      <div>
        <label className="text-sm font-medium">
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            Hero Image
          </span>
        </label>

        {heroImage ? (
          <div className="mt-1.5">
            <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border sm:h-56">
              <Image src={heroImage} alt="Hero preview" fill className="object-cover" sizes="(max-width: 640px) 100vw, 640px" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute right-2 top-2 flex items-center gap-1.5 rounded-lg bg-background/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="max-w-full truncate font-mono text-xs text-muted-foreground" title={heroImage}>
                {heroImage}
              </span>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(heroImage)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Copy URL
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
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleImageUrl(); } }} />
                  <button type="button" onClick={handleImageUrl} disabled={!imageUrl.trim() || uploading} className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {uploading ? 'Importing...' : 'Import'}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The image is fetched by Cloudinary and saved to your library — works with any direct image URL.
                </p>
              </div>
            )}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageSelect} className="hidden" />
      </div>

      {/* Multi-Category Selector */}
      <div>
        <label className="text-sm font-medium">
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            Categories {status === 'Published' && '*'}
          </span>
        </label>
        <p className="mt-1 text-xs text-muted-foreground">Select one category for this article.</p>

        {/* Selected category */}
        {selectedCategoryId !== '' && (
          <div className="mt-2 flex flex-wrap gap-2">
            {(() => {
              const cat = allCategories.find((c) => c.id === selectedCategoryId);
              if (!cat) return null;
              return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {cat.name}
                  <button type="button" onClick={() => setSelectedCategoryId('')} className="rounded-full hover:bg-primary/20 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })()}
          </div>
        )}

        {/* Category dropdown */}
        <div className="relative mt-2">
          <button
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex w-full items-center justify-between rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <span className={selectedCategoryId === '' ? 'text-muted-foreground' : 'text-foreground'}>
              {selectedCategoryId === '' ? 'Select category...' : allCategories.find((c) => c.id === selectedCategoryId)?.name ?? 'Select category...'}
            </span>
            <Search className="h-4 w-4 text-muted-foreground" />
          </button>

          {showCategoryDropdown && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="border-b border-border p-2">
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => selectCategory(cat.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${selectedCategoryId === cat.id ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}>
                      {selectedCategoryId === cat.id && <Check className="h-3 w-3" />}
                    </div>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
              {/* Create new category inline */}
              <div className="border-t border-border p-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || creatingCategory}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
                  >
                    {creatingCategory ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Click outside to close */}
        {showCategoryDropdown && (
          <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
        )}
      </div>

      {/* Subcategory Selector */}
      <div>
        <label className="text-sm font-medium" htmlFor="subcategory">
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            Subcategory
          </span>
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Optional. Choose a subcategory that matches the selected category.
        </p>
        <select
          id="subcategory"
          value={subcategoryId}
          onChange={(e) => setSubcategoryId(e.target.value === '' ? '' : Number(e.target.value))}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">No subcategory</option>
          {availableSubcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
          {availableSubcategories.length === 0 && (
            <option value="" disabled>No subcategories for selected categories</option>
          )}
        </select>
      </div>

      {/* Post Type */}
      <div>
        <label className="text-sm font-medium" htmlFor="postType">
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            Article Type
          </span>
        </label>
        <select id="postType" value={postType} onChange={(e) => setPostType(e.target.value)} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary">
          <option value="">Select type...</option>
          {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Author */}
      <div>
        <label className="text-sm font-medium" htmlFor="author">
          Author {status === 'Published' && '*'}
        </label>
        <input id="author" list="author-suggestions" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Type author name..." className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" />
        <datalist id="author-suggestions">
          {authorNames.map((name) => <option key={name} value={name} />)}
        </datalist>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium" htmlFor="tags">
          Tags {status === 'Published' && '*'}
        </label>
        <p className="mt-1 text-xs text-muted-foreground">Select one or more tags for this article.</p>

        {/* Selected tags as pills */}
        {selectedTagNames.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTagNames.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                #{tag}
                <button type="button" onClick={() => toggleTag(tag)} className="rounded-full hover:bg-primary/20 p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Filter input */}
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            placeholder="Filter tags..."
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Checkbox list */}
        {allTags.length > 0 ? (
          <>
            <div className="mt-2 grid max-h-56 grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-border p-2 sm:grid-cols-2">
              {visibleTags.length === 0 && (
                <p className="col-span-full px-2 py-3 text-sm text-muted-foreground">No tags match &quot;{tagSearch}&quot;.</p>
              )}
              {visibleTags.map((tag) => {
                const isSelected = selectedTagNames.includes(tag.name);
                return (
                  <label
                    key={tag.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isSelected ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTag(tag.name)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <span className="truncate">{tag.name}</span>
                  </label>
                );
              })}
            </div>

            {filteredAllTags.length > 12 && (
              <button
                type="button"
                onClick={() => setShowMoreTags((prev) => !prev)}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                {showMoreTags ? 'Show fewer tags' : `Show all ${filteredAllTags.length} tags`}
              </button>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No tags exist yet. Add one below.</p>
        )}

        {/* Add custom tag */}
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Add custom tag..."
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(newTagName); } }}
          />
          <button
            type="button"
            onClick={() => addCustomTag(newTagName)}
            disabled={!newTagName.trim()}
            className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Use OS tags (android, ios, windows) or product tags (phones-under-10000) for filtering.
        </p>
      </div>

      {/* Read Also Links */}
      <div>
        <label className="text-sm font-medium">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            Add &quot;Read Also&quot; Links
          </span>
        </label>
        <p className="mt-1 text-xs text-muted-foreground">Link related articles that appear mid-way inside the content.</p>

        {/* Selected read also posts */}
        {readAlsoSelectedPosts.length > 0 && (
          <div className="mt-2 space-y-2">
            {readAlsoSelectedPosts.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="flex-1 truncate text-sm">{p.title}</span>
                <button
                  type="button"
                  onClick={() => toggleReadAlso(p.id)}
                  className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Read Also search dropdown */}
        <div className="relative mt-2">
          <input
            type="text"
            value={readAlsoSearch}
            onChange={(e) => {
              setReadAlsoSearch(e.target.value);
              setShowReadAlsoDropdown(true);
            }}
            onFocus={() => setShowReadAlsoDropdown(true)}
            placeholder="Search articles to link..."
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />

          {showReadAlsoDropdown && (
            <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg" onClick={(e) => e.stopPropagation()}>
              {filteredReadAlsoPosts.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  {readAlsoSearch ? 'No articles match your search.' : 'No more articles available.'}
                </p>
              ) : (
                <>
                  {readAlsoSearch === '' && (
                    <p className="sticky top-0 bg-card px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                      All articles — {filteredReadAlsoPosts.length} available • Type to search
                    </p>
                  )}
                  {filteredReadAlsoPosts.slice(0, 50).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleReadAlso(p.id)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                    >
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{p.title}</p>
                        {p.category && (
                          <p className="text-xs text-muted-foreground">{p.category.name}</p>
                        )}
                      </div>
                      <Plus className="h-3.5 w-3.5 shrink-0 text-primary" />
                    </button>
                  ))}
                  </>
                )}
              </div>
            )}
        </div>

        {showReadAlsoDropdown && (
          <div className="fixed inset-0 z-40" onClick={() => setShowReadAlsoDropdown(false)} />
        )}
      </div>

      {/* Content */}
      <div>
        <label className="text-sm font-medium" htmlFor="content">Content</label>
        <div className="mt-1.5 rounded-xl border border-input bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          <div className="flex flex-wrap gap-1 border-b border-border px-3 py-2 text-xs text-muted-foreground">
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono">## Heading</span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono">- Bullet</span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono">**bold**</span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono">*italic*</span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono">[link](url)</span>
          </div>
          <textarea id="content" rows={16} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your article content here... Use Markdown syntax for formatting." className="w-full resize-y rounded-b-xl border-0 bg-transparent px-4 py-3 font-mono text-sm leading-relaxed outline-none" />
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-xl border border-border p-4">
        <h3 className="mb-3 text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            SEO Settings
          </span>
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium" htmlFor="seoTitle">SEO Title</label>
            <input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title || 'Auto-generated from title'} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" />
            <p className="mt-1 text-xs text-muted-foreground">{seoTitle.length}/60 characters recommended</p>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="seoDescription">SEO Description</label>
            <input id="seoDescription" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder={subtitle || 'Brief description for search engines'} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" />
            <p className="mt-1 text-xs text-muted-foreground">{seoDescription.length}/160 characters recommended</p>
          </div>
        </div>
      </div>

      {/* Status & Featured */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border p-4">
        <div>
          <label className="text-sm font-medium" htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="mt-1.5 rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 pb-3 text-sm font-medium">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-input" />
          <Star className="h-3.5 w-3.5 text-muted-foreground" />
          Featured article
        </label>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      {/* Submit */}
      <button type="submit" disabled={submitting || uploading} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50">
        {submitting ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> {mode === 'create' ? 'Creating...' : 'Saving...'}</>
        ) : (
          mode === 'create' ? 'Create Article' : 'Save Changes'
        )}
      </button>
    </form>
  );
}
