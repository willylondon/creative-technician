import fs from "fs";
import path from "path";

// Blog post sources, kept inside the app so the build never reaches outside
// its own project root.
const POSTS_PATH = path.join(process.cwd(), "src", "content", "_posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
}

const EXCERPT_LENGTH = 155;

/** Strips the common Markdown syntax so content can be used as a meta description. */
function buildExcerpt(content: string): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
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
  if (!fs.existsSync(POSTS_PATH)) {
    return [];
  }

  const files = fs.readdirSync(POSTS_PATH);
  const posts = files
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .map((file) => {
      const fullPath = path.join(POSTS_PATH, file);
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
        const firstImgRegex = /!\[(.*?)\]\((https?:\/\/[^)]+)\)/;
        const imgMatch = content.match(firstImgRegex);
        if (imgMatch) {
          coverImage = imgMatch[2];
          // Remove the first image from content to avoid rendering it twice
          cleanedContent = content.replace(firstImgRegex, '').trim();
        }
      }

      return {
        slug,
        title: metadata.title || "Untitled",
        date,
        content: cleanedContent,
        excerpt: metadata.description || buildExcerpt(cleanedContent),
        coverImage,
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

export function getAllPostSlugs(): string[] {
  const posts = getAllPosts();
  return posts.map((post) => post.slug);
}
