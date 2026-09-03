'use client';

import { useState } from 'react';
import { Plus, Trash2, Folder, ChevronDown, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { Category, Subcategory } from '@/lib/types';

interface CategoryManagerProps {
  categories: Category[];
  subcategories: Subcategory[];
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function CategoryManager({ categories: initialCategories, subcategories: initialSubcategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories);

  // Add category form
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  // Add subcategory form
  const [subCatId, setSubCatId] = useState<number | ''>('');
  const [subName, setSubName] = useState('');
  const [addingSub, setAddingSub] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const categoriesById = new Map(categories.map((c) => [c.id, c]));

  function flash(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleAddCategory() {
    const name = newCatName.trim();
    if (!name) return;
    setAddingCat(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.ok && data.category) {
        setCategories((prev) => [...prev, data.category]);
        setNewCatName('');
        flash('success', `Added category "${data.category.name}".`);
      } else {
        flash('error', data.error || 'Failed to add category.');
      }
    } catch {
      flash('error', 'Failed to add category.');
    } finally {
      setAddingCat(false);
    }
  }

  async function handleAddSubcategory() {
    const name = subName.trim();
    if (!name || subCatId === '') {
      flash('error', 'Select a main category and enter a name.');
      return;
    }
    setAddingSub(true);
    try {
      const res = await fetch('/api/admin/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug: slugify(name), categoryId: Number(subCatId) }),
      });
      const data = await res.json();
      if (data.ok && data.subcategory) {
        setSubcategories((prev) => [...prev, data.subcategory]);
        setSubName('');
        flash('success', `Added subcategory "${data.subcategory.name}".`);
      } else {
        flash('error', data.error || 'Failed to add subcategory.');
      }
    } catch {
      flash('error', 'Failed to add subcategory.');
    } finally {
      setAddingSub(false);
    }
  }

  async function handleDeleteSubcategory(id: number, name: string) {
    if (!confirm(`Delete subcategory "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/subcategories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setSubcategories((prev) => prev.filter((s) => s.id !== id));
        flash('success', `Deleted subcategory "${name}".`);
      } else {
        flash('error', data.error || 'Failed to delete subcategory.');
      }
    } catch {
      flash('error', 'Failed to delete subcategory.');
    }
  }

  const subsByCategory = (catId: number) =>
    subcategories
      .filter((s) => s.categoryId === catId || s.category?.id === catId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div className="space-y-8">
      {message && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-primary/30 bg-primary/5 text-primary' : 'border-destructive/30 bg-destructive/5 text-destructive'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Add main category */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Folder className="h-4 w-4 text-primary" />
          Add Main Category
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Category name (e.g. AI, Gadgets)"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
          />
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={!newCatName.trim() || addingCat}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            {addingCat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Save
          </button>
        </div>
      </section>

      {/* Add subcategory */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Plus className="h-4 w-4 text-primary" />
          Add Subcategory
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={subCatId}
            onChange={(e) => setSubCatId(e.target.value === '' ? '' : Number(e.target.value))}
            className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Select main category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            placeholder="Subcategory name (e.g. Best Phones Under ₹10,000)"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubcategory(); } }}
          />
          <button
            type="button"
            onClick={handleAddSubcategory}
            disabled={!subName.trim() || subCatId === '' || addingSub}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            {addingSub ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Save
          </button>
        </div>
      </section>

      {/* Category list */}
      <section>
        <h2 className="mb-3 font-semibold text-foreground">Categories & Subcategories</h2>
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
            No categories yet. Add one above.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map((cat) => {
              const subs = subsByCategory(cat.id);
              const isExpanded = expanded[cat.id] !== false;
              return (
                <div key={cat.id} className="rounded-2xl border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => ({ ...prev, [cat.id]: !isExpanded }))}
                    className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition-colors hover:bg-muted/40"
                  >
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <Folder className="h-4 w-4 text-primary" />
                      {cat.name}
                      <span className="text-xs font-normal text-muted-foreground">({subs.length})</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border p-4">
                      {subs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No subcategories yet.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {subs.map((sub) => (
                            <li key={sub.id} className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted">
                              <div className="min-w-0">
                                <span className="font-medium text-foreground">{sub.name}</span>
                                <span className="ml-2 text-xs text-muted-foreground">/category/{categoriesById.get(cat.id)?.slug}/{sub.slug}</span>
                              </div>
                              <div className="flex flex-shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                  aria-label={`Delete ${sub.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}