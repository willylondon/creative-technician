import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";
import SiteEffects from "@/components/site-effects";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ReactMarkdown from "react-markdown";
import AuthorCard from "@/components/author-card";

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: `Post not found | ${SITE_NAME}` };
  }

  const canonical = `/blog/${post.slug}`;
  const images = post.coverImage ? [post.coverImage] : undefined;

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: post.title,
      description: post.excerpt,
      url: canonical,
      publishedTime: post.date,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <SiteEffects />
      <SiteHeader />
      <main id="main-content" className="min-h-screen bg-background p-4 py-16 text-foreground sm:p-6 sm:py-20">
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
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-heading leading-tight mb-8">
            {post.title}
          </h1>
          
          {post.coverImage && (
            <div className="relative mt-8 mb-12 aspect-[16/9] max-h-[500px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 896px) 896px, 100vw"
                className="object-cover object-center"
              />
            </div>
          )}
        </header>

        {/* @tailwindcss/typography's `prose` styles every markdown element
            (lists, blockquotes, code, tables) consistently — no per-tag
            overrides needed. */}
        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-img:rounded-xl prose-img:border prose-img:border-white/10">
          <ReactMarkdown
            components={{
              img: (props) => {
                const { node, alt, ...rest } = props;
                void node;
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img {...rest} alt={alt ?? ""} loading="lazy" decoding="async" />
                );
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

          <footer className="mt-20 border-t border-white/10 pt-12">
            <AuthorCard />
          </footer>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
