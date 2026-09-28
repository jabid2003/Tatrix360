export const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PC9zdmc+';

export function getImageBlurUrl(src: string): string {
  if (src.includes('cloudinary')) {
    const parts = src.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_20,h_20,c_fill,e_blur:100,q_auto,f_auto/${parts[1]}`;
    }
  }
  return BLUR_DATA_URL;
}

/** True for `data:image/...;base64,...` URLs (e.g. AI-generated images copied from the browser). */
export function isImageDataUrl(value: string): boolean {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value.trim());
}

/**
 * Convert a data: URL into a File so it can ride the normal multipart upload
 * path (avoids stuffing multi-MB base64 strings into JSON request bodies).
 * Returns null when the value is not a parseable data URL.
 */
export function dataUrlToFile(dataUrl: string, filename = 'image'): File | null {
  try {
    const match = dataUrl.trim().match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);
    if (!match) return null;
    const mime = (match[1] || 'image/jpeg').toLowerCase();
    const bytes = match[2]
      ? Uint8Array.from(atob(match[3]), (c) => c.charCodeAt(0))
      : new TextEncoder().encode(decodeURIComponent(match[3]));
    if (bytes.length === 0) return null;
    const ext = mime.split('/')[1]?.split('+')[0] || 'jpg';
    return new File([bytes], `${filename}.${ext}`, { type: mime });
  } catch {
    return null;
  }
}

export interface DroppedImage {
  file?: File;
  url?: string;
}

/**
 * Extract an image from a drop event. Handles two cases the plain file-input
 * flow misses:
 *  1. Files dropped from the OS (File objects).
 *  2. Images dragged straight out of a web page / AI studio (no files —
 *     the browser only provides a URL or data URL as text).
 */
export function getDroppedImage(dataTransfer: DataTransfer | null): DroppedImage | null {
  if (!dataTransfer) return null;
  const files = Array.from(dataTransfer.files ?? []);
  if (files.length > 0) {
    // Prefer an actual image; otherwise hand the first file over and let the
    // server's type/size validation respond with a friendly error.
    const img = files.find((f) => f.type.startsWith('image/')) ?? files[0];
    return { file: img };
  }
  const text =
    dataTransfer.getData('text/uri-list').split('\n').map((l) => l.trim()).find(Boolean) ||
    dataTransfer.getData('text/plain').split('\n').map((l) => l.trim()).find(Boolean) ||
    '';
  if (!text) return null;
  if (text.startsWith('data:')) {
    const file = dataUrlToFile(text, 'dropped-image');
    return file ? { file } : null;
  }
  if (/^https?:\/\//i.test(text)) return { url: text };
  return null;
}
