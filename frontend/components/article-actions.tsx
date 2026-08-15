'use client';

import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

type ArticleActionsProps = {
  title: string;
  description?: string;
  imageUrl?: string;
};

export default function ArticleActions({
  title,
  description,
  imageUrl,
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

  async function getImageFile() {
    if (!imageUrl) {
      return null;
    }

    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();

      const extension =
        blob.type.split('/')[1] || 'jpg';

      return new File(
        [blob],
        `tatrix360-${Date.now()}.${extension}`,
        {
          type: blob.type || 'image/jpeg',
        }
      );
    } catch {
      return null;
    }
  }

  async function shareArticle() {
    if (
      typeof navigator === 'undefined' ||
      typeof navigator.share !== 'function'
    ) {
      toast.error(
        'Image sharing is not supported in this browser.'
      );
      return;
    }

    try {
      setIsSharing(true);

      const url = window.location.href;
      const imageFile = await getImageFile();

      const shareData: ShareData = {
        title: `${title} | Tatrix360`,
        text: getShareText(),
        url,
      };

      if (
        imageFile &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [imageFile] })
      ) {
        shareData.files = [imageFile];
      }

      await navigator.share(shareData);
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
          aria-label="Share article with image"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Share2
            className="h-4 w-4"
            aria-hidden="true"
          />

          <span>
            {isSharing ? 'Sharing…' : 'Share article'}
          </span>
        </button>

        <button
          type="button"
          onClick={copyLink}
          aria-label={
            isCopied ? 'Link copied' : 'Copy article link'
          }
          title={isCopied ? 'Link copied' : 'Copy article link'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {isCopied ? (
            <Check
              className="h-4 w-4 text-green-600"
              aria-hidden="true"
            />
          ) : (
            <Copy
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </div>
  );
}