'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  thumbnailUrl?: string;
}

export function ProductGallery({ images, productName, thumbnailUrl }: ProductGalleryProps) {
  const allImages = images.length ? images : thumbnailUrl ? [thumbnailUrl] : [];
  const [active, setActive] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIdx, setViewerIdx] = useState(0);

  const viewerPrev = useCallback(() => setViewerIdx((i) => (i === 0 ? allImages.length - 1 : i - 1)), [allImages.length]);
  const viewerNext = useCallback(() => setViewerIdx((i) => (i === allImages.length - 1 ? 0 : i + 1)), [allImages.length]);

  function openViewer(idx: number) {
    setViewerIdx(idx);
    setViewerOpen(true);
  }

  useEffect(() => {
    if (!viewerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setViewerOpen(false);
      if (e.key === 'ArrowLeft') viewerPrev();
      if (e.key === 'ArrowRight') viewerNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewerOpen, viewerPrev, viewerNext]);

  if (allImages.length === 0) {
    return <div className="aspect-[4/3] rounded-2xl border border-border bg-muted" />;
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Main image — click to open viewer */}
        <div className="relative aspect-[4/3] bg-muted cursor-pointer" onClick={() => openViewer(active)}>
          <Image
            src={allImages[active]}
            alt={`${productName} — image ${active + 1}`}
            fill
            className="object-contain p-4"
            key={active}
            priority
          />
        </div>

        {/* Thumbnails strip */}
        {allImages.length > 1 && (
          <div className="flex gap-2 p-2 overflow-x-auto scrollbar-hide">
            {allImages.slice(0, 6).map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  i === active ? 'border-blue-500' : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <Image src={img} alt="" width={56} height={56} className="h-full w-auto object-contain p-0.5" />
              </button>
            ))}
            {allImages.length > 6 && (
              <button
                onClick={() => openViewer(0)}
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border-2 border-border bg-muted text-xs font-semibold hover:border-muted-foreground/50"
              >
                +{allImages.length - 6}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Viewer overlay — compact frame */}
      {viewerOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          onClick={() => setViewerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />

          <div
            className="relative z-[61] w-[92vw] max-w-2xl rounded-xl bg-black p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewerOpen(false)}
              className="absolute right-2 top-2 z-[62] rounded-full bg-black/70 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative aspect-[4/3]">
              <Image
                src={allImages[viewerIdx]}
                alt={`${productName} — full view ${viewerIdx + 1}`}
                fill
                className="object-contain rounded-lg"
                key={viewerIdx}
              />

              {allImages.length > 1 && (
                <>
                  <button onClick={viewerPrev} className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70" aria-label="Previous">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={viewerNext} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70" aria-label="Next">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex justify-center gap-1 py-1.5 overflow-x-auto scrollbar-hide">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setViewerIdx(i)}
                    className={`relative h-7 w-7 flex-shrink-0 overflow-hidden rounded border transition-colors ${
                      i === viewerIdx ? 'border-white' : 'border-white/20 hover:border-white/50'
                    }`}
                  >
                    <Image src={img} alt="" width={28} height={28} className="h-full w-auto object-contain p-px" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
