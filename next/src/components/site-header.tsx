import Link from "next/link";
import { Mail, Menu } from "lucide-react";

/**
 * Shared site header. Section links use absolute "/#…" paths so the header
 * works on the homepage and on blog pages alike.
 */
export default function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="site-header">
        <div className="site-container header-inner">
          <Link href="/#top" className="brand data-hover" aria-label="The Creative Technician, home">
            <span className="brand-symbol" aria-hidden="true"><i />CT</span>
            <span className="brand-copy">
              <strong>The Creative Technician</strong>
              <small>Willard Wells · Kingston, Jamaica</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <Link href="/#profile">Profile</Link>
            <Link href="/#work">Work</Link>
            <Link href="/#experience">Experience</Link>
            <Link href="/#contact">Contact</Link>
            <Link href="/blog">Field notes</Link>
          </nav>

          <Link className="header-resume data-hover" href="/#contact">
            Start a project <Mail aria-hidden="true" />
          </Link>

          <details className="mobile-menu">
            <summary aria-label="Open navigation" aria-expanded="false"><Menu aria-hidden="true" /></summary>
            <nav aria-label="Mobile navigation">
              <Link href="/#profile">Profile</Link>
              <Link href="/#work">Work</Link>
              <Link href="/#experience">Experience</Link>
              <Link href="/#contact">Contact</Link>
              <Link href="/blog">Field notes</Link>
              <a href="/Willard-Wells-CV.pdf" download>Download résumé</a>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
