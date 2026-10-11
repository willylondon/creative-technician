import fs from "fs";
import path from "path";

// Published posts live only in src/content/_posts. The repo-root _posts folder
// (the old auto-blog target) and src/content/_archive are deliberately not read.
// Keep this path static so the build doesn't trace the whole project.
const POSTS_DIR = path.join(process.cwd(), "src", "content", "_posts");

function getPostDirectories(): string[] {
  return fs.existsSync(POSTS_DIR) ? [POSTS_DIR] : [];
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  categories?: string[];
  topic: PostTopic;
}

/**
 * "builds" = client-relevant technical write-ups; "life" = personal essays,
 * Jamaica commentary and hiking. A post can force its topic with a
 * `topic: builds|life` frontmatter line; otherwise categories decide.
 */
export type PostTopic = "builds" | "life";

export const POST_TOPICS: { id: PostTopic; label: string; description: string }[] = [
  { id: "builds", label: "Builds", description: "Automation, AI, web and IT support — how real systems were built, broken and fixed." },
  { id: "life", label: "Life", description: "Jamaica, hiking, basketball and personal essays." },
];

const BUILD_CATEGORIES = new Set([
  "automation", "n8n", "ai", "it support", "troubleshooting", "blogging", "instagram",
  "linkedin", "email", "web", "workshops", "teaching", "technology", "tech", "seo",
]);

// Older posts without categories that are still technical build stories.
const BUILD_SLUGS = new Set([
  "automated-seo-blog-engine-n8n-what-broke",
  "what-we-actually-fixed-in-our-blog-automation-stack-today",
  "when-automation-breaks-the-real-work-begins",
]);

function resolveTopic(slug: string, categories: string[], override?: string): PostTopic {
  if (override === "builds" || override === "life") return override;
  if (BUILD_SLUGS.has(slug)) return "builds";
  return categories.some((c) => BUILD_CATEGORIES.has(c.toLowerCase())) ? "builds" : "life";
}

const EXCERPT_LENGTH = 155;

/** Strips the common Markdown syntax so content can be used as a meta description. */
function buildExcerpt(content: string): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    // Drop rules and heading lines outright — headings usually restate the
    // title, which makes for a redundant description.
    .replace(/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/gm, " ")
    .replace(/^\s{0,3}#{1,6}\s+.*$/gm, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= EXCERPT_LENGTH) {
    return plain;
  }

  const truncated = plain.slice(0, EXCERPT_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");

  return `${(lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trimEnd()}…`;
}

export function getAllPosts(): Post[] {
  const dirs = getPostDirectories();
  if (dirs.length === 0) {
    return [];
  }

  const fileMap = new Map<string, string>(); // filename -> fullPath (first found wins)
  for (const dir of dirs) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith(".md") && file !== "README.md" && !fileMap.has(file)) {
          fileMap.set(file, path.join(dir, file));
        }
      }
    } catch {
      // directory read error ignored
    }
  }

  const posts = Array.from(fileMap.entries())
    .map(([file, fullPath]) => {
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Simple Frontmatter Parser (Regex)
      const match = fileContents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      const frontMatter = match ? match[1] : "";
      const content = match ? match[2] : fileContents;

      const metadata: Record<string, string> = {};
      frontMatter.split("\n").forEach((line) => {
        const [key, ...value] = line.split(":");
        if (key && value.length > 0) {
          metadata[key.trim()] = value.join(":").trim().replace(/^['"]|['"]$/g, "");
        }
      });

      // Extract slug and date from filename (YYYY-MM-DD-slug.md)
      const fileNameMatch = file.match(/^(\d{4}-\d{2}-\d{2})-(.*)\.md$/);
      let slug = file.replace(/\.md$/, "");
      let date = metadata.date || "";

      if (fileNameMatch) {
        date = date || fileNameMatch[1];
        slug = fileNameMatch[2];
      } else {
        date = date || new Date().toISOString().split("T")[0];
      }

      // Extract first image to act as coverImage if none is specified
      let coverImage = metadata.image;
      let cleanedContent = content;
      
      if (!coverImage) {
        // Matches remote and root-relative images. Local paths matter now that
        // the previously remote images are served from public/.
        const firstImgRegex = /!\[(.*?)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/;
        const imgMatch = content.match(firstImgRegex);
        if (imgMatch) {
          coverImage = imgMatch[2];
          // Remove the first image from content to avoid rendering it twice
          cleanedContent = content.replace(firstImgRegex, '').trim();
        }
      }

      // Extract categories from frontmatter ("categories: [A, B]" or "categories: A, B")
      let categories: string[] = [];
      const catMatch = frontMatter.match(/^categories:\s*(.+)$/m);
      if (catMatch) {
        categories = catMatch[1]
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((c: string) => c.trim())
          .filter(Boolean);
      }

      return {
        slug,
        title: metadata.title || "Untitled",
        date,
        content: cleanedContent,
        excerpt: metadata.description || buildExcerpt(cleanedContent),
        coverImage,
        categories,
        topic: resolveTopic(slug, categories, metadata.topic),
      };
    })
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

  // The auto-blog job has republished some topics under an identical slug. Only
  // one file can own a URL, so keep the most recent and drop the older copies —
  // otherwise they surface as duplicate cards and duplicate sitemap entries.
  const seen = new Set<string>();

  return posts.filter((post) => {
    if (seen.has(post.slug)) {
      return false;
    }
    seen.add(post.slug);
    return true;
  });
}

export function getPostBySlug(slug: string): Post | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}

/**
 * Rough reading time at ~220 wpm (adult average for web content), with a
 * one-minute floor so nothing renders as "0 min read".
 */
export function getReadingTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Posts sharing the most categories with the given post, newest first. */
export function getRelatedPosts(slug: string, limit = 3): Post[] {
  const all = getAllPosts();
  const current = all.find((p) => p.slug === slug);
  // Stay within the same topic, so a build story never suggests a personal essay.
  const posts = current ? all.filter((p) => p.topic === current.topic) : all;
  if (!current?.categories?.length) {
    return posts.filter((p) => p.slug !== slug).slice(0, limit);
  }
  const currentCategories = new Set(
    current.categories.map((c) => c.toLowerCase())
  );
  return posts
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      overlap: (p.categories ?? []).filter((c) =>
        currentCategories.has(c.toLowerCase())
      ).length,
    }))
    .sort(
      (a, b) =>
        b.overlap - a.overlap ||
        new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
    )
    .slice(0, limit)
    .map(({ post }) => post);
}

export function getAllPostSlugs(): string[] {
  const posts = getAllPosts();
  return posts.map((post) => post.slug);
}

/**
 * Formats a post's frontmatter date as written, ignoring time zones.
 * `new Date("2026-08-22")` is midnight UTC, which renders as Aug 21 anywhere
 * west of Greenwich — including Jamaica — so read the calendar date directly.
 */
export function formatPostDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
): string {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const parsed = match
    ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
    : new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}
