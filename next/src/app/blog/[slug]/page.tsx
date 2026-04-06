import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import SiteEffects from "@/components/site-effects";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background border-x border-white/5 p-4 pt-24 text-foreground sm:p-6 sm:pt-32">
      <SiteEffects />
      <article className="mx-auto max-w-4xl">
        <header className="mb-12">
          <Link
            href="/blog"
            className="mb-8 inline-block text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            ← Back to Blog
          </Link>
          <time className="mb-3 block text-sm text-cyan-400 font-mono tracking-widest uppercase">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-heading leading-tight">
            {post.title}
          </h1>
        </header>

        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed text-slate-300 antialiased text-lg">
            {post.content}
          </div>
        </div>

        <footer className="mt-20 border-t border-white/10 pt-12">
          <div className="flex items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-300 to-amber-300" />
            <div>
              <h3 className="text-lg font-bold">Willy London</h3>
              <p className="text-sm text-slate-400">
                IT Consultant & Systems Architect with 20+ years of expertise.
              </p>
            </div>
          </div>
        </footer>
      </article>
    </main>
  );
}
