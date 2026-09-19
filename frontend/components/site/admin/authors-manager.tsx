'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Loader2, Trash2, Pencil, X, Check, Eye, EyeOff, Upload, Link2 } from 'lucide-react';
import type { AuthorFull } from '@/lib/authors';

function slugifyClient(s: string){ return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,''); }

export function AuthorsManager({ initialAuthors }: { initialAuthors: AuthorFull[] }) {
  const router = useRouter();
  const [authors, setAuthors] = useState(initialAuthors);
  const [flash, setFlash] = useState<{kind:'success'|'error',text:string}|null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState('');
  const [editingId, setEditingId] = useState<number|null>(null);
  const [form, setForm] = useState({ name:'', bio:'', role:'', avatarUrl:'', websiteUrl:'', isActive:true });
  const [editForm, setEditForm] = useState({ name:'', bio:'', role:'', avatarUrl:'', websiteUrl:'', isActive:true });
  const [uploading, setUploading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);

  function showFlash(kind:'success'|'error', text:string){ setFlash({kind,text}); setTimeout(()=>setFlash(null),4000); }

  async function handleUpload(file: File, isEdit=false){
    if (isEdit) setEditUploading(true); else setUploading(true);
    try{
      const fd = new FormData(); fd.append('file', file); fd.append('title','author-avatar');
      const res = await fetch('/api/admin/upload',{method:'POST', body: fd});
      const data = await res.json();
      if (!res.ok || !data.ok) { showFlash('error', data.error||'Upload failed'); return; }
      if (isEdit) setEditForm(prev=>({ ...prev, avatarUrl: data.url }));
      else setForm(prev=>({ ...prev, avatarUrl: data.url }));
    } catch { showFlash('error','Upload failed'); } finally { isEdit? setEditUploading(false): setUploading(false); }
  }

  async function handleCreate(e:React.FormEvent){
    e.preventDefault(); if(!form.name.trim()) return;
    setCreating(true);
    try{
      const res = await fetch('/api/admin/authors',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: form.name.trim(), bio: form.bio.trim()||undefined, role: form.role.trim()||undefined, avatarUrl: form.avatarUrl.trim()||undefined, websiteUrl: form.websiteUrl.trim()||undefined, isActive: form.isActive })});
      const data = await res.json();
      if(!res.ok || !data.ok){ showFlash('error', data.error||'Failed'); return; }
      setForm({ name:'', bio:'', role:'', avatarUrl:'', websiteUrl:'', isActive:true });
      showFlash('success', `Author "${data.author.name}" created.`);
      router.refresh();
      setAuthors(prev=>[data.author, ...prev]);
    } catch{ showFlash('error','Something went wrong'); } finally{ setCreating(false); }
  }

  function startEdit(a: AuthorFull){
    setEditingId(a.id);
    setEditForm({ name: a.name, bio: a.bio||'', role: a.role||'', avatarUrl: a.avatarUrl||a.avatar||'', websiteUrl: a.websiteUrl||'', isActive: a.isActive });
  }

  async function saveEdit(id:number){
    setBusy(`edit:${id}`);
    try{
      const res = await fetch(`/api/admin/authors/${id}`,{method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: editForm.name, bio: editForm.bio, role: editForm.role, avatarUrl: editForm.avatarUrl, websiteUrl: editForm.websiteUrl, isActive: editForm.isActive })});
      const data = await res.json().catch(()=>({}));
      if(!res.ok || !data.ok){ showFlash('error', data.error||'Update failed'); return; }
      showFlash('success','Author updated.'); setEditingId(null); router.refresh();
      setAuthors(prev=> prev.map(p=> p.id===id? {...p, name: editForm.name, bio: editForm.bio, role: editForm.role, avatarUrl: editForm.avatarUrl, websiteUrl: editForm.websiteUrl, isActive: editForm.isActive }:p));
    } catch{ showFlash('error','Something went wrong'); } finally{ setBusy(''); }
  }

  async function handleDelete(id:number, name:string){
    if(!window.confirm(`Delete author "${name}"? Articles will keep but author removed.`)) return;
    setBusy(`delete:${id}`);
    try{
      const res = await fetch(`/api/admin/authors/${id}`,{method:'DELETE'});
      const data = await res.json().catch(()=>({}));
      if(!res.ok || !data.ok){ showFlash('error', data.error||'Delete failed'); return; }
      showFlash('success','Deleted.'); router.refresh(); setAuthors(prev=> prev.filter(p=>p.id!==id));
    } catch{ showFlash('error','Something went wrong'); } finally{ setBusy(''); }
  }

  async function toggleActive(a: AuthorFull){
    setBusy(`vis:${a.id}`);
    try{
      const res = await fetch(`/api/admin/authors/${a.id}`,{method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ isActive: !a.isActive })});
      const data = await res.json().catch(()=>({}));
      if(!res.ok || !data.ok){ showFlash('error', data.error||'Failed'); return; }
      router.refresh();
      setAuthors(prev=> prev.map(p=> p.id===a.id? {...p, isActive: !p.isActive}:p));
    } catch{ showFlash('error','Failed'); } finally{ setBusy(''); }
  }

  return (
    <div className="flex flex-col gap-8">
      {flash && <p className={`rounded-xl border px-4 py-3 text-sm ${flash.kind==='success'?'border-primary/30 bg-primary/5':'border-destructive/30 bg-destructive/5 text-destructive'}`}>{flash.text}</p>}
      <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Plus className="h-4 w-4 text-primary"/> New author</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Name *</span><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Jane Doe" className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/></label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Role / Job title</span><input value={form.role} onChange={e=>setForm({...form,role:e.target.value})} placeholder="Senior Editor" className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/></label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2"><span className="font-medium">Biography</span><textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={3} placeholder="Short bio..." className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/></label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Avatar URL</span>
            <div className="flex gap-2">
              <input value={form.avatarUrl} onChange={e=>setForm({...form,avatarUrl:e.target.value})} placeholder="https://..." className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/>
              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-border px-3 text-sm hover:bg-muted">
                {uploading? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}
                <input type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) handleUpload(f,false); }}/>
              </label>
            </div>
            {form.avatarUrl && <div className="mt-2 h-16 w-16 overflow-hidden rounded-full border border-border"><Image src={form.avatarUrl} alt="preview" width={64} height={64} className="h-full w-full object-cover"/></div>}
          </label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Website / Social URL</span><input value={form.websiteUrl} onChange={e=>setForm({...form,websiteUrl:e.target.value})} placeholder="https://twitter.com/..." className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} className="h-4 w-4"/> Active (visible on site)</label>
          <div className="flex items-end"><button type="submit" disabled={creating || !form.name.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{creating? <Loader2 className="h-4 w-4 animate-spin"/>: <Plus className="h-4 w-4"/>} Add author</button></div>
        </div>
      </form>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold">{authors.length} {authors.length===1?'author':'authors'}</h2>
        {authors.length===0? <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">No authors yet.</p> : <ul className="mt-3 flex flex-col gap-2">
          {authors.map(a=>(
            <li key={a.id} className={`rounded-xl border border-border px-3 py-2.5 ${!a.isActive?'opacity-60':''}`}>
              {editingId===a.id? (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Name"/>
                    <input value={editForm.role} onChange={e=>setEditForm({...editForm,role:e.target.value})} className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Role"/>
                    <textarea value={editForm.bio} onChange={e=>setEditForm({...editForm,bio:e.target.value})} rows={2} className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:col-span-2" placeholder="Bio"/>
                    <div className="flex gap-2">
                      <input value={editForm.avatarUrl} onChange={e=>setEditForm({...editForm,avatarUrl:e.target.value})} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Avatar URL"/>
                      <label className="flex cursor-pointer items-center rounded-lg border border-border px-3 hover:bg-muted">{editUploading? <Loader2 className="h-4 w-4 animate-spin"/>: <Upload className="h-4 w-4"/>}<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) handleUpload(f,true);}}/></label>
                    </div>
                    <input value={editForm.websiteUrl} onChange={e=>setEditForm({...editForm,websiteUrl:e.target.value})} className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Website URL"/>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editForm.isActive} onChange={e=>setEditForm({...editForm,isActive:e.target.checked})} className="h-4 w-4"/> Active</label>
                  </div>
                  <div className="flex gap-1.5 self-end">
                    <button type="button" onClick={()=>saveEdit(a.id)} disabled={busy===`edit:${a.id}`} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{busy===`edit:${a.id}`? <Loader2 className="h-4 w-4 animate-spin"/>: <Check className="h-4 w-4"/>}</button>
                    <button type="button" onClick={()=>setEditingId(null)} className="rounded-lg border border-border px-3 py-2 text-sm"><X className="h-4 w-4"/></button>
                  </div>
                </div>
              ):(
                <div className="flex flex-wrap items-center gap-3">
                  {a.avatarUrl||a.avatar? <Image src={a.avatarUrl||a.avatar!} alt={a.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-1 ring-border"/> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">{a.name.slice(0,2).toUpperCase()}</div>}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{a.name} {a.role && <span className="font-normal text-muted-foreground">· {a.role}</span>} {!a.isActive && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Hidden</span>}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">/{a.slug} {a.websiteUrl && <>· <a href={a.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{a.websiteUrl}</a></>}</p>
                    {a.bio && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.bio}</p>}
                  </div>
                  <button type="button" onClick={()=>toggleActive(a)} disabled={busy===`vis:${a.id}`} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50" title={a.isActive?'Hide':'Show'}>{busy===`vis:${a.id}`? <Loader2 className="h-4 w-4 animate-spin"/> : a.isActive? <Eye className="h-4 w-4"/>: <EyeOff className="h-4 w-4"/>}</button>
                  <button type="button" onClick={()=>startEdit(a)} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4"/></button>
                  <button type="button" onClick={()=>handleDelete(a.id,a.name)} disabled={busy===`delete:${a.id}`} className="rounded-lg border border-destructive/30 p-2 text-destructive hover:bg-destructive/10 disabled:opacity-50">{busy===`delete:${a.id}`? <Loader2 className="h-4 w-4 animate-spin"/>: <Trash2 className="h-4 w-4"/>}</button>
                </div>
              )}
            </li>
          ))}
        </ul>}
      </section>
    </div>
  );
}
