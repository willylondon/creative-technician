import type { Metadata, Viewport } from "next";
import { AnalyticsConsentControls } from "@/components/analytics-consent";
import { Bricolage_Grotesque, Manrope, IBM_Plex_Mono } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { offers, CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/lib/offers";
import "./globals.css";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const SAME_AS = [
  "https://github.com/willylondon",
  "https://www.tiktok.com/@willylondon",
  "https://www.instagram.com/willylondon/",
  "https://x.com/willylondon",
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#business`,
      name: SITE_NAME,
      description:
        "Websites, n8n and AI automation, team AI workshops and IT support for businesses and organisations in Jamaica.",
      url: SITE_URL,
      email: CONTACT_EMAIL,
      telephone: `+${WHATSAPP_NUMBER}`,
      image: `${SITE_URL}/assets/images/willard-wells-hero.webp`,
      areaServed: "Jamaica",
      address: { "@type": "PostalAddress", addressLocality: "Kingston", addressCountry: "JM" },
      founder: { "@id": `${SITE_URL}/#person` },
      sameAs: SAME_AS,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Services",
        itemListElement: offers.map((offer) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: offer.label, description: offer.title },
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: offer.priceValue,
            priceCurrency: "JMD",
          },
        })),
      },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Willard Wells",
      alternateName: "Willy London",
      jobTitle: "IT Support Specialist & Automation Builder",
      url: SITE_URL,
      image: `${SITE_URL}/assets/images/willy-london-avatar.webp`,
      worksFor: { "@id": `${SITE_URL}/#business` },
      address: { "@type": "PostalAddress", addressLocality: "Kingston", addressCountry: "JM" },
      knowsAbout: [
        "IT support",
        "Google Workspace administration",
        "Networking",
        "n8n automation",
        "AI tools",
        "Next.js",
        "Web development",
        "Corporate AI training",
      ],
      alumniOf: ["Vantage Point"],
      sameAs: SAME_AS,
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#050807",
};

export const metadata: Metadata = {
  title: "Willard Wells | IT Support, AI Automation & Web Solutions",
  description:
    "Portfolio of Willard Wells, a Kingston-based IT support specialist and digital solutions builder with 20+ years of experience across systems, automation and web delivery.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Willard Wells | IT Support, AI Automation & Web Solutions",
    description:
      "20+ years of IT support experience, practical AI automation and modern web delivery—from Kingston, Jamaica.",
    url: "/",
    images: [
      {
        url: "/assets/images/willy-london-avatar.webp",
        width: 637,
        height: 637,
        alt: "Willard Wells — IT support, AI automation and web solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@willylondon",
    title: "Willard Wells | IT Support, AI Automation & Web Solutions",
    description:
      "20+ years of IT support experience, practical AI automation and modern web delivery—from Kingston, Jamaica.",
    images: ["/assets/images/willy-london-avatar.webp"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <head>
        {/* Schema.org: one business + one person, linked, with the service catalogue */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <AnalyticsConsentControls />
      </body>
    </html>
  );
}
