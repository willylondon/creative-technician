import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import SiteEffects from "@/components/site-effects";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-background p-4 pt-24 text-foreground sm:p-6 sm:pt-32">
      <SiteEffects />
      <div className="mx-auto max-w-4xl">
        <header className="mb-12">
          <Link
            href="/"
            className="mb-8 inline-block text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Blog Archive
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            20+ years of IT experience, automation stories, and hiking field
            guides.
          </p>
        </header>

        <div className="grid gap-12">
          {posts.map((post) => (
            <article key={post.slug} className="group relative flex flex-col items-start">
              <h2 className="text-2xl font-bold font-heading group-hover:text-cyan-300 transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
                  <span className="relative z-10">{post.title}</span>
                </Link>
              </h2>
              <time className="relative z-10 order-first mb-3 flex items-center text-sm text-slate-400 pl-3.5">
                <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                  <span className="h-4 w-0.5 rounded-full bg-slate-500" />
                </span>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <p className="relative z-10 mt-2 text-sm text-muted-foreground leading-relaxed">
                {post.content.split("\n")[0].substring(0, 160)}...
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
      </div>
    </main>
  );
}
