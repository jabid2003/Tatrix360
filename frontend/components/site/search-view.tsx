'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

import { CompactCard } from '@/components/site/post-card';
import { HorizontalCard } from '@/components/site/horizontal-card';
import type { Post } from '@/lib/types';

export function SearchView() {
  const router = useRouter();
  const params = useSearchParams();
  const urlQuery = params.get('q')?.trim() ?? '';

  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Keep local state in sync when the URL query changes (e.g. search again).
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Search request failed');
        const data = await res.json();
        if (!cancelled) {
          setResults(data.results || []);
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        if (!cancelled) {
          setResults([]);
          setSuggestions([]);
          setError('Something went wrong. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(run, query.trim() ? 250 : 0);

    return () => {
      cancelled = true;
      controller.abort();
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const hasQuery = query.trim().length > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="max-w-3xl">
        <p className="section-label text-primary">Search</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">Find a story</h1>
        <p className="mt-3 text-muted-foreground">
          Search the latest news, guides, reviews, and explainers from Tatrix360.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
      >
        <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles..."
          aria-label="Search articles"
          className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
        />
        {loading && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />}
        {!loading && hasQuery && (
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Search
          </button>
        )}
      </form>

      {error && (
        <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && hasQuery && results.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Search results</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Results for &quot;{query}&quot;</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? 'story' : 'stories'}
            </span>
          </div>
          <div className="divide-y divide-border">
            {results.map((post) => (
              <CompactCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {!loading && hasQuery && results.length === 0 && !error && (
        <div className="mt-10 rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">No results for &quot;{query}&quot;.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different keyword.</p>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <section className="mt-14">
          <div className="mb-4">
            <p className="section-label text-primary">Latest</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {hasQuery ? 'More stories to explore' : 'Latest stories'}
            </h2>
          </div>
          <div className="divide-y divide-border">
            {suggestions.map((post) => (
              <HorizontalCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
