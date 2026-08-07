import { getPosts } from '@/lib/data';
import { PostCard } from '@/components/site/post-card';

export default async function LatestPage() {
  const posts = await getPosts({
    pageSize: 20,
  });

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Latest
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Latest stories
        </h1>

        <p className="mt-3 text-muted-foreground">
          The latest stories, guides, reviews, and explainers from Tatrix360.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <p className="text-muted-foreground">
            No latest stories found.
          </p>
        </div>
      )}
    </main>
  );
}