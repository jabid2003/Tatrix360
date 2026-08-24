'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Upload, X } from 'lucide-react';
import type { Category, Post } from '@/lib/types';

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
  authorNames: string[];
  mode: 'create' | 'edit';
  postId?: number;
  initialPost?: Post;
}

export function ArticleForm({ categories, authorNames, mode, postId, initialPost }: ArticleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [slug, setSlug] = useState(initialPost?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [subtitle, setSubtitle] = useState(initialPost?.subtitle ?? '');
  const [content, setContent] = useState(initialPost?.content ?? '');
  const [categoryId, setCategoryId] = useState(initialPost?.category?.id?.toString() ?? '');
  const [authorName, setAuthorName] = useState(initialPost?.author?.name ?? '');
  const [tagsInput, setTagsInput] = useState(initialPost?.tags?.map((t) => t.name).join(', ') ?? '');
  const [heroImage, setHeroImage] = useState(initialPost?.heroImage ?? '');
  const [postType, setPostType] = useState(initialPost?.postType ?? '');
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialPost?.seoDescription ?? '');
  const [featured, setFeatured] = useState(initialPost?.featured ?? false);
  const [status, setStatus] = useState(initialPost?.status ?? 'Draft');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'Image upload failed.');
        setUploading(false);
        return;
      }

      setHeroImage(data.url);
    } catch {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function validate(): string | null {
    if (!title.trim()) return 'Title is required.';
    if (!slug.trim()) return 'Slug is required.';

    if (status === 'Published') {
      if (!categoryId) return 'Category is required to publish.';
      if (!authorName.trim()) return 'Author is required to publish.';
      const tagNames = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagNames.length === 0) return 'At least one tag is required to publish.';
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

    const tagNames = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      subtitle: subtitle.trim() || undefined,
      content: content.trim() || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      authorName: authorName.trim(),
      tagNames,
      heroImage: heroImage || undefined,
      postType: postType || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      featured,
      status,
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

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Title & slug */}
      <div>
        <label className="text-sm font-medium" htmlFor="title">Title *</label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="slug">Slug *</label>
        <input
          id="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          URL will be: /{categories.find((c) => c.id.toString() === categoryId)?.slug ?? '[category]'}/{slug || '[slug]'}
        </p>
      </div>

      {/* Subtitle */}
      <div>
        <label className="text-sm font-medium" htmlFor="subtitle">Subtitle</label>
        <input
          id="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Hero image */}
      <div>
        <label className="text-sm font-medium">Hero image</label>

        {heroImage ? (
          <div className="mt-1.5 flex items-center gap-3">
            <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-border">
              <Image src={heroImage} alt="Hero preview" fill className="object-cover" sizes="128px" />
            </div>
            <button
              type="button"
              onClick={() => setHeroImage('')}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-1.5 flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading...' : 'Upload image'}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {/* Category, author, post type — grid on larger screens */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium" htmlFor="category">
            Category {status === 'Published' && '*'}
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="author">
            Author {status === 'Published' && '*'}
          </label>
          <input
            id="author"
            list="author-suggestions"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Type name..."
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <datalist id="author-suggestions">
            {authorNames.map((name) => <option key={name} value={name} />)}
          </datalist>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="postType">Type</label>
          <select
            id="postType"
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">None</option>
            {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium" htmlFor="tags">
          Tags {status === 'Published' && '*'} <span className="font-normal text-muted-foreground">(comma-separated)</span>
        </label>
        <input
          id="tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="ai, chatbots, openai"
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          New tag names are created automatically. Existing ones are reused.
        </p>
      </div>

      {/* Content */}
      <div>
        <label className="text-sm font-medium" htmlFor="content">Content</label>
        <textarea
          id="content"
          rows={14}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'Use ## for a heading and - for a bullet point.'}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* SEO */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="seoTitle">SEO title</label>
          <input
            id="seoTitle"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="seoDescription">SEO description</label>
          <input
            id="seoDescription"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Status & featured */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-sm font-medium" htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="mt-1.5 rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 pb-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Featured
        </label>
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === 'create' ? 'Create article' : 'Save changes'}
      </button>
    </form>
  );
}