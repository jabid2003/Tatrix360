'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, Send, Mail, MapPin } from 'lucide-react';
import { useCsrfToken } from '@/hooks/use-csrf';

type FormState = {
  name: string;
  email: string;
  message: string;
  company: string;
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '', company: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { authedFetch } = useCsrfToken();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await authedFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="container-page max-w-2xl py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-serif text-3xl font-bold">Message sent</h1>
        <p className="mt-2 text-muted-foreground">Thanks for reaching out. We&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-12 sm:py-16">
      <p className="section-label text-primary">Contact</p>
      <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">Get in touch</h1>
      <p className="mt-3 text-lg text-muted-foreground">Have a tip, correction, or partnership idea? Send us a note.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 text-primary" /> tips@tatrix360.com
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" /> Remote-first, worldwide
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <input type="text" name="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <div>
          <label className="text-sm font-medium" htmlFor="name">Name</label>
          <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="message">Message</label>
          <textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        {status === 'error' && <p className="text-sm text-destructive">Something went wrong. Please try again.</p>}
        <button type="submit" disabled={status === 'loading'} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
          {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Send message</>}
        </button>
      </form>
    </div>
  );
}
