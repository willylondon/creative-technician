import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Github,
  Mail,
  CalendarDays,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { formatPostDate, getAllPosts } from "@/lib/posts";
import SiteEffects from "@/components/site-effects";
import HeroNodeField from "@/components/hero-node-field";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ContactForm from "@/components/contact-form";
import ServicesSection from "@/components/services-section";
import MobileCta from "@/components/mobile-cta";
import TrackedLink from "@/components/tracked-link";
import { BOOKING_URL, WHATSAPP_URL } from "@/lib/offers";

const selectedPostSlugs = [
  "how-i-built-an-instagram-join-bot-with-n8n-meta-and-one-very-specific-token",
  "how-i-built-a-headless-cms-with-google-sheets-n8n",
  "when-automation-breaks-the-real-work-begins",
];

// Smaller client sites, shown after the detailed projects above. Lifestyle
// Hikers is deliberately absent: it is project 01 and was listed twice.
const clientBuilds = [
  {
    title: "Farika Atkins",
    description:
      "A polished academic portfolio and “Royal Educator” identity for a department head and creative strategist.",
    href: "https://www.farikaatkins.online",
    tags: "EDUCATION · PERSONAL BRAND · PORTFOLIO",
  },
  {
    title: "Master Bryan Kukibo",
    description:
      "A modern digital dojo that gives decades of martial-arts experience a credible online home.",
    href: "https://masterbryankukibo.online",
    tags: "MARTIAL ARTS · BRAND STORY · WEB",
  },
  {
    title: "The Source Arena JA",
    description:
      "A storefront for a Half Way Tree phone and accessories retailer, built around live WhatsApp stock checks and same-day pickup.",
    href: "https://thesourcearenaja.com",
    tags: "RETAIL · STOREFRONT · LOCAL SEO",
  },
];

const projects = [
  {
    index: "01",
    title: "Lifestyle Hikers",
    type: "Production platform / Community operations",
    description:
      "A live platform for Jamaican trails, events, galleries and stories, supported by Git-based publishing, GitHub Actions and n8n/Telegram automation.",
    image: "/assets/images/hero_image.webp",
    imageAlt: "Lifestyle Hikers at a waterfall in Jamaica",
    href: "/work/lifestyle-hikers",
    cta: "Read the case study",
    tags: ["Web platform", "GitHub Actions", "n8n", "Production"],
  },
  {
    index: "02",
    title: "AI Reporting Engine",
    type: "Automation architecture / AI operations",
    description:
      "A multi-route n8n system that validates media, extracts or transcribes content, shapes AI output, then delivers the finished report to email, Telegram and Drive.",
    image: "/assets/images/Screenshot 2026-04-30 at 11.40.41 AM.webp",
    imageAlt: "Multi-stage n8n reporting workflow built by Willard Wells",
    href: "/work/ai-reporting-engine",
    cta: "Read the case study",
    tags: ["n8n", "OpenRouter", "Google APIs", "Fallback routing"],
  },
  {
    index: "03",
    title: "Instagram Join Bot",
    type: "Meta API / Community automation",
    description:
      "A one-message onboarding route connecting Instagram, Meta permissions and automated replies to remove repetitive admin from a growing outdoor community.",
    image: "/assets/images/instagram-dm-autoresponder-connected-instagram.webp",
    imageAlt: "Instagram account connected to an automated onboarding workflow",
    href: "/work/instagram-join-bot",
    cta: "Read the case study",
    tags: ["Meta Graph API", "Instagram", "n8n", "Community ops"],
  },
];

const experience = [
  {
    years: "2010—NOW",
    company: "Hillel Academy",
    role: "IT Support Specialist / Systems Support Technician",
  },
  {
    years: "2025—NOW",
    company: "Jamaica Public Service",
    role: "AI Workshop Facilitator / Digital Skills Contributor",
  },
  {
    years: "CURRENT",
    company: "The Creative Technician",
    role: "Independent AI, Automation & Web Solutions Builder",
  },
  {
    years: "2003—2007",
    company: "Cape Cod Workers Program",
    role: "System Administrator",
  },
];

