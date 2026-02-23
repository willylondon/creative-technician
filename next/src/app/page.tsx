import Image from "next/image";
import Link from "next/link";
import {
  Instagram,
  Mail,
  MessageCircle,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";
import { GlowingEffectDemo } from "@/components/ui/demo";
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";

const testimonials = [
  {
    author: {
      name: "Operations Lead",
      handle: "@opslead",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    text: "Willy built our automation in a weekend and it paid for itself in the first month.",
  },
  {
    author: {
      name: "Educator & Creator",
      handle: "@creatorcoach",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    text: "The site looks premium and loads fast. People finally take my brand seriously.",
  },
  {
    author: {
      name: "Small Business Owner",
      handle: "@smallbizjam",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    text: "He explained everything in simple language and shipped exactly what we needed.",
  },
];

const services = [
  {
    title: "Automation Sprint",
    description:
      "n8n or Google Apps Script workflows that save hours every week.",
    price: "Starting at $450",
  },
  {
    title: "Website Revamp",
    description: "Modern, fast, mobile-first pages designed to convert.",
    price: "Starting at $650",
  },
  {
    title: "Content Systems",
    description: "Simple pipelines to create, schedule, and publish at scale.",
    price: "Starting at $350",
  },
];

const work = [
  {
    title: "Farika Atkins",
    tag: "Education / Portfolio",
    description:
      'Professional academic portfolio with "Royal Educator" branding.',
    href: "https://www.farikaatkins.online",
  },
  {
    title: "Master Bryan Kukibo",
    tag: "Martial Arts / Web",
    description:
      "Digital dojo for Grandmaster Bryan Campbell with a modern web presence.",
    href: "https://masterbryankukibo.online",
  },
  {
    title: "Jamaica Basketball",
    tag: "Sports / Media",
    description:
      "Sports media coverage, highlights, player stats, and leadership content.",
    href: "https://www.instagram.com/jamaicabasketball/",
  },
];

const posts = [
  {
    title: "Jamaica Basketball: Road to Qatar 2027",
    href: "/assets/images/jamaica-basketball-qatar-2027-1.png",
  },
  {
    title: "How I Built a Headless CMS with Google Sheets + n8n",
    href: "/assets/images/nonsuch-view.png",
  },
  {
    title: "Nonsuch Falls Survival Guide",
    href: "/assets/images/nonsuch-falls.png",
  },
];

export default function Home() {
  return (
    <main className="site-shell min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide sm:text-base">
            <span className="h-5 w-5 rounded-md bg-gradient-to-br from-cyan-300 to-amber-300" />
            Willy London
          </div>
          <nav className="hidden gap-5 text-sm text-slate-300 md:flex">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#proof">Proof</a>
            <a href="#blog">Blog</a>
            <a href="#stack">Stack</a>
            <a href="#contact">Contact</a>
          </nav>
          <a
            href="#contact"
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-cyan-300 sm:text-sm"
          >
            Hire Me
          </a>
        </div>
      </header>

      <section id="hero" className="section-glow px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-inner mx-auto max-w-6xl">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-cyan-300">
            Systems • Automation • AI • Content
          </p>
          <h1 className="hero-heading text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
            Your{" "}
            <AnimatedTextCycle
              words={[
                "business",
                "team",
                "workflow",
                "productivity",
                "projects",
                "analytics",
                "dashboard",
                "platform",
              ]}
              interval={3000}
              className="text-white"
            />{" "}
            deserves better tools
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            IT Brain. Creator Hands. Coach Discipline. I bridge the gap between
            technical complexity and creative storytelling.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#work"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-300"
            >
              View Featured Work
            </a>
            <a
              href="#about"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium hover:bg-white/10"
            >
              Read Full Bio
            </a>
            <Link
              href="https://calendly.com/willardwells"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium hover:bg-white/10"
              target="_blank"
            >
              Book a Consult
            </Link>
          </div>
        </div>
      </section>

      <section id="featured-capabilities" className="section-glow px-4 py-10 sm:px-6">
        <div className="section-inner mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Featured Capabilities
            </h2>
            <span className="pill-lite">
              Featured highlights
            </span>
          </div>
          <GlowingEffectDemo />
        </div>
      </section>

      <section id="services" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold sm:text-3xl">Services</h2>
            <span className="pill-lite">
              Book fast. Build faster.
            </span>
          </div>
          <p className="mb-8 max-w-3xl text-slate-300">
            If you want systems that work and content that converts, this is
            where we start. Clear scope, fast turnaround, no fluff.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="neo-card rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="mt-3 text-sm text-slate-300">
                  {service.description}
                </p>
                <p className="mt-4 text-sm font-medium">{service.price}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto grid max-w-6xl gap-8 lg:grid-cols-[340px_1fr]">
          <div className="overflow-hidden rounded-3xl border border-white/15">
            <Image
              src="/profile.jpg"
              alt="Willy London"
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">About Me</h2>
            <p className="mb-4 text-slate-300">
              Willard “Willy London” Wells is a Jamaica-based IT professional
              with 20+ years of hands-on technology support and practical
              automation delivery.
            </p>
            <p className="mb-4 text-slate-300">
              He supports critical systems at Hillel Academy and coaches people
              to improve digital presence, branding, and job-market visibility
              with AI tools.
            </p>
            <p className="text-slate-300">
              Outside work: basketball coaching, hiking, and pickleball with a
              strong focus on responsible AI implementation.
            </p>
            <div className="mt-6 flex gap-2">
              <Link
                href="https://www.instagram.com/willylondon/"
                target="_blank"
                className="rounded-full border border-white/15 bg-white/5 p-2"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="https://x.com/willylondon"
                target="_blank"
                className="rounded-full border border-white/15 bg-white/5 p-2"
              >
                <X className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Featured Projects
            </h2>
            <span className="text-sm text-slate-300">Proof of Work</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {work.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                target="_blank"
                className="neo-card rounded-2xl p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <span className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-300">
                    {item.tag}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="section-glow">
        <div className="section-inner">
          <TestimonialsSection
            title="Proof & Results"
            description="What clients feel after launch"
            testimonials={testimonials}
          />
        </div>
      </section>

      <section id="blog" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold sm:text-3xl">Latest Insights</h2>
            <span className="text-sm text-slate-300">From the Lab</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((post, index) => (
              <article key={post.title} className="neo-card overflow-hidden rounded-2xl">
                <Image
                  src={post.href}
                  alt={post.title}
                  width={800}
                  height={520}
                  className="h-44 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-base leading-tight font-semibold">{post.title}</h3>
                  <p className="mt-2 text-xs text-slate-300">
                    {index === 0
                      ? "Sports strategy + storytelling"
                      : index === 1
                        ? "Automation + publishing pipeline"
                        : "Field guide with practical prep"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto max-w-6xl">
          <h2 className="mb-6 text-2xl font-semibold sm:text-3xl">Skill Stack</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="neo-card rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <h3 className="font-semibold">Technical Core</h3>
              </div>
              <p className="text-sm text-slate-300">
                IT systems, networking, troubleshooting, Google Workspace, and
                support operations.
              </p>
            </article>
            <article className="neo-card rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <h3 className="font-semibold">Automation + AI</h3>
              </div>
              <p className="text-sm text-slate-300">
                n8n, Apps Script, workflow orchestration, and AI-assisted
                content pipelines.
              </p>
            </article>
            <article className="neo-card rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <h3 className="font-semibold">Content Systems</h3>
              </div>
              <p className="text-sm text-slate-300">
                Video editing, storytelling, social posting cadence, and
                performance review loops.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="contact" className="section-glow px-4 py-14 sm:px-6 sm:py-20">
        <div className="section-inner mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">
              Initialize Connection
            </h2>
            <p className="mb-6 text-slate-300">
              Available for automation consulting, system setups, and content
              strategy collaborations.
            </p>
            <Link
              href="mailto:willardwells@gmail.com"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium"
            >
              <Mail className="h-4 w-4" />
              willardwells@gmail.com
            </Link>
          </div>
          <form
            action="mailto:willardwells@gmail.com"
            method="post"
            encType="text/plain"
            className="neo-card space-y-3 rounded-2xl p-6"
          >
            <input
              type="text"
              name="name"
              placeholder="Name / Organization"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm"
              required
            />
            <textarea
              name="message"
              placeholder="Project details or inquiry..."
              className="h-32 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm"
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-slate-300 sm:px-6">
        <p>© {new Date().getFullYear()} Willy London. Built with Systems & Soul.</p>
      </footer>
    </main>
  );
}
