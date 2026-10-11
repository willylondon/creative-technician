import type { Metadata } from "next";
import { getAllPosts, POST_TOPICS } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";
import SiteEffects from "@/components/site-effects";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import BlogArchive from "@/components/blog-archive";

const topic = POST_TOPICS.find((t) => t.id === "life")!;
const title = `Life — Field Notes | ${SITE_NAME}`;
const previewImage = {
  url: "/assets/images/hero_image.webp",
  width: 1200,
  height: 627,
  alt: "A Lifestyle Hikers member at a waterfall in Jamaica",
};

export const metadata: Metadata = {
  title,
  description: topic.description,
  alternates: { canonical: "/blog/life" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title,
    description: topic.description,
    url: "/blog/life",
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

export default function LifePage() {
  const posts = getAllPosts().filter((post) => post.topic === "life");

  return (
    <>
      <SiteEffects />
      <SiteHeader />
      <BlogArchive posts={posts} currentPage={1} totalPages={1} topic="life" />
      <SiteFooter />
    </>
  );
}
