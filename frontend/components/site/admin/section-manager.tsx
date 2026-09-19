'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Trash2, Eye, EyeOff, Pencil, X, Check } from 'lucide-react';
import type { MainCategory, CategorySection } from '@/lib/sections';

export interface GroupedSections {
  category: MainCategory;
  sections: CategorySection[];
}

function slugifyClient(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function SectionManager({
  mainCategories,
  initialGrouped,
}: {
  mainCategories: MainCategory[];
  initialGrouped: GroupedSections[];
}) {
  const router = useRouter();

  // Create form
  const [newCategoryId, setNewCategoryId] = useState(mainCategories[0]?.id ?? '');
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);

  // Row busy state: `${action}:${id}`
  const [busy, setBusy] = useState('');
  const [flash, setFlash] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editSort, setEditSort] = useState('0');

  function showFlash(kind: 'success' | 'error', text: string) {
    setFlash({ kind, text });
    window.setTimeout(() => setFlash(null), 4000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newCategoryId) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainCategoryId: newCategoryId,
          title: newTitle.trim(),
          slug: newSlug.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showFlash('error', data.error || 'Failed to create section.');
        return;
      }
      setNewTitle('');
      setNewSlug('');
      showFlash('success', `Section "${data.section.title}" created.`);
      router.refresh();
    } catch {
      showFlash('error', 'Something went wrong.');
    } finally {
      setCreating(false);
    }
  }

  async function patchSection(id: string, patch: Record<string, unknown>, action: string) {
    setBusy(`${action}:${id}`);
    try {
      const res = await fetch(`/api/admin/sections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        showFlash('error', data.error || 'Update failed.');
        return false;
      }
      router.refresh();
      return true;
    } catch {
      showFlash('error', 'Something went wrong.');
      return false;
    } finally {
      setBusy('');
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete section "${title}"? Its articles stay published but become unsectioned.`)) return;
    setBusy(`delete:${id}`);
    try {
      const res = await fetch(`/api/admin/sections/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        showFlash('error', data.error || 'Delete failed.');
        return;
      }
      showFlash('success', `Deleted "${title}".`);
      router.refresh();
    } catch {
      showFlash('error', 'Something went wrong.');
    } finally {
      setBusy('');
    }
  }

  function startEdit(s: CategorySection) {
    setEditingId(s.id);
    setEditTitle(s.title);
    setEditSlug(s.slug);
    setEditSort(String(s.sortOrder));
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim() || !editSlug.trim()) {
      showFlash('error', 'Title and slug cannot be empty.');
      return;
    }
    const ok = await patchSection(
      id,
      { title: editTitle.trim(), slug: editSlug.trim(), sortOrder: Number(editSort) || 0 },
      'edit'
    );
    if (ok) setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-8">
      {flash && (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            flash.kind === 'success'
              ? 'border-primary/30 bg-primary/5 text-foreground'
              : 'border-destructive/30 bg-destructive/5 text-destructive'
          }`}
        >
          {flash.text}
        </p>
      )}

      {/* Create */}
      <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Plus className="h-4 w-4 text-primary" />
          New section
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Main category</span>
            <select
              value={newCategoryId}
              onChange={(e) => setNewCategoryId(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"
            >
              {mainCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Title *</span>
            <input
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (!newSlug) setNewSlug(slugifyClient(e.target.value));
              }}
              placeholder="e.g. Model Launches"
              className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Slug</span>
            <input
              value={newSlug}
              onChange={(e) => setNewSlug(slugifyClient(e.target.value))}
              placeholder="auto from title"
              className="rounded-xl border border-input bg-background px-3 py-2.5 font-mono outline-none focus:border-primary"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating || !newTitle.trim() || !newCategoryId}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add section
            </button>
          </div>
        </div>
      </form>

      {/* Grouped lists */}
      {initialGrouped.map(({ category, sections }) => (
        <section key={category.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold">{category.displayName}</h2>
            <span className="text-xs text-muted-foreground">
              {sections.length} {sections.length === 1 ? 'section' : 'sections'}
            </span>
          </div>

          {sections.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              No sections yet for {category.displayName}.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {sections.map((s) => (
                <li
                  key={s.id}
                  className={`rounded-xl border border-border px-3 py-2.5 ${s.isHidden ? 'opacity-60' : ''}`}
                >
                  {editingId === s.id ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_5rem_auto]">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        placeholder="Title"
                      />
                      <input
                        value={editSlug}
                        onChange={(e) => setEditSlug(slugifyClient(e.target.value))}
                        className="rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
                        placeholder="slug"
                      />
                      <input
                        value={editSort}
                        onChange={(e) => setEditSort(e.target.value)}
                        inputMode="numeric"
                        title="Sort order"
                        className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => saveEdit(s.id)}
                          disabled={busy === `edit:${s.id}`}
                          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                          aria-label="Save"
                        >
                          {busy === `edit:${s.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-border px-3 py-2 text-sm"
                          aria-label="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs tabular-nums text-muted-foreground">#{s.sortOrder}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {s.title}
                          {s.isHidden && (
                            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Hidden
                            </span>
                          )}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          /{category.slug}/{s.slug}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => patchSection(s.id, { isHidden: !s.isHidden }, 'vis')}
                        disabled={busy === `vis:${s.id}`}
                        title={s.isHidden ? 'Show section' : 'Hide section'}
                        className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        {busy === `vis:${s.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : s.isHidden ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Edit ${s.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.title)}
                        disabled={busy === `delete:${s.id}`}
                        className="rounded-lg border border-destructive/30 p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                        aria-label={`Delete ${s.title}`}
                      >
                        {busy === `delete:${s.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
