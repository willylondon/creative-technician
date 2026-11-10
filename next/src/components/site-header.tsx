"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mail, Menu, X } from "lucide-react";
import { NewsletterDialog } from "@/components/newsletter-dialog";

/**
 * Shared site header. Section links use absolute "/#…" paths so the header
 * works on the homepage and on blog pages alike.
 */
export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  const closeMenu = () => {
    if (menuRef.current) {
      menuRef.current.open = false;
    }
    setMenuOpen(false);
  };

  // Keep React state in sync when the <details> is toggled natively, and
  // close on Escape or outside click on every page (including 404).
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const onChange = (e: Event) => setMenuOpen((e.target as HTMLDetailsElement).open);
    const onDocumentKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && el.open) {
        el.open = false;
        setMenuOpen(false);
        summaryRef.current?.focus();
      }
    };
    const onDocumentClick = (event: MouseEvent) => {
      if (el.open && !el.contains(event.target as Node)) {
        el.open = false;
        setMenuOpen(false);
      }
    };

    el.addEventListener("toggle", onChange);
    document.addEventListener("keydown", onDocumentKeydown);
    document.addEventListener("click", onDocumentClick);
    return () => {
      el.removeEventListener("toggle", onChange);
      document.removeEventListener("keydown", onDocumentKeydown);
      document.removeEventListener("click", onDocumentClick);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="site-header">
        <div className="site-container header-inner">
          <Link href="/#top" className="brand data-hover">
            <span className="brand-symbol" aria-hidden="true"><i />CT</span>
            <span className="brand-copy">
              <strong>The Creative Technician</strong>
              <small>Willard Wells · Kingston, Jamaica</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <Link href="/#services">Services</Link>
            <Link href="/#work">Work</Link>
            <Link href="/#experience">Experience</Link>
            <Link href="/blog">Field notes</Link>
            <NewsletterDialog>
              <button type="button">Newsletter</button>
            </NewsletterDialog>
          </nav>

          <Link className="header-resume data-hover" href="/#contact">
            Start a project <Mail aria-hidden="true" />
          </Link>

          <details className="mobile-menu" ref={menuRef}>
            <summary
              ref={summaryRef}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </summary>
            <nav id="mobile-navigation" aria-label="Mobile navigation">
              <Link href="/#services" onClick={closeMenu}>Services &amp; pricing</Link>
              <Link href="/#work" onClick={closeMenu}>Work</Link>
              <Link href="/#experience" onClick={closeMenu}>Experience</Link>
              <Link href="/#contact" onClick={closeMenu}>Contact</Link>
              <Link href="/blog" onClick={closeMenu}>Field notes</Link>
              <NewsletterDialog>
                <button
                  type="button"
                  onClick={closeMenu}
                >
                  Newsletter
                </button>
              </NewsletterDialog>
              <a href="/Willard-Wells-CV.pdf" download onClick={closeMenu}>Download résumé</a>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
