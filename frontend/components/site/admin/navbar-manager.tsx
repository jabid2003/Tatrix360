'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  CheckCircle2,
  XCircle,
  Link2,
  LayoutGrid as MegaIcon,
  GripVertical,
} from 'lucide-react';

interface NavLinkRow {
  id: string;
  label: string;
  slug: string;
  parent_id: string | null;
  is_mega_menu: boolean;
  icon_name: string | null;
  description: string | null;
  order_index: number;
}

interface NavbarManagerProps {
  links: NavLinkRow[];
}

interface FormState {
  label: string;
  slug: string;
  parent_id: string;
  is_mega_menu: boolean;
  icon_name: string;
  description: string;
  order_index: number;
}

const EMPTY: FormState = {
  label: '',
  slug: '/',
  parent_id: '',
  is_mega_menu: true,
  icon_name: '',
  description: '',
  order_index: 0,
};

export function NavbarManager({ links: initial }: NavbarManagerProps) {
  const [links, setLinks] = useState<NavLinkRow[]>(initial);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const roots = links.filter((l) => !l.parent_id).sort((a, b) => a.order_index - b.order_index);
  const childrenOf = (id: string) =>
    links.filter((l) => l.parent_id === id).sort((a, b) => a.order_index - b.order_index);

  function flash(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
  }

  async function handleSave() {
    if (!form.label.trim() || !form.slug.trim()) {
      flash('error', 'Label and slug are required.');
      return;
    }
    setBusy(true);
    try {
      const url = editingId ? `/api/admin/navbar/${editingId}` : '/api/admin/navbar';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: form.label.trim(),
          slug: form.slug.trim(),
          parent_id: form.parent_id || null,
          is_mega_menu: form.is_mega_menu,
          icon_name: form.icon_name.trim() || null,
          description: form.description.trim() || null,
          order_index: Number(form.order_index) || 0,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        flash('success', editingId ? 'Updated navbar link.' : 'Added navbar link.');
        const refresh = await fetch('/api/admin/navbar');
        const refreshed = await refresh.json();
        if (refreshed.ok) setLinks(refreshed.links);
        resetForm();
      } else {
        flash('error', data.error || 'Save failed.');
      }
    } catch {
      flash('error', 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(l: NavLinkRow) {
    setEditingId(l.id);
    setForm({
      label: l.label,
      slug: l.slug,
      parent_id: l.parent_id ?? '',
      is_mega_menu: l.is_mega_menu,
      icon_name: l.icon_name ?? '',
      description: l.description ?? '',
      order_index: l.order_index,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete navbar link "${label}" (and its children)? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/navbar/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        const deleted = new Set<string>([id]);
        links.forEach((l) => {
          if (l.parent_id === id) deleted.add(l.id);
        });
        setLinks((prev) => prev.filter((l) => !deleted.has(l.id)));
        if (editingId === id) resetForm();
        flash('success', `Deleted "${label}".`);
      } else {
        flash('error', data.error || 'Delete failed.');
      }
    } catch {
      flash('error', 'Delete failed.');
    }
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-primary/30 bg-primary/5 text-primary' : 'border-destructive/30 bg-destructive/5 text-destructive'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Editor */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <Link2 className="h-4 w-4 text-primary" />
          {editingId ? 'Edit Navbar Link' : 'Add Navbar Link'}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Label
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. AI News"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Slug / URL
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="e.g. /category/ai-news"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Parent (leave empty for top-level)
            <select
              value={form.parent_id}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">— Top level —</option>
              {roots.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Lucide icon name
            <input
              type="text"
              value={form.icon_name}
              onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
              placeholder="e.g. BrainCircuit"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Description (mega menu subtext)
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Models, tools & research"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Order index
            <input
              type="number"
              value={form.order_index}
              onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.is_mega_menu}
              onChange={(e) => setForm({ ...form, is_mega_menu: e.target.checked })}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <MegaIcon className="h-4 w-4 text-primary" />
            Show as Mega Menu
          </label>
          <div className="ml-auto flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Save changes' : 'Add link'}
            </button>
          </div>
        </div>
      </section>

      {/* Tree */}
      <section>
        <h2 className="mb-3 font-semibold text-foreground">Current Navbar Structure</h2>
        {roots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
            No navbar links yet. Add one above.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {roots.map((root) => (
              <div key={root.id} className="rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 px-4 py-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                    {root.is_mega_menu ? 'M' : 'L'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{root.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{root.slug}</p>
                  </div>
                  <button type="button" onClick={() => startEdit(root)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Edit ${root.label}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(root.id, root.label)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${root.label}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {childrenOf(root.id).length > 0 && (
                  <ul className="border-t border-border p-2">
                    {childrenOf(root.id).map((child) => (
                      <li key={child.id} className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                        <span className="ml-3 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">{child.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{child.slug}</p>
                        </div>
                        <button type="button" onClick={() => startEdit(child)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Edit ${child.label}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDelete(child.id, child.label)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${child.label}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
