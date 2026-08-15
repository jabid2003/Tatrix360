'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Copy, Share2 } from 'lucide-react';

type ArticleActionsProps = {
  title: string;
  description?: string;
};

export default function ArticleActions({
  title,
  description,
}: ArticleActionsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  function getShareText() {
    const summary = description?.trim()
      ? `${description.trim()}\n\n`
      : '';

    return `${title}\n\n${summary}Read more on Tatrix360:`;
  }

  async function copyLink() {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);

      setIsCopied(true);
      toast.success('Link copied');

      window.setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      toast.error('Unable to copy link');
    }
  }

  async function shareArticle() {
    if (typeof navigator === 'undefined') {
      return;
    }

    if (!navigator.share) {
      toast.error(
        'Sharing is not supported in this browser. Please use the copy button.'
      );
      return;
    }

    try {
      setIsSharing(true);

      const url = window.location.href;

      await navigator.share({
        title: `${title} | Tatrix360`,
        text: getShareText(),
        url,
      });
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return;
      }

      toast.error('Unable to share article');
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="flex w-full justify-end">
      <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 p-1.5 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={shareArticle}
          disabled={isSharing}
          aria-label="Share this article"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span>{isSharing ? 'Sharing…' : 'Share article'}</span>
        </button>

        <button
          type="button"
          onClick={copyLink}
          aria-label={isCopied ? 'Link copied' : 'Copy article link'}
          title={isCopied ? 'Link copied' : 'Copy article link'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}