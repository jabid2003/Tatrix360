import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { getAdminPosts } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { DeletePostButton } from '@/components/site/admin/delete-post-button';

export default async function AdminDashboardPage() {
  const posts = await getAdminPosts();

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Articles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'} total
          </p>
        </div>

        <Link
          href="/adminmja/posts/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
          <p className="text-muted-foreground">
            No articles yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      post.status === 'Published'
                        ? 'bg-primary/10 text-primary'
                        : post.status === 'Draft'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {post.status || 'Draft'}
                  </span>

                  {post.category && (
                    <span className="text-xs text-muted-foreground">
                      {post.category.name}
                    </span>
                  )}
                </div>

                <h3 className="mt-1.5 truncate font-serif text-base font-bold">
                  {post.title}
                </h3>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {post.author?.name ?? 'No author'} · {formatDate(post.publishedAt) || 'Not published'}
                </p>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <Link
                  href={`/adminmja/posts/${post.id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>

                <DeletePostButton postId={post.id} postTitle={post.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}