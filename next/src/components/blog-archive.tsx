import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/posts";
import NewsletterCTA from "@/components/newsletter-cta";

export const POSTS_PER_PAGE = 12;

export function pageCount(totalPosts: number): number {
  return Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
}

interface BlogArchiveProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
}

function pageHref(page: number): string {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

export default function BlogArchive({ posts, currentPage, totalPages }: BlogArchiveProps) {
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = posts.slice(start, start + POSTS_PER_PAGE);

  return (
    <main id="main-content" className="min-h-screen bg-background p-4 py-16 text-foreground sm:p-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Field Notes
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            20+ years of IT experience, automation stories, and hiking field
            guides.
          </p>
        </header>

        <div className="grid gap-12 lg:grid-cols-2">
          {visiblePosts.map((post) => (
            <article key={post.slug} className="group relative flex flex-col items-start bg-white/5 border border-white/5 rounded-3xl p-6 transition-all hover:bg-white/10 hover:border-white/10">
              {post.coverImage && (
                <div className="relative w-full aspect-[16/9] mb-6 overflow-hidden rounded-2xl bg-black shadow-lg">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              <time className="relative z-10 mb-3 flex items-center text-sm text-cyan-400 font-mono tracking-widest uppercase">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="text-2xl font-bold font-heading mb-3 group-hover:text-white text-slate-200 transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0 z-20" />
                  <span className="relative z-10">{post.title}</span>
                </Link>
              </h2>
              <p className="relative z-10 text-sm text-muted-foreground leading-relaxed flex-grow">
                {post.excerpt}
              </p>
              <div className="relative z-10 mt-4 flex items-center text-sm font-medium text-cyan-400 group-hover:text-cyan-300">
                Read article
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="ml-1 h-4 w-4 stroke-current">
                  <path d="M6.75 5.75 9.25 8l-2.5 2.25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </article>
          ))}
        </div>

        <NewsletterCTA />

        {totalPages > 1 && (
          <nav aria-label="Archive pages" className="mt-16 flex items-center justify-between border-t border-white/10 pt-8 font-mono text-sm uppercase tracking-widest">
            {currentPage > 1 ? (
              <Link rel="prev" href={pageHref(currentPage - 1)} className="text-cyan-400 hover:text-cyan-300">
                ← Newer
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link rel="next" href={pageHref(currentPage + 1)} className="text-cyan-400 hover:text-cyan-300">
                Older →
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </nav>
        )}
      </div>
    </main>
  );
}
