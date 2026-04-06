import fs from "fs";
import path from "path";

// Path to the original Jekyll _posts directory
const POSTS_PATH = path.join(process.cwd(), "..", "_posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
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

      // Extract slug from filename (YYYY-MM-DD-slug.md)
      const slug = file.replace(/\.md$/, "");

      return {
        slug,
        title: metadata.title || "Untitled",
        date: metadata.date || file.substring(0, 10),
        content,
        coverImage: metadata.image,
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}
