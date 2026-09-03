import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <Link href="/#top" className="footer-brand"><span>CT</span><strong>The Creative Technician</strong></Link>
        <p>IT brain. Creator hands. Coach discipline.</p>
        <div>
          <a href="/Willard-Wells-CV.pdf" download>Résumé</a>
          <Link href="/blog">Field notes</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:willardwells@gmail.com">Email</a>
        </div>
        <small>© {new Date().getFullYear()} Willard Wells</small>
      </div>
    </footer>
  );
}
