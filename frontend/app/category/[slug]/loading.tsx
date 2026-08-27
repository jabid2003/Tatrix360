import { PostCardSkeleton } from '@/components/site/skeletons';

export default function CategoryLoading() {
  return (
    <main className="container-page py-8">
      <header className="mb-8">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-5 w-72 animate-pulse rounded bg-muted" />
      </header>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
