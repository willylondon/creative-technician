import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Manrope, IBM_Plex_Mono } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
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
        {/* Ahrefs analytics */}
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="zCLC+rjJQ9XshNm2L5qAkQ"
          async
        />
        {/* Schema.org LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: SITE_NAME,
              description:
                "IT infrastructure expert and digital growth coach specialising in automation workflows, website development, and content systems for creative professionals.",
              url: SITE_URL,
              telephone: "+1-876-861-7153",
              email: "willardwells@gmail.com",
              areaServed: "Jamaica",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Kingston",
                addressCountry: "JM",
              },
              image:
                `${SITE_URL}/assets/images/photo-from-willy-london.webp`,
              priceRange: "$$$",
              knowsLanguage: ["en"],
              sameAs: [
                "https://www.tiktok.com/@willylondon",
                "https://www.instagram.com/willylondon/",
                "https://x.com/willylondon",
              ],
            }),
          }}
        />
        {/* Schema.org Person */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Person", "ProfessionalService"],
              name: "Willard Wells",
              alternateName: "Willy London",
              jobTitle: "IT Automation Consultant & Creative Technician",
              url: SITE_URL,
              image:
                `${SITE_URL}/assets/images/photo-from-willy-london.webp`,
              description:
                "Kingston-based IT support specialist and digital solutions builder with 20+ years of experience in systems, networking, AI automation and web delivery.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Kingston",
                addressCountry: "JM",
              },
              sameAs: [
                "https://tiktok.com/@willylondon",
                "https://instagram.com/willylondon",
                "https://x.com/willylondon",
              ],
              knowsAbout: [
                "IT Infrastructure",
                "n8n Automation",
                "Content Creation",
                "AI Tools",
                "Google Workspace",
                "Jekyll",
                "JavaScript",
              ],
              alumniOf: ["Vantage Point"],
            }),
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-R13SZWDJ3S"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R13SZWDJ3S');
          `}
        </Script>
      </body>
    </html>
  );
}
