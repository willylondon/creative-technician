import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import SiteEffects from "@/components/site-effects";
import { NewsletterDialog } from "@/components/newsletter-dialog";
import { LogoMarquee } from "@/components/logo-marquee";
import { StatsSection } from "@/components/stats-section";
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";
import { GlowingEffectDemo } from "@/components/ui/demo";
import ContactForm from "@/components/contact-form";

const testimonials = [
  {
    author: {
      name: "The Source Arena JA",
      handle: "@sourcearenaja",
      avatar: "",
    },
    text: "Willard Wells is truly one of a kind. He built our entire website single-handedly and delivered something we couldn't have imagined. His professionalism, attention to detail, and lightning-fast turnaround had us speechless. If you need a creative technician who genuinely cares, Willard is your guy!",
  },
  {
    author: {
      name: "Lifestyle Hikers",
      handle: "@lifestylehikers",
      avatar: "",
    },
    text: "We handed Willard our vision and he ran with it completely on his own. The Lifestyle Hikers website came to life beautifully — responsive, clean, and ready on time. What impressed us most was how personal the experience felt. He wasn't just a developer, he was a true creative partner.",
  },
  {
    author: {
      name: "Farika Atkins",
      handle: "@farikaatkins",
      avatar: "",
    },
    text: "Hiring Willard was the best decision I made for my personal brand. He understood my vision immediately and delivered a website that is polished, fast, and truly me. The fact that one person could execute at this level — with such speed and constant availability — is remarkable.",
  },
  {
    author: {
      name: "Master Bryan Kukibo",
      handle: "@masterbryan",
      avatar: "",
    },
    text: "Willard Wells built my entire online presence from the ground up and I couldn't be more proud of the result. He worked with precision, moved fast without cutting corners, and kept me informed every step of the way. A rare talent — one person doing the work of an entire agency!",
  },
];

