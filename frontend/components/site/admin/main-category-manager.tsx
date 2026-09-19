'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Trash2, Pencil, X, Check, Eye, EyeOff, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import type { MainCategory } from '@/lib/sections';

function slugifyClient(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,''); }

export function MainCategoryManager({ initialCategories }: { initialCategories: MainCategory[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [flash, setFlash] = useState<{kind:'success'|'error',text:string}|null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState('');
  const [editingId, setEditingId] = useState<string|null>(null);
  const [form, setForm] = useState({ displayName: '', slug: '', description: '', displayOrder: 0, showInNavbar: true, isActive: true });
  const [editForm, setEditForm] = useState({ displayName: '', slug: '', description: '', displayOrder: 0, showInNavbar: true, isActive: true });

  function showFlash(kind:'success'|'error', text:string){ setFlash({kind,text}); setTimeout(()=>setFlash(null),4000); }

  async function handleCreate(e:React.FormEvent){
    e.preventDefault(); if(!form.displayName.trim()) return;
    setCreating(true);
    try{
      const res = await fetch('/api/admin/main-categories',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ displayName: form.displayName.trim(), slug: form.slug.trim() || undefined, description: form.description.trim()||undefined, displayOrder: form.displayOrder, showInNavbar: form.showInNavbar, isActive: form.isActive })});
      const data = await res.json();
      if(!res.ok || !data.ok){ showFlash('error', data.error||'Failed'); return; }
      setForm({ displayName: '', slug: '', description: '', displayOrder: 0, showInNavbar: true, isActive: true });
      showFlash('success', `Category "${data.category.displayName}" created.`);
      router.refresh();
      setCategories(prev=>[...prev, data.category].sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)));
    } catch{ showFlash('error','Something went wrong'); } finally{ setCreating(false); }
  }

  function startEdit(c: MainCategory){
    setEditingId(c.id);
    setEditForm({ displayName: c.displayName, slug: c.slug, description: c.description||'', displayOrder: c.displayOrder||0, showInNavbar: c.showInNavbar??true, isActive: c.isActive??true });
  }

  async function saveEdit(id:string){
    setBusy(`edit:${id}`);
    try{
      const res = await fetch(`/api/admin/main-categories/${id}`,{method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ displayName: editForm.displayName, slug: editForm.slug, description: editForm.description, displayOrder: editForm.displayOrder, showInNavbar: editForm.showInNavbar, isActive: editForm.isActive })});
      const data = await res.json().catch(()=>({}));
      if(!res.ok || !data.ok){ showFlash('error', data.error||'Update failed'); return; }
      showFlash('success','Category updated.'); setEditingId(null); router.refresh();
      setCategories(prev=> prev.map(p=> p.id===id? {...p, ...editForm }:p).sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)));
    } catch{ showFlash('error','Something went wrong'); } finally{ setBusy(''); }
  }

  async function handleDelete(id:string, name:string){
    if(!window.confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setBusy(`delete:${id}`);
    try{
      const res = await fetch(`/api/admin/main-categories/${id}`,{method:'DELETE'});
      const data = await res.json().catch(()=>({}));
      if(!res.ok || !data.ok){ showFlash('error', data.error||'Delete failed'); return; }
      showFlash('success','Deleted.'); router.refresh(); setCategories(prev=> prev.filter(p=>p.id!==id));
    } catch{ showFlash('error','Something went wrong'); } finally{ setBusy(''); }
  }

  async function moveUp(id:string){
    const idx = categories.findIndex(c=>c.id===id); if(idx<=0) return;
    const newOrder = [...categories]; [newOrder[idx], newOrder[idx-1]] = [newOrder[idx-1], newOrder[idx]];
    await doReorder(newOrder);
  }
  async function moveDown(id:string){
    const idx = categories.findIndex(c=>c.id===id); if(idx<0 || idx>=categories.length-1) return;
    const newOrder = [...categories]; [newOrder[idx], newOrder[idx+1]] = [newOrder[idx+1], newOrder[idx]];
    await doReorder(newOrder);
  }

  async function doReorder(newOrder: MainCategory[]){
    setBusy('reorder');
    try{
      const orderedIds = newOrder.map(c=>c.id);
      const res = await fetch('/api/admin/main-categories/reorder',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ orderedIds })});
      const data = await res.json().catch(()=>({}));
      if(!res.ok || !data.ok){ showFlash('error', data.error||'Reorder failed'); return; }
      showFlash('success','Order saved.'); router.refresh(); setCategories(newOrder);
    } catch{ showFlash('error','Failed'); } finally{ setBusy(''); }
  }

  return (
    <div className="flex flex-col gap-8">
      {flash && <p className={`rounded-xl border px-4 py-3 text-sm ${flash.kind==='success'?'border-primary/30 bg-primary/5':'border-destructive/30 bg-destructive/5 text-destructive'}`}>{flash.text}</p>}
      <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Plus className="h-4 w-4 text-primary"/> New navigation category</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Display Name *</span><input value={form.displayName} onChange={e=>{setForm({...form,displayName:e.target.value}); if(!form.slug) setForm({...form,slug:slugifyClient(e.target.value)})}} placeholder="AI News" className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/></label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Slug *</span><input value={form.slug} onChange={e=>setForm({...form,slug:slugifyClient(e.target.value)})} placeholder="ai-news" className="rounded-xl border border-input bg-background px-3 py-2.5 font-mono outline-none focus:border-primary"/></label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Display Order</span><input type="number" value={form.displayOrder} onChange={e=>setForm({...form,displayOrder:Number(e.target.value)||0})} min={0} className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.showInNavbar} onChange={e=>setForm({...form,showInNavbar:e.target.checked})} className="h-4 w-4"/> Show in navbar</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} className="h-4 w-4"/> Active</label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-4"><span className="font-medium">Description</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} placeholder="Category description..." className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/></label>
          <div className="flex items-end"><button type="submit" disabled={creating || !form.displayName.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{creating? <Loader2 className="h-4 w-4 animate-spin"/>: <Plus className="h-4 w-4"/>} Add category</button></div>
        </div>
      </form>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><GripVertical className="h-4 w-4 text-primary"/> Categories ({categories.length})</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {categories.map((c, idx) => (
            <li key={c.id} className={`rounded-xl border border-border px-3 py-2.5 ${!c.isActive || !c.showInNavbar ? 'opacity-60' : ''}`}>
              {editingId===c.id? (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input value={editForm.displayName} onChange={e=>setEditForm({...editForm,displayName:e.target.value})} className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Display Name"/>
                    <input value={editForm.slug} onChange={e=>setEditForm({...editForm,slug:slugifyClient(e.target.value)})} className="rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary" placeholder="slug"/>
                    <input type="number" value={editForm.displayOrder} onChange={e=>setEditForm({...editForm,displayOrder:Number(e.target.value)||0})} className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Order"/>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="flex items-center gap-1.5"><input type="checkbox" checked={editForm.showInNavbar} onChange={e=>setEditForm({...editForm,showInNavbar:e.target.checked})} className="h-4 w-4"/> Show in navbar</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" checked={editForm.isActive} onChange={e=>setEditForm({...editForm,isActive:e.target.checked})} className="h-4 w-4"/> Active</label>
                  </div>
                  <div className="flex gap-1.5 self-end">
                    <button type="button" onClick={()=>saveEdit(c.id)} disabled={busy===`edit:${c.id}`} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{busy===`edit:${c.id}`? <Loader2 className="h-4 w-4 animate-spin"/>: <Check className="h-4 w-4"/>}</button>
                    <button type="button" onClick={()=>setEditingId(null)} className="rounded-lg border border-border px-3 py-2 text-sm"><X className="h-4 w-4"/></button>
                  </div>
                </div>
              ):(
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <button onClick={()=>moveUp(c.id)} className="rounded-lg p-1.5 hover:bg-muted"><ArrowUp className="h-4 w-4"/></button>
                    <button onClick={()=>moveDown(c.id)} className="rounded-lg p-1.5 hover:bg-muted"><ArrowDown className="h-4 w-4"/></button>
                    <span className="text-xs tabular-nums">{idx+1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.displayName} {!c.isActive && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Inactive</span>} {!c.showInNavbar && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Hidden</span>}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">/{c.slug} {c.description && <>· {c.description}</>}</p>
                  </div>
                  <button type="button" onClick={()=>startEdit(c)} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4"/></button>
                  <button type="button" onClick={()=>handleDelete(c.id,c.displayName)} disabled={busy===`delete:${c.id}`} className="rounded-lg border border-destructive/30 p-2 text-destructive hover:bg-destructive/10 disabled:opacity-50">{busy===`delete:${c.id}`? <Loader2 className="h-4 w-4 animate-spin"/>: <Trash2 className="h-4 w-4"/>}</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}