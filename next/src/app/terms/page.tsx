import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import SiteEffects from "@/components/site-effects";

export const metadata: Metadata = {
  title: "Terms of Service | The Creative Technician",
  description:
    "Terms of Service for The Creative Technician. Terms of engagement, service agreements, payment terms, and delivery policies.",
  alternates: {
    canonical: "/terms",
  },
};

function getTermsContent(): { title: string; date: string; content: string } {
  const possiblePaths = [
    path.join(process.cwd(), "src", "content", "terms-of-service.md"),
    path.join(process.cwd(), "next", "src", "content", "terms-of-service.md"),
    path.join(process.cwd(), "..", "terms-of-service.md"),
    path.join(process.cwd(), "terms-of-service.md"),
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
      title: "Terms of Service",
      date: "April 2026",
      content: "# Terms of Service\n\nTerms of Service content is currently being updated.",
    };
  }

  // Strip frontmatter
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const content = match ? match[2] : fileContent;

  return {
    title: "Terms of Service",
    date: "April 5, 2026",
    content,
  };
}

export default function TermsPage() {
  const { date, content } = getTermsContent();

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
              <time className="text-xs font-mono text-muted-foreground">
                Last updated: {date}
              </time>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-heading leading-tight text-white">
              Terms of Service
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
