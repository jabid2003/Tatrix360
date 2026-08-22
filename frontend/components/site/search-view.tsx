'use client';

import { useEffect, useState } from 'react';
import {
  Search as SearchIcon,
  Loader2,
  Sparkles,
} from 'lucide-react';

import { PostCard } from '@/components/site/post-card';
import type { Post } from '@/lib/types';

export function SearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const search = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        );

        if (!res.ok) {
          throw new Error('Search request failed');
        }

        const data = await res.json();

        if (!cancelled) {
          setResults(data.results || []);
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setSuggestions([]);
          setError('Something went wrong. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timeout = setTimeout(search, query.trim() ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Search
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Find a story
        </h1>

        <p className="mt-3 text-muted-foreground">
          Search the latest news, guides, reviews, and explainers from Tatrix360.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-input bg-card px-5 py-4 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <SearchIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />

        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles..."
          aria-label="Search articles"
          className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
        />

        {loading && (
          <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-muted-foreground" />
        )}
      </div>

      {error && (
        <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && hasQuery && results.length > 0 && (
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Search results
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Results for &quot;{query}&quot;
              </h2>
            </div>

            <span className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {results.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {!loading && hasQuery && results.length === 0 && !error && (
        <div className="mt-10 rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground" />

          <p className="mt-4 text-lg font-medium text-muted-foreground">
            No results for &quot;{query}&quot;.
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try a different keyword or browse the latest stories below.
          </p>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <section className="mt-14">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />

            <div>
              <p className="text-sm font-medium text-primary">
                {hasQuery ? 'You may also like' : 'Explore Tatrix360'}
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                {hasQuery ? 'More stories to explore' : 'Latest stories'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {suggestions.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}