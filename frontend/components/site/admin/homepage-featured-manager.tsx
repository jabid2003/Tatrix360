'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
  Trash2, Eye, EyeOff, ChevronDown, ChevronUp,
  Search, Check, Plus, Pencil, X, Save, GripVertical,
  LayoutGrid,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { HomepageFeatured } from '@/lib/sections';

// Lazy-loaded icon picker (P1): the 200+ icon catalogue lives in a separate
// chunk (icon-picker-modal.tsx) so this page paints fast. Loaded on demand
// when the picker opens.
const IconPickerModal = dynamic(
  () => import('./icon-picker-modal').then((m) => m.IconPickerModal),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="rounded-2xl bg-card px-6 py-8 text-sm text-muted-foreground">Loading icons…</div>
      </div>
    ),
  }
);

interface ArticleLike {
  id: string;
  title: string;
  slug: string;
  mainCategory?: { slug: string; displayName: string } | null;
  section?: { title: string } | null;
}

interface Props {
  initialFeatured: HomepageFeatured[];
  articleDetails: Record<string, any>;
  allArticles: ArticleLike[];
}

const MAX_PER_HEADING = 10;

export function HomepageFeaturedManager({ initialFeatured, articleDetails, allArticles }: Props) {
  const [featured, setFeatured] = useState<HomepageFeatured[]>(initialFeatured);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [expandedHeadings, setExpandedHeadings] = useState<Set<string>>(new Set());
  const [emptyHeadings, setEmptyHeadings] = useState<Set<string>>(new Set());

  const [newHeadingName, setNewHeadingName] = useState('');
  const [editingHeadingId, setEditingHeadingId] = useState<string | null>(null);
  const [editingHeadingValue, setEditingHeadingValue] = useState('');
  const [addingToHeading, setAddingToHeading] = useState<string | null>(null);
  const [addCategoryFilter, setAddCategoryFilter] = useState('');
  const [addSearch, setAddSearch] = useState('');
  const [addSelectedIds, setAddSelectedIds] = useState<Set<string>>(new Set());
  const [pickingIconFor, setPickingIconFor] = useState<string | null>(null);

  // Full icon map for header display, background-loaded (P1) so the initial
  // paint only pays for the ~13 UI icons imported above.
  const [iconMap, setIconMap] = useState<Record<string, LucideIcon> | null>(null);
  useEffect(() => {
    let live = true;
    import('./icon-picker-modal')
      .then((m) => { if (live) setIconMap(m.ICON_MAP); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  const grouped = featured.reduce<Record<string, HomepageFeatured[]>>((acc, item) => {
    (acc[item.categorySlug] ??= []).push(item);
    return acc;
  }, {});
  const headings = [...new Set([...Object.keys(grouped), ...emptyHeadings])];

  const headingIcons = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const item of featured) {
      if (item.headingIcon && !map[item.categorySlug]) {
        map[item.categorySlug] = item.headingIcon;
      }
    }
    return map;
  }, [featured]);

  const articleCategorySlugs = [...new Set(allArticles.map((a) => a.mainCategory?.slug).filter(Boolean))];

  const flash = (type: 'ok' | 'err', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateHeading = useCallback(async () => {
    const name = newHeadingName.trim();
    if (!name) return flash('err', 'Enter a heading name.');
    if (grouped[name] || emptyHeadings.has(name)) return flash('err', 'Heading already exists.');
    setEmptyHeadings((prev) => new Set([...prev, name]));
    setNewHeadingName('');
    setExpandedHeadings((prev) => new Set([...prev, name]));
    flash('ok', `Heading "${name}" created. Now add articles to it.`);
  }, [newHeadingName, grouped, emptyHeadings, flash]);

  const startEditHeading = (oldName: string) => {
    setEditingHeadingId(oldName);
    setEditingHeadingValue(oldName);
  };

  const saveHeadingName = useCallback(async (oldName: string) => {
    const newName = editingHeadingValue.trim();
    if (!newName) return flash('err', 'Name cannot be empty.');
    if (newName !== oldName && (grouped[newName] || emptyHeadings.has(newName))) return flash('err', 'Heading already exists.');
    if (emptyHeadings.has(oldName)) {
      setEmptyHeadings((prev) => { const n = new Set(prev); n.delete(oldName); n.add(newName); return n; });
      setEditingHeadingId(null);
      flash('ok', `Renamed to "${newName}".`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage-featured', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rename', oldCategorySlug: oldName, newCategorySlug: newName }),
      });
      const data = await res.json();
      if (!data.ok) return flash('err', data.error ?? 'Failed.');
      setFeatured((prev) => prev.map((f) => f.categorySlug === oldName ? { ...f, categorySlug: newName } : f));
      setEditingHeadingId(null);
      flash('ok', `Renamed to "${newName}".`);
    } catch {
      flash('err', 'Network error.');
    } finally {
      setLoading(false);
    }
  }, [editingHeadingValue, grouped, emptyHeadings, flash]);

  const handleDeleteHeading = useCallback(async (headingName: string) => {
    setLoading(true);
    let removed = 0;
    const itemsToRemove = grouped[headingName] ?? [];
    for (const item of itemsToRemove) {
      try {
        const res = await fetch('/api/admin/homepage-featured', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, action: 'remove' }),
        });
        const data = await res.json();
        if (data.ok) removed++;
      } catch {}
    }
    setFeatured((prev) => prev.filter((f) => f.categorySlug !== headingName));
    setEmptyHeadings((prev) => { const n = new Set(prev); n.delete(headingName); return n; });
    setLoading(false);
    setExpandedHeadings((prev) => { const n = new Set(prev); n.delete(headingName); return n; });
    flash('ok', `Deleted "${headingName}" and ${removed} articles.`);
  }, [grouped, flash]);

  const handleRemoveArticle = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage-featured', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'remove' }),
      });
      const data = await res.json();
      if (!data.ok) return flash('err', data.error ?? 'Failed.');
      setFeatured((prev) => prev.filter((f) => f.id !== id));
      flash('ok', 'Removed.');
    } catch {
      flash('err', 'Network error.');
    } finally {
      setLoading(false);
    }
  }, [flash]);

  const handleToggleVisibility = useCallback(async (id: string, current: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage-featured', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle', isVisible: !current }),
      });
      const data = await res.json();
      if (!data.ok) return flash('err', data.error ?? 'Failed.');
      setFeatured((prev) => prev.map((f) => f.id === id ? { ...f, isVisible: !current } : f));
    } catch {
      flash('err', 'Network error.');
    } finally {
      setLoading(false);
    }
  }, [flash]);

  const handleIconPick = useCallback(async (headingName: string, iconName: string | null) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage-featured', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateIcon', categorySlug: headingName, icon: iconName }),
      });
      const data = await res.json();
      if (!data.ok) return flash('err', data.error ?? 'Failed.');
      setFeatured((prev) => prev.map((f) => f.categorySlug === headingName ? { ...f, headingIcon: iconName } : f));
      setPickingIconFor(null);
      flash('ok', iconName ? `Icon set to "${iconName}".` : 'Icon removed.');
    } catch {
      flash('err', 'Network error.');
    } finally {
      setLoading(false);
    }
  }, [flash]);

  const openAddTo = (headingName: string) => {
    setAddingToHeading(headingName);
    setAddSelectedIds(new Set());
    setAddSearch('');
    setAddCategoryFilter('');
    setExpandedHeadings((prev) => new Set([...prev, headingName]));
  };

  const toggleAddArticle = (id: string) => {
    setAddSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getAddArticles = () => {
    return allArticles.filter((a) => {
      if (addCategoryFilter && a.mainCategory?.slug !== addCategoryFilter) return false;
      if (!addSearch.trim()) return true;
      const q = addSearch.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q);
    });
  };

  const handleBulkAddToHeading = useCallback(async () => {
    if (!addingToHeading || addSelectedIds.size === 0) return;
    const currentCount = grouped[addingToHeading]?.length ?? 0;
    if (currentCount + addSelectedIds.size > MAX_PER_HEADING) {
      return flash('err', `Max ${MAX_PER_HEADING} per heading. Only ${MAX_PER_HEADING - currentCount} slots left.`);
    }
    setLoading(true);
    let added = 0;
    for (const articleId of addSelectedIds) {
      try {
        const res = await fetch('/api/admin/homepage-featured', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categorySlug: addingToHeading, articleId }),
        });
        const data = await res.json();
        if (data.ok) {
          setFeatured((prev) => [...prev, {
            id: `temp-${Date.now()}-${articleId}`,
            categorySlug: addingToHeading,
            articleId,
            sortOrder: prev.filter((f) => f.categorySlug === addingToHeading).length,
            isVisible: true,
          }]);
          added++;
        }
      } catch {}
    }
    setAddSelectedIds(new Set());
    setAddSearch('');
    setAddCategoryFilter('');
    setLoading(false);
    if (added > 0) {
      setEmptyHeadings((prev) => { const n = new Set(prev); n.delete(addingToHeading!); return n; });
      setExpandedHeadings((prev) => new Set([...prev, addingToHeading!]));
      flash('ok', `Added ${added} article${added > 1 ? 's' : ''} to "${addingToHeading}".`);
    }
    setAddingToHeading(null);
  }, [addingToHeading, addSelectedIds, grouped, flash]);

  const toggleHeading = (name: string) => {
    setExpandedHeadings((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          message.type === 'ok'
            ? 'bg-green/10 text-green-700 border border-green/20'
            : 'bg-red-500/10 text-red-600 border border-red-500/20'
        }`}>
          {message.text}
        </div>
      )}

      {/* Create new heading */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Create New Section
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newHeadingName}
            onChange={(e) => setNewHeadingName(e.target.value)}
            placeholder="e.g. Handpicked, Top AI News, Editor's Choice..."
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateHeading()}
          />
          <button
            onClick={handleCreateHeading}
            disabled={!newHeadingName.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>
      </div>

      {/* Icon picker modal (lazy-loaded chunk) */}
      {pickingIconFor && (
        <IconPickerModal
          headingName={pickingIconFor}
          currentIcon={headingIcons[pickingIconFor] ?? null}
          saving={loading}
          onPick={(name) => handleIconPick(pickingIconFor, name)}
          onClose={() => setPickingIconFor(null)}
        />
      )}

      {/* Existing headings */}
      {headings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <p className="text-muted-foreground">No sections yet. Create a heading above, then add articles.</p>
        </div>
      ) : (
        headings.map((headingName) => {
          const items = grouped[headingName] ?? [];
          const isExpanded = expandedHeadings.has(headingName);
          const isEditing = editingHeadingId === headingName;
          const isAdding = addingToHeading === headingName;
          const addArticles = isAdding ? getAddArticles() : [];
          const count = items.length;
          const currentIcon = headingIcons[headingName];
          const IconComp = currentIcon ? (iconMap?.[currentIcon] ?? null) : null;

          return (
            <div key={headingName} className="rounded-2xl border border-border bg-card">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground/30" />
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editingHeadingValue}
                        onChange={(e) => setEditingHeadingValue(e.target.value)}
                        className="rounded-lg border border-input bg-background px-2 py-1 text-lg font-bold font-serif outline-none focus:border-primary"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveHeadingName(headingName)}
                      />
                      <button onClick={() => saveHeadingName(headingName)} className="rounded-lg bg-primary p-1.5 text-primary-foreground"><Save className="h-4 w-4" /></button>
                      <button onClick={() => setEditingHeadingId(null)} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => toggleHeading(headingName)} className="flex items-center gap-2 text-left min-w-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPickingIconFor(headingName); }}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                        title="Pick icon"
                      >
                        {IconComp ? <IconComp className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                      </button>
                      <h3 className="font-serif text-lg font-bold truncate">{headingName}</h3>
                      <span className="flex-shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {count}/{MAX_PER_HEADING}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
                    </button>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-2 flex-shrink-0 overflow-x-auto scrollbar-hide">
                    <button onClick={() => setPickingIconFor(headingName)} className="flex-shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted" title="Change icon">
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => startEditHeading(headingName)} className="flex-shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted" title="Rename">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {count < MAX_PER_HEADING && (
                      <button
                        onClick={() => isAdding ? setAddingToHeading(null) : openAddTo(headingName)}
                        className={`flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isAdding ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {isAdding ? 'Cancel' : 'Add articles'}
                      </button>
                    )}
                    <button onClick={() => handleDeleteHeading(headingName)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10" title="Delete heading">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Articles list + inline picker */}
              {isExpanded && (
                <div className="border-t border-border">
                  {items.length > 0 && (
                    <div className="divide-y divide-border">
                      {items.map((item) => {
                        const detail = articleDetails[item.articleId];
                        return (
                          <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                            {detail?.thumbnail_url && (
                              <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted p-0.5">
                                <Image src={detail.thumbnail_url} alt="" className="h-full w-auto object-contain" width={56} height={40} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{detail?.title ?? item.articleId}</p>
                              <p className="text-xs text-muted-foreground">
                                {detail?.main_categories?.display_name ?? detail?.main_categories?.slug ?? ''}
                                {detail?.category_sections?.title ? ` / ${detail.category_sections.title}` : ''}
                              </p>
                            </div>
                            <button onClick={() => handleToggleVisibility(item.id, item.isVisible)} disabled={loading}
                              className="flex-shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                              title={item.isVisible ? 'Hide' : 'Show'}>
                              {item.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground/40" />}
                            </button>
                            <button onClick={() => handleRemoveArticle(item.id)} disabled={loading}
                              className="flex-shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
                              title="Remove">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isAdding && (
                    <div className="px-5 py-4 bg-muted/30">
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">
                          Pick articles ({addSelectedIds.size} selected, {MAX_PER_HEADING - count} slots left)
                        </label>
                        {addSelectedIds.size > 0 && (
                          <button onClick={handleBulkAddToHeading} disabled={loading}
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50">
                            <Plus className="h-3.5 w-3.5" />
                            Add {addSelectedIds.size}
                          </button>
                        )}
                      </div>

                      <div className="mb-3 flex flex-wrap gap-2">
                        <button onClick={() => setAddCategoryFilter('')}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${!addCategoryFilter ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
                          All
                        </button>
                        {articleCategorySlugs.map((slug) => (
                          <button key={slug} onClick={() => setAddCategoryFilter(addCategoryFilter === slug ? '' : slug ?? '')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${addCategoryFilter === slug ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
                            {slug}
                          </button>
                        ))}
                      </div>

                      <div className="mb-2 flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input type="text" value={addSearch} onChange={(e) => setAddSearch(e.target.value)} placeholder="Search articles..." className="flex-1 bg-transparent text-sm outline-none" />
                        {addSearch && <button onClick={() => setAddSearch('')} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>}
                      </div>

                      <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-border bg-background p-2">
                        {addArticles.length === 0 ? (
                          <p className="py-3 text-center text-sm text-muted-foreground">No articles found.</p>
                        ) : (
                          addArticles.map((article) => {
                            const isChecked = addSelectedIds.has(article.id);
                            return (
                              <button key={article.id} onClick={() => toggleAddArticle(article.id)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${isChecked ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted border border-transparent'}`}>
                                <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${isChecked ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                                  {isChecked && <Check className="h-3 w-3 text-primary-foreground" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">{article.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {article.mainCategory?.displayName ?? article.mainCategory?.slug ?? ''}
                                    {article.section ? ` / ${article.section.title}` : ''}
                                  </p>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
