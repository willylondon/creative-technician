/**
 * Service offers and lead-capture options.
 *
 * This file is the single place to edit prices, packages and the choices shown
 * in the contact form. Prices are set just under Jamaican market rates as
 * researched in October 2026 (local web-design agencies list J$60k–250k for a
 * small-business site; corporate AI training runs ~US$2,500+/day globally).
 * Offer ids are also the values the form submits, so keep them stable once
 * leads start coming in.
 */

export interface Offer {
  id: string;
  label: string;
  title: string;
  audience: string;
  includes: string[];
  timeline: string;
  /** Display price in Jamaican dollars. */
  price: string;
  /** Approximate USD equivalent shown under the price (at ~J$158 = US$1). */
  priceUsd: string;
  /** Numeric JMD amount, used for structured data. */
  priceValue: number;
  priceNote: string;
  cta: string;
}

export const offers: Offer[] = [
  {
    id: "website",
    label: "Websites",
    title: "A fast, credible website that brings in enquiries.",
    audience: "Small businesses, professionals and personal brands.",
    includes: [
      "Up to 5 pages, mobile-first",
      "Contact form, WhatsApp & Google Business setup",
      "Basic SEO, analytics and hosting setup",
      "Handover session so you can update it",
    ],
    timeline: "2–3 weeks",
    price: "J$75,000",
    priceUsd: "≈ US$475",
    priceValue: 75000,
    priceNote: "one-time",
    cta: "Start a website",
  },
  {
    id: "automation",
    label: "Automation & AI",
    title: "Workflows that remove the repetitive admin.",
    audience: "Teams drowning in copy-paste, follow-ups and reporting.",
    includes: [
      "Process mapping before any build",
      "n8n workflow connecting your existing tools",
      "AI steps where they genuinely help",
      "Error alerts, docs and a 30-day tune-up",
    ],
    timeline: "1–3 weeks per workflow",
    price: "J$45,000",
    priceUsd: "≈ US$285",
    priceValue: 45000,
    priceNote: "per workflow",
    cta: "Automate a process",
  },
  {
    id: "workshop",
    label: "Team AI workshops",
    title: "Hands-on AI training your staff will actually use.",
    audience: "Organisations that want capable staff, not just licences.",
    includes: [
      "Tailored to your team’s real tasks",
      "Live builds — everyone works, not watches",
      "Prompt library and follow-up resources",
      "As delivered twice for Jamaica Public Service",
    ],
    timeline: "Half-day or full-day",
    price: "J$175,000",
    priceUsd: "≈ US$1,100",
    priceValue: 175000,
    priceNote: "per half-day session",
    cta: "Book a workshop",
  },
  {
    id: "it-support",
    label: "IT support retainer",
    title: "Dependable systems without a full-time IT hire.",
    audience: "Offices, schools and small teams in Kingston.",
    includes: [
      "Google Workspace & device administration",
      "Network, backup and security check-ups",
      "Priority remote support hours",
      "Monthly plain-English health report",
    ],
    timeline: "Monthly, cancel anytime",
    price: "J$40,000",
    priceUsd: "≈ US$255",
    priceValue: 40000,
    priceNote: "per month",
    cta: "Discuss support",
  },
];

export const otherServiceOption = { id: "other", label: "Something else / not sure yet" };

export const serviceOptions = [
  ...offers.map(({ id, label }) => ({ id, label })),
  otherServiceOption,
];

export const budgetOptions = [
  { id: "under-50k", label: "Under J$50,000" },
  { id: "50k-150k", label: "J$50,000 – 150,000" },
  { id: "150k-500k", label: "J$150,000 – 500,000" },
  { id: "500k-plus", label: "J$500,000+" },
  { id: "unsure", label: "Not sure yet" },
];

export const timelineOptions = [
  { id: "asap", label: "As soon as possible" },
  { id: "1-month", label: "Within a month" },
  { id: "1-3-months", label: "1–3 months" },
  { id: "exploring", label: "Just exploring" },
];

export function labelFor(options: { id: string; label: string }[], id: string): string {
  return options.find((option) => option.id === id)?.label ?? id;
}

/** International format, digits only, for wa.me links. */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "18768617153";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Willard, I found you through The Creative Technician and I’d like to talk about a project.",
)}`;

/** Optional Cal.com / Calendly link; the booking buttons are hidden when unset. */
export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || "";

export const CONTACT_EMAIL = "willardwells@gmail.com";
