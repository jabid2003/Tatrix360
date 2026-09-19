/**
 * Shared request-body helpers for admin API routes (Q1).
 *
 * The admin UI sends camelCase keys while some clients send snake_case.
 * These helpers centralize the dual-key handling that was previously
 * copy-pasted 15+ times per route — a proven source of field-mapping bugs.
 */

type Body = Record<string, unknown>;

/** Raw value: camelCase key first, then snake_case, then fallback. */
export function pick<T>(body: Body, camel: string, snake: string, fallback?: T): T | undefined {
  const v = body[camel] ?? body[snake] ?? fallback;
  return v as T | undefined;
}

/** Trimmed non-empty string, or undefined. */
export function pickStr(body: Body, camel: string, snake?: string): string | undefined {
  const v = snake ? (body[camel] ?? body[snake]) : body[camel];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

/** Raw string (including empty string) — use when "" is meaningful (explicit clear). */
export function pickRawStr(body: Body, camel: string, snake?: string): string | undefined {
  const v = snake ? (body[camel] ?? body[snake]) : body[camel];
  return typeof v === 'string' ? v : undefined;
}

/** Finite number, or undefined. */
export function pickNum(body: Body, camel: string, snake?: string): number | undefined {
  const v = snake ? (body[camel] ?? body[snake]) : body[camel];
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Boolean with default. Accepts true/false, 1/0, "true"/"false". */
export function pickBool(body: Body, camel: string, snake: string | undefined, fallback: boolean): boolean {
  const v = snake ? (body[camel] ?? body[snake]) : body[camel];
  if (v === undefined) return fallback;
  if (typeof v === 'string') {
    if (v.toLowerCase() === 'true' || v === '1') return true;
    if (v.toLowerCase() === 'false' || v === '0') return false;
  }
  return !!v;
}

/** Array of non-empty strings, or undefined when absent/empty. */
export function pickStrArray(body: Body, camel: string, snake?: string): string[] | undefined {
  const v = snake ? (body[camel] ?? body[snake]) : body[camel];
  if (!Array.isArray(v)) return undefined;
  const out = v.filter((x): x is string => typeof x === 'string' && x.length > 0);
  return out;
}

/** Validated slug: lowercase, URL-safe. */
export function pickSlug(body: Body, camel = 'slug', snake = 'slug'): string | undefined {
  const v = pickStr(body, camel, snake);
  if (!v) return undefined;
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || undefined;
}

/** Client IP for rate limiting (reads x-forwarded-for safely). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}
