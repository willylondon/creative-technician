import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { POST_TOPICS, formatPostDate, getReadingTime, type Post, type PostTopic } from "@/lib/posts";
import NewsletterCTA from "@/components/newsletter-cta";

export const POSTS_PER_PAGE = 12;

export function pageCount(totalPosts: number): number {
  return Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
}

interface BlogArchiveProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  /** Set on /blog/builds and /blog/life, which list every post in that topic on one page. */
  topic?: PostTopic;
}

function pageHref(page: number): string {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

const tabs = [
  { href: "/blog", label: "All notes", id: undefined },
  ...POST_TOPICS.map((t) => ({ href: `/blog/${t.id}`, label: t.label, id: t.id })),
];

function topicLabel(topic: PostTopic): string {
  return POST_TOPICS.find((t) => t.id === topic)?.label ?? topic;
}

function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={`journal-card${featured ? " journal-card-featured" : ""}`}>
      <Link href={`/blog/${post.slug}`} className="journal-card-link data-hover">
        <div className="journal-card-media">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes={featured ? "(max-width: 900px) 94vw, 720px" : "(max-width: 760px) 94vw, (max-width: 1100px) 47vw, 400px"}
              priority={featured}
            />
          ) : (
            <span className="journal-card-placeholder" aria-hidden="true">{topicLabel(post.topic)}</span>
          )}
        </div>
        <div className="journal-card-copy">
          <p className="journal-card-meta">
            <span>{topicLabel(post.topic)}</span>
            <time dateTime={post.date.slice(0, 10)}>{formatPostDate(post.date, { year: "numeric", month: "short", day: "numeric" })}</time>
            <span>{getReadingTime(post.content)} min</span>
          </p>
          <h2>{post.title}</h2>
          {post.excerpt && <p className="journal-card-excerpt">{post.excerpt}</p>}
          <span className="journal-card-more">Read note <ArrowUpRight aria-hidden="true" /></span>
        </div>
      </Link>
    </article>
  );
}

export default function BlogArchive({ posts, currentPage, totalPages, topic }: BlogArchiveProps) {
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = topic ? posts : posts.slice(start, start + POSTS_PER_PAGE);
  const activeTopic = POST_TOPICS.find((t) => t.id === topic);
  // Lead with a featured note on the first page of each listing.
  const showFeatured = currentPage === 1 && visiblePosts.length > 2;
  const [featured, ...rest] = showFeatured ? visiblePosts : [undefined, ...visiblePosts];

  return (
    <main id="main-content" className="journal-shell">
      <section className="journal-head">
        <div className="site-container">
          <div className="section-marker"><span>04</span><p>Field notes{activeTopic ? ` / ${activeTopic.label}` : ""}</p></div>
          <div className="journal-head-grid">
            <h1>
              {activeTopic ? (
                <>{activeTopic.label}<br /><span>field notes.</span></>
              ) : (
                <>The messy middle,<br /><span>documented.</span></>
              )}
            </h1>
            <p>
              {activeTopic?.description ??
                "Build stories from 20+ years in IT — what worked, what broke and how it got fixed — plus life, hiking and Jamaica."}
            </p>
          </div>
          <nav aria-label="Filter notes by topic" className="journal-tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={tab.id === topic ? "page" : undefined}
                className="data-hover"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="journal-list">
        <div className="site-container">
          {featured && <PostCard post={featured} featured />}
          <div className="journal-grid">
            {rest.map((post) => post && <PostCard key={post.slug} post={post} />)}
          </div>

          {!topic && totalPages > 1 && (
            <nav aria-label="Archive pages" className="journal-pages">
              {currentPage > 1 ? (
                <Link rel="prev" href={pageHref(currentPage - 1)} className="text-link data-hover">
                  <ArrowLeft aria-hidden="true" /> Newer
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
              <span>Page {currentPage} of {totalPages}</span>
              {currentPage < totalPages ? (
                <Link rel="next" href={pageHref(currentPage + 1)} className="text-link data-hover">
                  Older <ArrowRight aria-hidden="true" />
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
            </nav>
          )}

          <NewsletterCTA />
        </div>
      </section>
    </main>
  );
}