export default async function Home() {
  const allPosts = getAllPosts();
  const selectedPosts = selectedPostSlugs
    .map((slug) => allPosts.find((post) => post.slug === slug))
    .filter((post): post is NonNullable<typeof post> => Boolean(post));

  return (
    <main className="portfolio-shell">
      <SiteEffects />

      <SiteHeader />

      <div id="main-content">
        <section className="hero-section" id="top">
          <HeroNodeField />
          <div className="hero-grid site-container">
            <div className="hero-copy" data-motion="hero-copy">
              <div className="hero-kicker">
                <span className="status-dot" />
                <span>IT brain · Creator hands · Coach discipline</span>
              </div>
              <h1 aria-label="Websites. Automation. AI training.">
                <span>Websites.</span>
                <span className="outline-type">Automation.</span>
                <span>AI training.</span>
              </h1>
              <p className="hero-lede">
                Built to save Jamaican businesses and teams real hours every week. I’m <strong>Willard Wells</strong> — 20+ years keeping critical systems running, now building the tools and training that make teams faster.
              </p>
              <div className="hero-actions">
                <a className="button button-signal data-hover" href="#services">
                  Services &amp; pricing <ArrowDownRight aria-hidden="true" />
                </a>
                <a className="button button-wire data-hover" href="#contact">
                  Start a project <Mail aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="hero-visual" data-motion="hero-visual">
              <div className="visual-index" aria-hidden="true">
                {projects.length + clientBuilds.length} SHIPPED PROJECTS
              </div>
              <div className="portrait-panel">
                <Image
                  src="/assets/images/willard-wells-hero.webp"
                  alt="Willard Wells thoughtfully reviewing several laptops"
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 900px) 94vw, 56vw"
                />
                <div className="portrait-shade" />
              </div>
              <div className="hero-stat hero-stat-one"><strong>20+</strong><span>years in technology</span></div>
              <div className="hero-stat hero-stat-two"><strong>15+</strong><span>years of trusted support</span></div>
            </div>
          </div>

          <div className="signal-tape" aria-label="Core capabilities">
            <div className="signal-tape-track">
              <span>Systems support</span><i />
              <span>AI automation</span><i />
              <span>Web delivery</span><i />
              <span>Creative problem-solving</span><i />
              <span>Systems support</span><i />
              <span>AI automation</span><i />
              <span>Web delivery</span><i />
              <span>Creative problem-solving</span><i />
            </div>
          </div>
        </section>

        <ServicesSection />

        <section className="work-section" id="work">
          <div className="site-container" data-motion="section">
            <div className="section-marker section-marker-dark"><span>02</span><p>Selected work</p></div>
            <div className="work-head">
              <h2>Not concepts.<br /><span>Working proof.</span></h2>
              <p>Projects selected to show range, judgment and the ability to move from a fuzzy problem to a usable result.</p>
            </div>

            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" data-motion="project" key={project.title}>
                  <Link
                    href={project.href}
                    target={project.href.startsWith("http") ? "_blank" : undefined}
                    rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="project-media data-hover"
                    aria-label={`${project.cta}: ${project.title}`}
                  >
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      sizes="(max-width: 760px) 100vw, 50vw"
                    />
                    <span>{project.cta}<ArrowUpRight aria-hidden="true" /></span>
                  </Link>
                  <div className="project-card-copy">
                    <p className="project-overline"><span>{project.index}</span>{project.type}</p>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <ul className="tag-list">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                  </div>
                </article>
              ))}
            </div>

            <Link href="/work/jps-ai-workshop" className="featured-training data-hover">
              <p className="mono-label">Selected training / Jamaica Public Service</p>
              <h3>Hands-on AI training. Invited back a second year.</h3>
              <p>AI-assisted scripting, phone-shot video and CapCut editing, delivered for JPS in 2025 and 2026. Every participant makes something during the session.</p>
              <span className="text-link">Read the JPS case study <ArrowUpRight aria-hidden="true" /></span>
            </Link>

            <div className="more-builds">
              <p className="mono-label">More client builds</p>
              <div>
                {clientBuilds.map((build, i) => (
                  <a key={build.title} href={build.href} target="_blank" rel="noopener noreferrer" className="data-hover">
                    <article>
                      <span>{String(projects.length + i + 1).padStart(2, "0")}</span>
                      <h3>{build.title}</h3>
                      <p>{build.description}</p>
                      <small>{build.tags} ↗</small>
                    </article>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="endorsement-section" data-motion="section">
          <div className="site-container endorsement-grid">
            <div className="endorsement-title"><Sparkles aria-hidden="true" /><p>Signals from collaborators</p></div>
            <figure>
              <blockquote>“He wasn’t just a developer; he was a true creative partner.”</blockquote>
              <figcaption>Lifestyle Hikers <span>Outdoor community</span></figcaption>
            </figure>
            <figure>
              <blockquote>“One person doing the work of an entire agency.”</blockquote>
              <figcaption>Master Bryan Kukibo <span>Martial arts educator</span></figcaption>
            </figure>
          </div>
        </section>

        <section className="experience-section" id="experience" data-motion="section">
          <div className="site-container">
            <div className="section-marker"><span>03</span><p>Experience</p></div>
            <div className="experience-layout">
              <div className="experience-intro">
                <h2>Built on<br /><span>showing up.</span></h2>
                <p>New tools expand the foundation. They do not replace it: listen, diagnose, explain, deliver, verify.</p>
                <a className="text-link data-hover" href="/Willard-Wells-CV.pdf" download>Open the full résumé <ArrowRight aria-hidden="true" /></a>
                <div className="cert-block"><small>CORE CREDENTIALS</small><strong>CompTIA A+ · Network+ · CCNA training</strong></div>
              </div>
              <div className="timeline">
                {experience.map((item) => (
                  <article key={`${item.company}-${item.years}`}>
                    <time>{item.years}</time>
                    <div><p>{item.company}</p><h3>{item.role}</h3></div>
                  </article>
                ))}
              </div>
            </div>
            <figure className="workshop-evidence" data-motion="section">
              <div className="workshop-photos">
                <Image
                  src="/assets/images/jps-workshop-2026-1.webp"
                  alt="Willard Wells facilitating a hands-on AI workshop for Jamaica Public Service staff, August 2026 — participants working on laptops in a boardroom"
                  width={1400}
                  height={654}
                  loading="lazy"
                  sizes="(max-width: 900px) 94vw, 1200px"
                />
                <Image
                  src="/assets/images/jps-workshop-2026-2.webp"
                  alt="JPS workshop participants applying AI tools on laptops and phones during the August 2026 session"
                  width={1280}
                  height={598}
                  loading="lazy"
                  sizes="(max-width: 900px) 94vw, 1200px"
                />
              </div>
              <figcaption>
                <strong>AI content-creation workshop · Jamaica Public Service · August 2026.</strong>{" "}
                Hands-on session — every participant building, not just watching.{" "}
                <Link href="/work/jps-ai-workshop" className="data-hover">Read the case study →</Link>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="site-container contact-layout" data-motion="section">
            <div className="contact-copy">
              <p className="mono-label">Open channel / Kingston, Jamaica</p>
              <h2>Let’s make<br /><span>something work.</span></h2>
              <p>Need someone who can support what exists, improve what is struggling and build what comes next? I’d like to hear about it.</p>
              <p className="workshop-offer">
                I also run <strong>hands-on AI workshops for teams</strong> — like the repeat engagements delivered for Jamaica Public Service. If your organisation wants staff who can actually use these tools,{" "}
                <a href="#contact-form" data-service="workshop">get in touch about a session</a>.
              </p>
              <ol className="next-steps" aria-label="What happens next">
                <li><span>01</span>You send the details — takes two minutes.</li>
                <li><span>02</span>I reply within one business day to set up a short call.</li>
                <li><span>03</span>You get a written proposal with scope, price and dates.</li>
              </ol>
              <div className="contact-quick">
                <TrackedLink
                  className="button button-dark data-hover"
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  event="whatsapp_click"
                  eventParams={{ location: "contact" }}
                >
                  WhatsApp me <MessageCircle aria-hidden="true" />
                </TrackedLink>
                {BOOKING_URL && (
                  <TrackedLink
                    className="button button-dark-wire data-hover"
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    event="booking_click"
                    eventParams={{ location: "contact" }}
                  >
                    Book a 20-min call <CalendarDays aria-hidden="true" />
                  </TrackedLink>
                )}
              </div>
              <div className="contact-links">
                <TrackedLink href="mailto:willardwells@gmail.com" event="email_click" eventParams={{ location: "contact" }}><Mail aria-hidden="true" />willardwells@gmail.com</TrackedLink>
                <a href="https://github.com/willylondon" target="_blank" rel="noopener noreferrer"><Github aria-hidden="true" />github.com/willylondon</a>
                <span><MapPin aria-hidden="true" />Kingston, Jamaica</span>
              </div>
            </div>
            <div id="contact-form"><ContactForm /></div>
          </div>
        </section>

        {selectedPosts.length > 0 && (
          <section className="notes-section" data-motion="section">
            <div className="site-container">
              <div className="section-marker"><span>04</span><p>Field notes</p></div>
              <div className="notes-head"><h2>The messy middle,<br />documented.</h2><Link href="/blog" className="text-link data-hover">Browse all notes <ArrowRight aria-hidden="true" /></Link></div>
              <div className="notes-list">
                {selectedPosts.map((post, index) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="note-row data-hover">
                    <span>0{index + 1}</span>
                    <div><p>{post.date ? formatPostDate(post.date, { month: "short", year: "numeric" }) : "Field note"}</p><h3>{post.title}</h3></div>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <SiteFooter />
      <MobileCta />
    </main>
  );
}
