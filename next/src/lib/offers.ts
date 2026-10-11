/**
 * Service offers and lead-capture options.
 *
 * This file is the single place to edit prices, packages and the choices shown
 * in the contact form. Starting packages were reviewed against the Jamaican
 * market in October 2026; final costs and delivery dates depend on the quote.
 * Offer ids are also the values the form submits, so keep them stable once
 * leads start coming in.
 */

export interface Offer {
  id: string;
  label: string;
  title: string;
  audience: string;
  includes: string[];
  /** Full package limits and separately quoted work, shown in the scope FAQ. */
  scopeDetails: string[];
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
      "Up to 5 standard pages, mobile-first",
      "Contact form, WhatsApp & basic SEO",
      "2 revision rounds & 45-minute handover",
      "14-day defect-fix period",
    ],
    scopeDetails: [
      "One design direction, up to 5 standard pages, a contact form, WhatsApp links and basic SEO. Includes 2 consolidated revision rounds, a 45-minute handover and 14 days of defect fixes after delivery.",
      "You supply the copy and branding. Domain, hosting, email, paid plugins and ongoing maintenance cost extra. E-commerce, booking systems and custom integrations are quoted separately.",
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
      "1 workflow connecting 2 existing apps",
      "1 trigger and up to 5 actions",
      "Testing, failure alerts & operating guide",
      "1 refinement & 45-minute handover",
    ],
    scopeDetails: [
      "One workflow connecting 2 existing apps through standard integrations, with 1 trigger and up to 5 actions. Includes testing, basic failure alerts, an operating guide, 1 refinement, a 45-minute handover and 14 days of defect fixes after delivery.",
      "Software subscriptions and API usage cost extra. Complex branching, two-way sync, data migration, custom AI agents and ongoing monitoring are quoted separately.",
    ],
    timeline: "1–3 weeks per workflow",
    price: "J$60,000",
    priceUsd: "≈ US$380",
    priceValue: 60000,
    priceNote: "per workflow",
    cta: "Automate a process",
  },
  {
    id: "workshop",
    label: "Team AI workshops",
    title: "Hands-on AI training your staff will actually use.",
    audience: "Organisations that want capable staff, not just licences.",
    includes: [
      "4 hours live online, including breaks",
      "Up to 10 people and 2 team use cases",
      "45-minute planning call & materials",
      "45-minute follow-up within 30 days",
    ],
    scopeDetails: [
      "The base workshop is live online: 4 hours including breaks, for up to 10 participants. Includes a 45-minute planning call, preparation for up to 2 team use cases, materials and a 45-minute follow-up within 30 days.",
      "On-site delivery, travel, venue and catering are quoted separately. Larger groups, additional use cases and full-day sessions need a separate quote.",
    ],
    timeline: "4-hour live online session",
    price: "J$175,000",
    priceUsd: "≈ US$1,100",
    priceValue: 175000,
    priceNote: "per online half-day",
    cta: "Book a workshop",
  },
  {
    id: "it-support",
    label: "IT support retainer",
    title: "Dependable systems without a full-time IT hire.",
    audience: "Offices, schools and small teams in Kingston.",
    includes: [
      "Up to 5 users and 5 computers",
      "4 remote support hours per month",
      "Monthly check-in & health report included",
      "Extra time only with your approval",
    ],
    scopeDetails: [
      "Up to 5 users and 5 computers, with 4 remote support hours each month including the monthly check-in and report. Unused hours do not roll over. Support hours and response arrangements are confirmed in your written quote.",
      "Extra time is J$7,500 per hour, billed in 30-minute increments and only after your approval. Hardware, licences, on-site visits, migrations, server administration, incident response and after-hours work are quoted separately.",
    ],
    timeline: "Monthly, cancel anytime",
    price: "J$25,000",
    priceUsd: "≈ US$160",
    priceValue: 25000,
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
export const WHATSAPP_NUMBER = "18768617153";
export const CONTACT_PHONE_DISPLAY = "+1 876 861 7153";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Willard, I found you through The Creative Technician and I’d like to talk about a project.",
)}`;

/** Optional Cal.com / Calendly link; the booking buttons are hidden when unset. */
export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || "";

export const CONTACT_EMAIL = "willardwells@gmail.com";
