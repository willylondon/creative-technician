import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Mail, MessageCircle, Sparkles } from "lucide-react";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";
import { offers, WHATSAPP_URL } from "@/lib/offers";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import SiteEffects from "@/components/site-effects";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import MobileCta from "@/components/mobile-cta";
import TrackedLink from "@/components/tracked-link";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: `Case study not found | ${SITE_NAME}` };

  const title = `${study.title} — Case study | ${SITE_NAME}`;
  return {
    title,
    description: study.summary,
    alternates: { canonical: `/work/${study.slug}` },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: study.title,
      description: study.summary,
      url: `/work/${study.slug}`,
      images: [{ url: study.image.src, width: study.image.width, height: study.image.height, alt: study.image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: study.title,
      description: study.summary,
      images: [study.image.src],
    },
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const offer = offers.find((o) => o.id === study.service);
  const others = caseStudies.filter((s) => s.slug !== study.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: study.title,
    description: study.summary,
    image: `${SITE_URL}${study.image.src}`,
    author: { "@type": "Person", name: "Willard Wells", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/work/${study.slug}`,
  };

  return (
    <main className="portfolio-shell">
      <SiteEffects />
      <SiteHeader />

      <div id="main-content">
        <section className="case-hero" id="top">
          <div className="site-container">
            <Link href="/#work" className="case-back data-hover"><ArrowLeft aria-hidden="true" />All work</Link>
            <p className="mono-label case-kicker">Case study / {study.type}</p>
            <h1>{study.title}</h1>
            <p className="case-summary">{study.summary}</p>

            <dl className="case-meta">
              <div><dt>Client</dt><dd>{study.client}</dd></div>
              <div><dt>When</dt><dd>{study.year}</dd></div>
              <div><dt>Service</dt><dd>{offer?.label ?? "Custom"}</dd></div>
              <div><dt>Stack</dt><dd>{study.stack.join(" · ")}</dd></div>
            </dl>

            <figure className="case-figure">
              <Image
                src={study.image.src}
                alt={study.image.alt}
                width={study.image.width}
                height={study.image.height}
                priority
                sizes="(max-width: 1400px) 94vw, 1240px"
              />
            </figure>
          </div>
        </section>

        <section className="case-body">
          <div className="site-container case-grid">
            <div className="section-marker"><span>01</span><p>The problem</p></div>
            <div className="case-prose">
              {study.challenge.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>

            <div className="section-marker"><span>02</span><p>What I built</p></div>
            <ol className="case-steps">
              {study.approach.map((step, index) => (
                <li key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h2>{step.title}</h2><p>{step.copy}</p></div>
                </li>
              ))}
            </ol>

            {study.gallery?.map((img) => (
              <figure className="case-figure case-figure-inline" key={img.src}>
                <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(max-width: 1400px) 94vw, 1240px" />
              </figure>
            ))}

            <div className="section-marker"><span>03</span><p>{study.resultsHeading ?? "Results"}</p></div>
            <ul className="case-results">
              {study.results.map((result) => <li key={result}><Check aria-hidden="true" />{result}</li>)}
            </ul>

            {study.quote && (
              <figure className="case-quote">
                <Sparkles aria-hidden="true" />
                <blockquote>“{study.quote.text}”</blockquote>
                <figcaption>{study.quote.source} <span>{study.quote.role}</span></figcaption>
              </figure>
            )}

            <div className="case-links">
              {study.links.map((link) => {
                const external = link.href.startsWith("http");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-link data-hover"
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                  >
                    {link.label} {external ? <ArrowUpRight aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="case-cta" id="contact">
          <div className="site-container">
            <p className="mono-label">Have a similar problem?</p>
            <h2>Let’s make<br /><span>something work.</span></h2>
            {offer && (
              <p>
                {offer.label} projects start at <strong>{offer.price}</strong> {offer.priceNote}. Tell me what you’re dealing with and you’ll get a clear proposal within a few days.
              </p>
            )}
            <div className="contact-quick">
              <Link className="button button-dark data-hover" href={`/?service=${study.service}#contact`}>
                Start a project <Mail aria-hidden="true" />
              </Link>
              <TrackedLink
                className="button button-dark-wire data-hover"
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                event="whatsapp_click"
                eventParams={{ location: `case_${study.slug}` }}
              >
                WhatsApp me <MessageCircle aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="case-more">
          <div className="site-container">
            <p className="mono-label">More case studies</p>
            <div className="case-more-grid">
              {others.map((other) => (
                <Link key={other.slug} href={`/work/${other.slug}`} className="note-row data-hover">
                  <span>{other.client}</span>
                  <div><p>{other.type}</p><h3>{other.title}</h3></div>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
      <MobileCta />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
