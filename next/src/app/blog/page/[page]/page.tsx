import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAllPosts } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";
import SiteEffects from "@/components/site-effects";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import BlogArchive, { pageCount } from "@/components/blog-archive";

interface ArchivePageProps {
  params: Promise<{ page: string }>;
}

export function generateStaticParams() {
  const totalPages = pageCount(getAllPosts().length);

  // Page 1 lives at /blog, so only pages 2..N exist here.
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export async function generateMetadata({ params }: ArchivePageProps): Promise<Metadata> {
  const { page } = await params;

  return {
    title: `Blog Archive – Page ${page} | ${SITE_NAME}`,
    description:
      "20+ years of IT experience, automation stories, and hiking field guides from Kingston, Jamaica.",
    alternates: { canonical: `/blog/page/${page}` },
  };
}

export default async function ArchivePage({ params }: ArchivePageProps) {
  const { page } = await params;
  const currentPage = Number(page);
  const posts = getAllPosts();
  const totalPages = pageCount(posts.length);

  if (!Number.isInteger(currentPage) || currentPage < 1 || currentPage > totalPages) {
    notFound();
  }
  if (currentPage === 1) {
    redirect("/blog");
  }

  return (
    <>
      <SiteEffects />
      <SiteHeader />
      <BlogArchive posts={posts} currentPage={currentPage} totalPages={totalPages} />
      <SiteFooter />
    </>
  );
}
