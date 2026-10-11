import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Page not found | The Creative Technician",
  robots: { index: false },
};

const destinations = [
  { href: "/#services", label: "Services & pricing", note: "Websites, automation, AI workshops and IT support" },
  { href: "/#work", label: "Selected work", note: "Case studies and live client builds" },
  { href: "/blog/builds", label: "Build notes", note: "How real systems were built, broken and fixed" },
  { href: "/#contact", label: "Start a project", note: "Tell me what you need — reply within one business day" },
];

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="journal-shell">
        <section className="journal-head not-found">
          <div className="site-container">
            <div className="section-marker"><span>404</span><p>Broken link</p></div>
            <div className="journal-head-grid">
              <h1>This page<br /><span>went offline.</span></h1>
              <p>
                The link may be old or mistyped — some older field notes were retired in 2026. Here’s where most people are headed:
              </p>
            </div>
          </div>
        </section>
        <section className="journal-list">
          <div className="site-container">
            <div className="notes-list">
              {destinations.map((d, i) => (
                <Link key={d.href} href={d.href} className="note-row data-hover">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div><p>{d.note}</p><h3>{d.label}</h3></div>
                  <ArrowRight aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
