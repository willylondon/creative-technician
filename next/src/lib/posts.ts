import fs from "fs";
import path from "path";

// Path to the blog posts at the root of the repository
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
        coverImage,
      };
    })
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export function getAllPostSlugs(): string[] {
  const posts = getAllPosts();
  return posts.map((post) => post.slug);
}
