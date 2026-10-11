import type { Metadata } from "next";
import { getAllPosts, POST_TOPICS } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";
import SiteEffects from "@/components/site-effects";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import BlogArchive from "@/components/blog-archive";

const topic = POST_TOPICS.find((t) => t.id === "builds")!;

export const metadata: Metadata = {
  title: `Builds — Field Notes | ${SITE_NAME}`,
  description: topic.description,
  alternates: { canonical: "/blog/builds" },
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
