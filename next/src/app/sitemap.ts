import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { caseStudies } from "@/lib/case-studies";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  // Listing pages change when a post is published, so date them by the newest
  // post instead of the build time (which made every page look edited daily).
  const newest = posts.map((p) => new Date(p.date)).find((d) => !Number.isNaN(d.getTime()));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const published = new Date(post.date);

    return {
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: Number.isNaN(published.getTime()) ? undefined : published,
      changeFrequency: "yearly",
      priority: 0.7,
    };
  });

  return [
    {
      url: SITE_URL,
      lastModified: newest,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: newest,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...["builds", "life"].map((topic) => ({
      url: `${SITE_URL}/blog/${topic}`,
      lastModified: newest,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...caseStudies.map((study) => ({
      url: `${SITE_URL}/work/${study.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...postEntries,
  ];
}
