import type { Metadata } from "next";
import { getAllPosts, POST_TOPICS } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";
import SiteEffects from "@/components/site-effects";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import BlogArchive from "@/components/blog-archive";

const topic = POST_TOPICS.find((t) => t.id === "builds")!;
const title = `Builds — Field Notes | ${SITE_NAME}`;
const previewImage = {
  url: "/assets/images/Screenshot 2026-04-30 at 11.40.41 AM.webp",
  width: 800,
  height: 418,
  alt: "An n8n workflow for AI reporting, with content processing and delivery routes",
};

export const metadata: Metadata = {
  title,
  description: topic.description,
  alternates: { canonical: "/blog/builds" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title,
    description: topic.description,
    url: "/blog/builds",
    images: [previewImage],
  },
  twitter: {
    card: "summary_large_image",
    site: "@willylondon",
    title,
    description: topic.description,
    images: [previewImage],
  },
};

export default function BuildsPage() {
  const posts = getAllPosts().filter((post) => post.topic === "builds");

  return (
    <>
      <SiteEffects />
      <SiteHeader />
      <BlogArchive posts={posts} currentPage={1} totalPages={1} topic="builds" />
      <SiteFooter />
    </>
  );
}
