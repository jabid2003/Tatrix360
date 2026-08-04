'use client';

import { Twitter, Facebook, MessageCircle, Send, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { SITE_URL } from '@/lib/supabase';

export function ShareBar({
  title,
  slug,
  categorySlug,
}: {
  title: string;
  slug: string;
  categorySlug: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}/${categorySlug}/${slug}`;
  const enc = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);

  const links = [
    {
      label: 'X / Twitter',
      icon: <Twitter className="h-4 w-4" />,
      href: `https://twitter.com/intent/tweet?text=${encTitle}&url=${enc}`,
    },
    {
      label: 'WhatsApp',
      icon: <MessageCircle className="h-4 w-4" />,
      href: `https://wa.me/?text=${encTitle}%20${enc}`,
    },
    {
      label: 'Telegram',
      icon: <Send className="h-4 w-4" />,
      href: `https://t.me/share/url?url=${enc}&text=${encTitle}`,
    },
    {
      label: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Share:</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/80 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          {l.icon}
        </a>
      ))}
      <button
        onClick={copy}
        aria-label="Copy link"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/80 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
