import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import SiteEffects from "@/components/site-effects";
import { SITE_NAME } from "@/lib/site";

const title = "Privacy Policy | The Creative Technician";
const description = "Privacy Policy for The Creative Technician. Details on data collection, use, third-party analytics, and user rights.";
const previewImage = {
  url: "/assets/images/willy-london-avatar.webp",
  width: 637,
  height: 637,
  alt: "Willard Wells, The Creative Technician",
};

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title,
    description,
    url: "/privacy",
    images: [previewImage],
  },
  twitter: {
    card: "summary_large_image",
    site: "@willylondon",
    title,
    description,
    images: [previewImage],
  },
};

function getPrivacyContent(): { date: string; content: string } {
  const possiblePaths = [
    path.join(process.cwd(), "src", "content", "privacy-policy.md"),
    path.join(process.cwd(), "next", "src", "content", "privacy-policy.md"),
    path.join(process.cwd(), "..", "privacy-policy.md"),
    path.join(process.cwd(), "privacy-policy.md"),
  ];

  let fileContent = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
      fileContent = fs.readFileSync(/*turbopackIgnore: true*/ p, "utf8");
      break;
    }
  }

  if (!fileContent) {
    return {
      date: "",
      content: "Privacy Policy content is currently being updated.",
    };
  }

  // Strip frontmatter
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const content = match ? match[2] : fileContent;
  const date = content.match(/^\*\*Last Updated:\*\*\s*(.+)$/m)?.[1] ?? "";
  // The page header renders these once; keep the source date authoritative.
  const body = content
    .replace(/^\s*# Privacy Policy\s*\r?\n/, "")
    .replace(/^\*\*Last Updated:\*\*[^\r\n]*(?:\r?\n|$)/m, "")
    .trim();

  return {
    date,
    content: body,
  };
}

export default function PrivacyPage() {
  const { date, content } = getPrivacyContent();

  return (
    <>
      <SiteEffects />
      <SiteHeader />
      <main
        id="main-content"
        className="min-h-screen bg-background p-4 py-16 text-foreground sm:p-6 sm:py-20"
      >
        <article className="mx-auto max-w-4xl">
          <header className="mb-12 border-b border-white/10 pb-8">
            <Link
              href="/"
              className="mb-8 inline-block text-sm font-medium text-muted-foreground hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block px-2.5 py-1 text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 rounded">
                Legal & Compliance
              </span>
              {date && (
                <time className="text-xs font-mono text-muted-foreground">
                  Last updated: {date}
                </time>
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-heading leading-tight text-white">
              Privacy Policy
            </h1>
          </header>

          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-strong:text-white">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
