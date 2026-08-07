import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";
import SiteEffects from "@/components/site-effects";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import BlogArchive, { pageCount } from "@/components/blog-archive";

export const metadata: Metadata = {
  title: `Blog Archive | ${SITE_NAME}`,
  description:
    "20+ years of IT experience, automation stories, and hiking field guides from Kingston, Jamaica.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `Blog Archive | ${SITE_NAME}`,
    description:
      "20+ years of IT experience, automation stories, and hiking field guides from Kingston, Jamaica.",
    url: "/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <SiteEffects />
      <SiteHeader />
      <BlogArchive posts={posts} currentPage={1} totalPages={pageCount(posts.length)} />
      <SiteFooter />
    </>
  );
}