export default async function Home() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <main className="site-shell min-h-screen bg-background text-foreground">
      <SiteEffects />

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a
            href="#hero"
            className="flex items-center gap-2 text-sm font-bold tracking-wide sm:text-base data-hover"
          >
            <span className="h-5 w-5 rounded-md bg-gradient-to-br from-cyan-300 to-amber-300 flex-shrink-0" />
            Willy London
          </a>
          <nav className="hidden gap-5 text-sm text-slate-300 md:flex">
            <a className="data-hover hover:text-white transition-colors" href="#about">About</a>
            <a className="data-hover hover:text-white transition-colors" href="#services">Services</a>
            <a className="data-hover hover:text-white transition-colors" href="#work">Work</a>
            <a className="data-hover hover:text-white transition-colors" href="#proof">Proof</a>
            <Link className="data-hover hover:text-white transition-colors" href="/blog">Blog</Link>
            <a className="data-hover hover:text-white transition-colors" href="#stack">Stack</a>
            <a className="data-hover hover:text-white transition-colors" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <NewsletterDialog />
            <a
              href="#contact"
              className="data-hover rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-cyan-300 sm:text-sm"
            >
              Hire Me
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="hero" className="relative min-h-[85vh] flex items-end overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/hero_image.png"
            alt="Willy London"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl w-full px-4 pb-20 pt-32 sm:px-6 sm:pb-28">
          <p className="reveal mb-4 text-xs uppercase tracking-[0.25em] text-cyan-300">
            Systems • Automation • AI • Content
          </p>
          <h1 className="hero-heading reveal text-5xl leading-tight font-bold tracking-tight sm:text-7xl">
            IT Brain.<br />
            Creator Hands.<br />
            Coach Discipline.
          </h1>
          <p className="reveal mt-5 max-w-2xl text-lg text-slate-200" style={{ transitionDelay: "100ms" }}>
            I build high-performance systems for the digital-first era. From 20+ years of IT infrastructure to automated growth systems that scale.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3" style={{ transitionDelay: "200ms" }}>
            <a
              href="#work"
              className="data-hover rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
            >
              Systems I&rsquo;ve Shipped
            </a>
            <Link
              href="https://calendly.com/willardwells"
              target="_blank"
              rel="noopener noreferrer"
              className="data-hover rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium hover:bg-white/20"
            >
              Book Strategy Session
            </Link>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <LogoMarquee />

      {/* ── Featured Capabilities ── */}
      <section id="featured-capabilities" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="reveal text-2xl font-semibold sm:text-3xl">Featured Capabilities</h2>
            <span className="pill-lite reveal">Featured highlights</span>
          </div>
          <GlowingEffectDemo />
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="reveal text-2xl font-semibold sm:text-3xl">Services</h2>
            <span className="pill-lite reveal">Book fast. Build faster.</span>
          </div>
          <p className="reveal mb-8 max-w-3xl text-slate-300">
            If you want systems that work and content that converts, this is where we start. Clear scope, fast turnaround, no fluff.
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            {/* Automation Sprint */}
            <article className="neo-card data-hover reveal rounded-2xl p-6 flex flex-col relative">
              <h3 className="text-xl font-semibold mb-3">Automation Sprint</h3>
              <p className="text-sm text-slate-300 mb-4 flex-grow">
                n8n or Google Apps Script workflows that save hours every week.
              </p>
              <ul className="text-sm text-slate-400 mb-5 space-y-1 list-disc pl-4">
                <li>Discovery call &amp; workflow mapping</li>
                <li>Custom automation built &amp; tested</li>
                <li>Documentation &amp; handoff</li>
                <li>Delivery: 3–5 business days</li>
              </ul>
              <p className="text-sm font-semibold mb-4">Starting at <span className="text-white text-base">$450</span></p>
              <Link
                href="https://calendly.com/willardwells?utm_source=website&utm_medium=service_card&utm_campaign=automation_sprint"
                target="_blank"
                rel="noopener noreferrer"
                className="data-hover rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-medium text-center hover:bg-cyan-300/20 hover:border-cyan-300/40 transition"
              >
                Book This Sprint →
              </Link>
            </article>

            {/* Website Revamp — POPULAR */}
            <article className="neo-card data-hover reveal rounded-2xl p-6 flex flex-col relative border-cyan-400/40" style={{ transitionDelay: "80ms" }}>
              <div className="absolute top-0 right-0 bg-cyan-400 text-black text-[10px] font-black px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-widest font-mono">
                [ POPULAR ]
              </div>
              <h3 className="text-xl font-semibold mb-3">Website Revamp</h3>
              <p className="text-sm text-slate-300 mb-4 flex-grow">
                Modern, fast, mobile-first pages designed to convert.
              </p>
              <ul className="text-sm text-slate-400 mb-5 space-y-1 list-disc pl-4">
                <li>Up to 5 pages (responsive design)</li>
                <li>SEO-optimised &amp; mobile-first</li>
                <li>2 rounds of revisions included</li>
                <li>Delivery: 5–7 business days</li>
              </ul>
              <p className="text-sm font-semibold mb-4">Starting at <span className="text-white text-base">$650</span></p>
              <Link
                href="https://calendly.com/willardwells?utm_source=website&utm_medium=service_card&utm_campaign=website_revamp"
                target="_blank"
                rel="noopener noreferrer"
                className="data-hover rounded-full bg-cyan-400 text-black px-4 py-2 text-sm font-semibold text-center hover:bg-cyan-300 transition"
              >
                Start Your Revamp →
              </Link>
            </article>

            {/* Content Systems */}
            <article className="neo-card data-hover reveal rounded-2xl p-6 flex flex-col relative" style={{ transitionDelay: "160ms" }}>
              <h3 className="text-xl font-semibold mb-3">Content Systems</h3>
              <p className="text-sm text-slate-300 mb-4 flex-grow">
                Simple pipelines to create, schedule, and publish at scale.
              </p>
              <ul className="text-sm text-slate-400 mb-5 space-y-1 list-disc pl-4">
                <li>Content workflow design &amp; setup</li>
                <li>Scheduling &amp; publishing automation</li>
                <li>Templates &amp; SOPs included</li>
                <li>Delivery: 2–4 business days</li>
              </ul>
              <p className="text-sm font-semibold mb-4">Starting at <span className="text-white text-base">$350</span></p>
              <Link
                href="https://calendly.com/willardwells?utm_source=website&utm_medium=service_card&utm_campaign=content_systems"
                target="_blank"
                rel="noopener noreferrer"
                className="data-hover rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-medium text-center hover:bg-cyan-300/20 hover:border-cyan-300/40 transition"
              >
                Build My System →
              </Link>
            </article>
          </div>

          {/* CTA row */}
          <div className="mt-8 flex flex-wrap gap-3 reveal">
            <Link
              href="https://calendly.com/willardwells"
              target="_blank"
              rel="noopener noreferrer"
              className="data-hover rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-cyan-300 transition"
            >
              Book a Consult
            </Link>
            <a
              href="#contact"
              className="data-hover rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium hover:bg-white/10 transition"
            >
              Request a Quote
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <StatsSection />

      {/* ── About ── */}
      <section id="about" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto grid max-w-6xl gap-10 lg:grid-cols-[340px_1fr]">
          <div className="reveal overflow-hidden rounded-3xl border border-white/15">
            <Image
              src="/profile.jpg"
              alt="Willy London — IT professional and content creator"
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="reveal" style={{ transitionDelay: "100ms" }}>
            <h2 className="mb-6 text-2xl font-semibold sm:text-3xl">About Me</h2>
            <p className="mb-4 text-slate-300">
              <strong>Willard &ldquo;Willy London&rdquo; Wells</strong> is a Jamaica-based IT professional with over 20 years of
              hands-on experience delivering dependable, high-impact technology support. He currently works at Hillel
              Academy, an international K–12 school, where he supports critical systems and builds practical automations
              that improve efficiency, consistency, and day-to-day operations.
            </p>
            <p className="mb-4 text-slate-300">
              In addition to his IT career, Willy is a digital growth coach and content creator with a combined following
              of over 50,000 across multiple platforms. He has led workshops for organisations such as JPS and at Hillel
              Academy focused on content creation with AI and online tools — helping job seekers and professionals improve
              their digital footprint, build a strong personal brand, and increase visibility in the modern job market.
            </p>
            <p className="mb-6 text-slate-300">
              Outside of work, Willy has coached multiple basketball teams and stays active through basketball, hiking,
              and pickleball. Passionate about technology and the future of AI, he&rsquo;s excited by its possibilities while
              advocating strongly for responsible implementation and proper guardrails.
            </p>

            {/* Mini stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
              {[
                { num: "50+", label: "Clients Served" },
                { num: "100+", label: "Workflows Built" },
                { num: "20+", label: "Years in IT" },
                { num: "50k+", label: "Audience Reach" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/3 p-4 text-center">
                  <div className="text-xl font-bold text-cyan-300">{s.num}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex gap-2">
              <Link
                href="https://www.tiktok.com/@willylondon"
                target="_blank"
                rel="noopener noreferrer"
                className="data-hover rounded-full border border-white/15 bg-white/5 p-2 hover:border-cyan-300/40 transition"
                aria-label="TikTok: @willylondon"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </Link>
              <Link
                href="https://www.instagram.com/willylondon/"
                target="_blank"
                rel="noopener noreferrer"
                className="data-hover rounded-full border border-white/15 bg-white/5 p-2 hover:border-cyan-300/40 transition"
                aria-label="Instagram: @willylondon"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </Link>
              <Link
                href="https://x.com/willylondon"
                target="_blank"
                rel="noopener noreferrer"
                className="data-hover rounded-full border border-white/15 bg-white/5 p-2 hover:border-cyan-300/40 transition"
                aria-label="X: @willylondon"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="proof" className="section-glow">
        <div className="section-inner">
          <TestimonialsSection
            title="What Clients Say"
            description="Real results from real clients. Here&rsquo;s what they say about working with me."
            testimonials={testimonials}
          />
        </div>
      </section>

      {/* ── Work ── */}
      <section id="work" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="reveal text-2xl font-semibold sm:text-3xl">Systems I&rsquo;ve Shipped</h2>
            <span className="reveal pill-lite">[ PROOF OF WORK ]</span>
          </div>

          {/* Client Builds */}
          <p className="reveal mb-3 text-xs uppercase tracking-widest text-slate-400 font-mono">[ CLIENT BUILDS ]</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-12">
            {[
              {
                title: "Farika Atkins",
                tag: "Education / Portfolio",
                desc: 'Professional academic portfolio. "Royal Educator" branding for a Department Head & Creative Strategist.',
                outcome: "A polished, SEO-optimised site that communicates authority and expertise to hiring panels and partners.",
                href: "https://www.farikaatkins.online",
              },
              {
                title: "The Source Arena",
                tag: "Sports / Fitness",
                desc: "Community platform for sports and fitness enthusiasts in Jamaica.",
                outcome: "A dynamic hub connecting local athletes and fitness communities.",
                href: "https://thesourcearenaja.com",
              },
              {
                title: "Lifestyle Hikers",
                tag: "Outdoor / Lifestyle",
                desc: "Community for outdoor enthusiasts and lifestyle adventurers.",
                outcome: "A vibrant platform showcasing hiking trails and lifestyle content.",
                href: "https://lifestylehikers.com",
              },
              {
                title: "Master Bryan Kukibo",
                tag: "Martial Arts / Web",
                desc: "Digital dojo for Grandmaster Bryan Campbell. Modernising martial arts heritage with a clean web presence.",
                outcome: "A branded online home that legitimises decades of experience and drives class enquiries.",
                href: "https://masterbryankukibo.online",
              },
            ].map((item, i) => (
              <Link
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-card data-hover reveal rounded-2xl p-5 flex flex-col border-t-2 border-t-amber-400/60"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-base">{item.title}</h3>
                  <span className="rounded border border-white/15 px-2 py-0.5 text-[10px] text-slate-300 whitespace-nowrap">{item.tag}</span>
                </div>
                <p className="text-sm text-slate-300 mb-3 flex-grow">{item.desc}</p>
                <p className="text-xs text-slate-400 mb-3">{item.outcome}</p>
                <span className="text-xs text-amber-400 font-medium">Visit Site →</span>
              </Link>
            ))}
          </div>

          {/* Personal Projects */}
          <p className="reveal mb-3 text-xs uppercase tracking-widest text-slate-400 font-mono">[ PERSONAL PROJECTS ]</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "JamrockAI",
                tag: "TikTok / AI",
                desc: "Automated content brand. Jamaican culture meets AI visuals and storytelling.",
                cta: "Visit TikTok →",
                href: "https://www.tiktok.com/@jamrockai",
              },
              {
                title: "n8n Workflows",
                tag: "Systems",
                desc: "Custom pipelines: Google Drive → Title Generation → YouTube Upload. Fully automated.",
                cta: "See Result →",
                href: "https://www.youtube.com/@JamrockAI",
              },
              {
                title: "When Wi Hungry",
                tag: "Reviews",
                desc: "Food review storytelling. Clean editing, pacing, and honesty.",
                cta: "Watch Reviews →",
                href: "https://www.tiktok.com/@whenwihungry",
              },
              {
                title: "Jamaica Basketball",
                tag: "Community",
                desc: "Sports media coverage. Highlights, player stats, and leadership.",
                cta: "Visit Instagram →",
                href: "https://www.instagram.com/jamaicabasketball/",
              },
            ].map((item, i) => (
              <Link
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-card data-hover reveal rounded-2xl p-5 flex flex-col"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-base">{item.title}</h3>
                  <span className="rounded border border-white/15 px-2 py-0.5 text-[10px] text-slate-300">{item.tag}</span>
                </div>
                <p className="text-sm text-slate-300 flex-grow mb-4">{item.desc}</p>
                <span className="text-xs text-cyan-400 font-medium">{item.cta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog (Latest Insights) ── */}
      <section id="blog" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="reveal text-2xl font-semibold sm:text-3xl">Latest Insights</h2>
            <Link href="/blog" className="reveal text-sm text-cyan-400 hover:text-cyan-300 transition data-hover">
              From the Lab →
            </Link>
          </div>

          {/* Topic tags */}
          <div className="reveal mb-6 flex flex-wrap gap-2">
            {["Automation", "AI in practice", "Hiking + lifestyle", "Content systems"].map((t) => (
              <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">{t}</span>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="neo-card data-hover reveal overflow-hidden rounded-2xl flex flex-col"
                >
                  {post.coverImage ? (
                    <div className="h-44 w-full overflow-hidden bg-black/30">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-gradient-to-br from-cyan-900/30 to-amber-900/20 flex items-center justify-center">
                      <span className="text-4xl opacity-20">✦</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-base font-semibold leading-snug mb-2">{post.title}</h3>
                    <p className="text-xs text-slate-400 flex-grow">{post.excerpt || post.content.replace(/[#*`]/g, "").split("\n").find((l) => l.trim())?.substring(0, 120)}...</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-cyan-400 font-medium">Read Article →</span>
                      <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-slate-400 col-span-3 text-sm">No posts found. Add markdown files to <code>src/content/_posts/</code>.</p>
            )}
          </div>

          <div className="mt-8 flex justify-center reveal">
            <Link
              href="/blog"
              className="data-hover rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium hover:bg-white/10 transition"
            >
              View All Posts →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stack ── */}
      <section id="stack" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto max-w-6xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="reveal text-2xl font-semibold sm:text-3xl">The Stack</h2>
            <span className="pill-lite reveal">Tools I ship with</span>
          </div>
          <p className="reveal mb-10 max-w-2xl text-slate-300">
            Every tool here has been used in production. No fluff, no buzzwords — just what actually works.
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            {/* Engineering & IT */}
            <article className="neo-card data-hover reveal rounded-2xl p-6">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 block">Engineering &amp; IT</span>
              <h3 className="text-lg font-semibold mb-2">Infrastructure &amp; Networks</h3>
              <p className="text-sm text-slate-300 mb-5">
                20+ years keeping systems alive, secure, and fast — from K-12 schools to enterprise networks.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Google Workspace", "Cisco Meraki", "Network+", "CompTIA A+", "Windows Server"].map((t) => (
                  <span key={t} className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">{t}</span>
                ))}
              </div>
            </article>

            {/* Automation & Code */}
            <article className="neo-card data-hover reveal rounded-2xl p-6" style={{ transitionDelay: "80ms" }}>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-2 block">Automation &amp; Code</span>
              <h3 className="text-lg font-semibold mb-2">Workflows &amp; Integrations</h3>
              <p className="text-sm text-slate-300 mb-5">
                Building pipelines that run while you sleep — from simple triggers to multi-step AI workflows.
              </p>
              <div className="flex flex-wrap gap-2">
                {["n8n", "Google Apps Script", "JavaScript", "Webhooks", "REST APIs", "Next.js"].map((t) => (
                  <span key={t} className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">{t}</span>
                ))}
              </div>
            </article>

            {/* Creative & AI */}
            <article className="neo-card data-hover reveal rounded-2xl p-6" style={{ transitionDelay: "160ms" }}>
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-2 block">Creative &amp; AI</span>
              <h3 className="text-lg font-semibold mb-2">Content &amp; Storytelling</h3>
              <p className="text-sm text-slate-300 mb-5">
                50k+ audience built through consistent systems, not luck — AI-assisted and human-crafted.
              </p>
              <div className="flex flex-wrap gap-2">
                {["AI Image Gen", "Video Editing", "Canva", "TikTok Strategy", "Storytelling"].map((t) => (
                  <span key={t} className="rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs text-purple-300">{t}</span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div className="reveal">
            <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">Initialize Connection</h2>
            <p className="mb-6 text-slate-300">
              Available for automation consulting, system setups, and content strategy collaborations.
            </p>

            <div className="mb-6">
              <p className="text-xs uppercase text-slate-400 tracking-widest mb-2">Direct Line</p>
              <Link
                href="mailto:willardwells@gmail.com"
                className="data-hover text-lg font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                willardwells@gmail.com
              </Link>
            </div>

            <p className="text-xs uppercase text-slate-400 tracking-widest mb-3">Full Network</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "TikTok: @willylondon", href: "https://www.tiktok.com/@willylondon" },
                { label: "IG: @willylondon", href: "https://www.instagram.com/willylondon/" },
                { label: "X: @willylondon", href: "https://x.com/willylondon" },
                { label: "@JamrockAI", href: "https://www.tiktok.com/@jamrockai", style: "border-cyan-400/30" },
                { label: "@WhenWiHungry", href: "https://www.tiktok.com/@whenwihungry", style: "border-amber-400/30" },
                { label: "@JamaicaBasketball", href: "https://www.instagram.com/jamaicabasketball/" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`data-hover rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10 transition ${s.style || ""}`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-bold text-base mb-3">
                <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-300 to-amber-300 flex-shrink-0" />
                Willy London
              </div>
              <p className="text-sm text-slate-400 mb-4">
                IT Brain. Creator Hands. Coach Discipline.<br />
                Building high-performance systems for the digital-first era — from Jamaica to the world.
              </p>
              <div className="flex gap-2">
                {[
                  { href: "https://www.tiktok.com/@willylondon", label: "TikTok", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg> },
                  { href: "https://www.instagram.com/willylondon/", label: "Instagram", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> },
                  { href: "https://x.com/willylondon", label: "X", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                ].map((s) => (
                  <Link key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="data-hover rounded-full border border-white/15 bg-white/5 p-2 hover:border-cyan-300/40 transition">
                    {s.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-4">Services</p>
              <div className="flex flex-col gap-2 text-sm text-slate-300">
                <Link href="https://calendly.com/willardwells?utm_source=footer&utm_campaign=automation_sprint" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Automation Sprint</Link>
                <Link href="https://calendly.com/willardwells?utm_source=footer&utm_campaign=website_revamp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Website Revamp</Link>
                <Link href="https://calendly.com/willardwells?utm_source=footer&utm_campaign=content_systems" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Content Systems</Link>
                <Link href="https://calendly.com/willardwells" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Book a Consult</Link>
              </div>
            </div>

            {/* Connect */}
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-4">Connect</p>
              <div className="flex flex-col gap-2 text-sm text-slate-300">
                <Link href="https://www.tiktok.com/@willylondon" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">TikTok @willylondon</Link>
                <Link href="https://www.instagram.com/willylondon/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Instagram @willylondon</Link>
                <Link href="https://x.com/willylondon" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">X @willylondon</Link>
                <Link href="mailto:willardwells@gmail.com" className="hover:text-white transition">willardwells@gmail.com</Link>
                <Link href="https://wa.me/18767978034" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">WhatsApp</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Willy London — Built with Systems &amp; Soul.</p>
            <div className="flex gap-4">
              <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-white transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp Float ── */}
      <Link
        href="https://wa.me/18767978034?text=Hi%20Willy%2C%20I%20viewed%20your%20portfolio%20and%20I%27m%20interested%20in%20working%20with%20you."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:scale-110 transition-transform"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </Link>
    </main>
  );
}
