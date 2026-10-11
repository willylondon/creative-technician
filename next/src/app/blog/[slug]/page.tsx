import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import {
  POST_TOPICS,
  formatPostDate,
  getAllPostSlugs,
  getPostBySlug,
  getReadingTime,
  getRelatedPosts,
} from "@/lib/posts";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { offers, WHATSAPP_URL } from "@/lib/offers";
import SiteEffects from "@/components/site-effects";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ReactMarkdown from "react-markdown";
import AuthorCard from "@/components/author-card";
import NewsletterCTA from "@/components/newsletter-cta";
import TrackedLink from "@/components/tracked-link";

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

/** Picks the offer a build post most naturally leads to. */
function offerForPost(title: string, categories: string[] = []) {
  const text = `${title} ${categories.join(" ")}`.toLowerCase();
  const id = /workshop|teaching|training/.test(text)
    ? "workshop"
    : /admin|it support|troubleshoot|network/.test(text)
      ? "it-support"
      : /website|web\b|cms|seo/.test(text)
        ? "website"
        : "automation";
  return offers.find((offer) => offer.id === id);
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = getRelatedPosts(post.slug);
  const topic = POST_TOPICS.find((t) => t.id === post.topic);
  const offer = post.topic === "builds" ? offerForPost(post.title, post.categories) : undefined;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: post.coverImage ? `${SITE_URL}${post.coverImage}` : undefined,
    author: {
      "@type": "Person",
      name: "Willard Wells",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <>
      <SiteEffects />
      <SiteHeader />
      <main id="main-content" className="journal-shell">
        <article>
          <header className="post-head">
            <div className="site-container">
              <Link href={topic ? `/blog/${topic.id}` : "/blog"} className="case-back data-hover">
                <ArrowLeft aria-hidden="true" />{topic ? `${topic.label} notes` : "All notes"}
              </Link>
              <p className="journal-card-meta post-meta">
                {topic && <span>{topic.label}</span>}
                <time dateTime={post.date.slice(0, 10)}>{formatPostDate(post.date)}</time>
                <span>{getReadingTime(post.content)} min read</span>
              </p>
              <h1>{post.title}</h1>
              {post.excerpt && <p className="post-dek">{post.excerpt}</p>}
            </div>
            {post.coverImage && (
              <div className="site-container">
                <figure className="post-cover">
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1100px) 94vw, 1040px"
                  />
                </figure>
              </div>
            )}
          </header>

          <div className="site-container">
            <div className="post-body prose prose-invert prose-lg">
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

            <footer className="post-foot">
              {offer && (
                <aside className="post-offer" aria-label="Work with me">
                  <p className="mono-label">Need something like this built?</p>
                  <h2>{offer.title}</h2>
                  <p>
                    {offer.label} projects start at <strong>{offer.price}</strong> {offer.priceNote}. Tell me what you’re dealing with and you’ll get a clear written proposal.
                  </p>
                  <div className="contact-quick">
                    <Link className="button button-dark data-hover" href={`/?service=${offer.id}#contact`}>
                      {offer.cta} <Mail aria-hidden="true" />
                    </Link>
                    <TrackedLink
                      className="button button-dark-wire data-hover"
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      event="whatsapp_click"
                      eventParams={{ location: "blog_post" }}
                    >
                      WhatsApp me <MessageCircle aria-hidden="true" />
                    </TrackedLink>
                  </div>
                </aside>
              )}

              <NewsletterCTA />
              <AuthorCard />

              {related.length > 0 && (
                <section className="post-related" aria-label="Related posts">
                  <p className="mono-label">Keep reading</p>
                  <div className="notes-list">
                    {related.map((relatedPost) => (
                      <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="note-row data-hover">
                        <span>{POST_TOPICS.find((t) => t.id === relatedPost.topic)?.label}</span>
                        <div>
                          <p>{formatPostDate(relatedPost.date, { year: "numeric", month: "short", day: "numeric" })}</p>
                          <h3>{relatedPost.title}</h3>
                        </div>
                        <ArrowUpRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </footer>
          </div>
        </article>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </>
  );
}
