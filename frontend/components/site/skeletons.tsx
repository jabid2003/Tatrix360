import { Skeleton } from '@/components/ui/skeleton';

export function ArticleSkeleton() {
  return (
    <div className="container-page py-6 sm:py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Header */}
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="mt-4 h-10 w-full sm:h-12 lg:h-16" />
        <Skeleton className="mt-4 h-6 w-3/4" />
        <Skeleton className="mt-2 h-6 w-1/2" />

        {/* Author meta */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="mx-auto mt-8 max-w-4xl">
        <Skeleton className="aspect-[16/9] w-full rounded-3xl" />
      </div>

      {/* Body */}
      <div className="mx-auto mt-10 max-w-3xl space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-1 flex-col p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1.5 h-4 w-2/3" />
        <div className="mt-auto flex items-center gap-3 pt-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

export function PostCardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CompactCardSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <Skeleton className="h-16 w-16 flex-shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function TrendingCardSkeleton() {
  return (
    <div className="flex items-start gap-4 py-3">
      <Skeleton className="h-8 w-8 rounded" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

export function CategoryListSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Skeleton className="mb-4 h-4 w-24" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function AdminListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-5 w-5 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2 font-mono" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="hero-glow" />
      <div className="container-page relative py-8 sm:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <Skeleton className="aspect-[16/10] rounded-3xl lg:col-span-3 lg:row-span-2 lg:aspect-[16/12]" />
          <Skeleton className="h-48 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-48 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    </section>
  );
}
