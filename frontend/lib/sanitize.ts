// Shared sanitization + URL validation helpers.
// Used by admin APIs and server components to prevent XSS and broken links.
// Keep dependency-free so it works in route handlers and server components.

const ALLOWED_URL_PROTOCOLS = new Set(['http:', 'https:']);

export function isSafeHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  // Allow site-relative URLs (/latest, /mobile/xyz) and https/http absolute.
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) return false;
    return !/[\s<>"]/.test(trimmed);
  }
  try {
    const url = new URL(trimmed);
    return ALLOWED_URL_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

/** Returns the trimmed URL if safe, otherwise undefined. */
export function sanitizeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > 2048) return undefined;
  if (!isSafeHttpUrl(trimmed)) return undefined;
  return trimmed;
}

/** Strip script/style/iframe/object/embed tags + event handlers + javascript: URLs. */
export function sanitizeRichText(input: string, maxLength = 100_000): string {
  let out = input.slice(0, maxLength);
  // Remove dangerous block tags entirely (with content for script/style).
  out = out.replace(/<script[\s\S]*?<\/script\s*>/gi, '');
  out = out.replace(/<style[\s\S]*?<\/style\s*>/gi, '');
  out = out.replace(/<\/?(iframe|object|embed|form|input|button|link|meta)\b[^>]*>/gi, '');
  // Remove event-handler attributes (onclick=, onerror=, ...).
  out = out.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // Neutralize javascript:/data:/vbscript: URLs in href/src.
  out = out.replace(/\s(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, ' $1="#"');
  out = out.replace(/\s(href|src)\s*=\s*("data:[^"]*"|'data:[^']*'|data:[^\s>]+)/gi, ' $1="#"');
  out = out.replace(/\s(href|src)\s*=\s*("vbscript:[^"]*"|'vbscript:[^']*'|vbscript:[^\s>]+)/gi, ' $1="#"');
  return out;
}

/** Plain-text single-line field: trim, collapse whitespace, cap length. */
export function sanitizeText(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

/** Multi-line plain text (bio, summary): trim, cap length, keep line breaks. */
export function sanitizeMultiline(value: unknown, maxLength = 5000): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n/g, '\n').trim().slice(0, maxLength);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 160);
}
