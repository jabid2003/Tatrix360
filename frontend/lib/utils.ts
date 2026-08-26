import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatViews(views?: number): string {
  if (!views) return '0';
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return String(views);
}

const WORDS_PER_MINUTE = 238;

export function estimateReadingTime(content?: string): number {
  if (!content) return 1;
  const text = content.replace(/<[^>]+>/g, '').replace(/[#*\-_>`\[\]()!]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
