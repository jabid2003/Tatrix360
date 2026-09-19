import { revalidatePath } from 'next/cache';

/**
 * Fail-safe wrapper around Next.js `revalidatePath` (Q5).
 * Cache invalidation must never break an otherwise-successful admin
 * mutation, so any error is logged and swallowed.
 */
export function safeRevalidate(path: string, type?: 'layout' | 'page'): void {
  try {
    if (type) revalidatePath(path, type);
    else revalidatePath(path);
  } catch (err) {
    console.error('[revalidate] failed for', path, err instanceof Error ? err.message : err);
  }
}

/** Revalidate the paths affected by article/content mutations. */
export function revalidateContent(paths: string[] = []): void {
  safeRevalidate('/', 'layout');
  for (const p of paths) safeRevalidate(p, 'layout');
}

/** Revalidate the paths affected by product/spec mutations. */
export function revalidateSpecs(extra: string[] = []): void {
  safeRevalidate('/', 'layout');
  safeRevalidate('/specs', 'layout');
  safeRevalidate('/top', 'layout');
  for (const p of extra) safeRevalidate(p, 'layout');
}
