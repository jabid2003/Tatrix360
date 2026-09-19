'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Upload, X, Check } from 'lucide-react';
import type { SiteSettings } from '@/lib/site-settings';

export function SiteSettingsForm({ initialSettings }: { initialSettings: SiteSettings | null }) {
  const router = useRouter();
  const [flash, setFlash] = useState<{kind:'success'|'error',text:string}|null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    siteName: initialSettings?.siteName ?? 'Tatrix360',
    logoUrl: initialSettings?.logoUrl ?? '',
    description: initialSettings?.description ?? '',
    copyrightText: initialSettings?.copyrightText ?? '',
    socialTwitter: initialSettings?.socialTwitter ?? '',
    socialGithub: initialSettings?.socialGithub ?? '',
    socialYoutube: initialSettings?.socialYoutube ?? '',
    socialInstagram: initialSettings?.socialInstagram ?? '',
    showNewsletter: initialSettings?.showNewsletter ?? true,
    showUserReviews: initialSettings?.showUserReviews ?? false,
  });

  function showFlash(kind:'success'|'error', text:string){ setFlash({kind,text}); setTimeout(()=>setFlash(null),4000); }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0]; if(!file) return;
    setUploading(true);
    try{
      const fd = new FormData(); fd.append('file', file); fd.append('title', 'site-logo');
      const res = await fetch('/api/admin/upload',{method:'POST', body: fd});
      const data = await res.json();
      if(!res.ok || !data.ok){ showFlash('error', data.error||'Upload failed'); return; }
      setForm(prev=>({...prev, logoUrl: data.url}));
    } catch { showFlash('error','Upload failed'); }
    finally { setUploading(false); }
  }

  async function handleSave(e: React.FormEvent){
    e.preventDefault(); setSaving(true);
    try{
      const res = await fetch('/api/admin/site-settings',{method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)});
      const data = await res.json();
      if(!res.ok || !data.ok){ showFlash('error', data.error||'Save failed'); return; }
      showFlash('success','Settings saved.'); router.refresh();
    } catch { showFlash('error','Something went wrong'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {flash && <p className={`rounded-xl border px-4 py-3 text-sm ${flash.kind==='success'?'border-primary/30 bg-primary/5':'border-destructive/30 bg-destructive/5 text-destructive'}`}>{flash.text}</p>}

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold">Brand</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Site Name</span>
            <input value={form.siteName} onChange={e=>setForm({...form,siteName:e.target.value})} className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/>
          </label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Logo URL</span>
            <div className="flex gap-2">
              <input value={form.logoUrl} onChange={e=>setForm({...form,logoUrl:e.target.value})} placeholder="https://..." className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/>
              <label className="flex cursor-pointer items-center rounded-xl border border-border px-3 hover:bg-muted">
                {uploading? <Loader2 className="h-4 w-4 animate-spin"/>: <Upload className="h-4 w-4"/>}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload}/>
              </label>
            </div>
            {form.logoUrl && <div className="mt-2 h-16 w-auto max-w-xs overflow-hidden rounded-lg border border-border"><Image src={form.logoUrl} alt="logo preview" width={120} height={40} className="h-full w-full object-contain"/></div>}
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2"><span className="font-medium">Description</span>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/></label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2"><span className="font-medium">Copyright Text</span>
            <input value={form.copyrightText} onChange={e=>setForm({...form,copyrightText:e.target.value})} placeholder="© 2026 Tatrix360. Tech, decoded." className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold">Social Links</h2>
        <p className="mt-1 text-xs text-muted-foreground">Leave empty to hide the icon in the footer.</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {key:'socialTwitter', label:'Twitter/X', icon:'𝕏'},
            {key:'socialGithub', label:'GitHub', icon:'⌘'},
            {key:'socialYoutube', label:'YouTube', icon:'▶'},
            {key:'socialInstagram', label:'Instagram', icon:'📷'},
          ].map(s=> (
            <label key={s.key} className="flex flex-col gap-1 text-sm"><span className="font-medium">{s.label}</span>
              <input value={(form[s.key as keyof typeof form] as string) ?? ''} onChange={e=>setForm({...form,[s.key]:e.target.value})} placeholder="https://..." className="rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"/>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold">Features</h2>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.showNewsletter} onChange={e=>setForm({...form,showNewsletter:e.target.checked})} className="h-4 w-4 text-primary"/>
            Show newsletter signup in footer
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.showUserReviews} onChange={e=>setForm({...form,showUserReviews:e.target.checked})} className="h-4 w-4 text-primary"/>
            Show User Reviews on spec pages (hide to temporarily remove)
          </label>
        </div>
      </section>

      <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50">
        {saving? <><Loader2 className="h-5 w-5 animate-spin"/> Saving...</> : 'Save Settings'}
      </button>
    </form>
  );
}