import {
  HeroSkeleton,
  PostCardSkeleton,
  CategoryListSkeleton,
  TrendingCardSkeleton,
} from '@/components/site/skeletons';

export default function Loading() {
  return (
    <div className="flex flex-col">
      <HeroSkeleton />
      <div className="container-page grid grid-cols-2 gap-10 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-7 w-40 animate-pulse rounded bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <aside className="flex flex-col gap-6">
          <CategoryListSkeleton />
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <TrendingCardSkeleton key={i} />
              ))}
            </div>
          </div>
          <div className="min-h-[200px] animate-pulse rounded-2xl border border-dashed border-border bg-muted/20" />
        </aside>
      </div>
    </div>
  );
}
