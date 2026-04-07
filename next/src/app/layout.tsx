import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT Automation & Web Systems Consultant in Jamaica | Willy London",
  description:
    "Jamaica-based IT automation consultant and content creator. I build high-performance systems — automation workflows, websites, and content pipelines. 20+ years IT experience.",
  metadataBase: new URL("https://thecreativetechnician.online"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "The Creative Technician",
    title: "IT Automation & Web Systems Consultant in Jamaica | Willy London",
    description:
      "Jamaica-based IT automation consultant and content creator. I build high-performance systems — automation workflows, websites, and content pipelines. 20+ years IT experience.",
    url: "https://thecreativetechnician.online/",
    images: [
      {
        url: "https://thecreativetechnician.online/assets/images/photo-from-willy-london.jpg",
        width: 1200,
        height: 630,
        alt: "Willy London — IT Automation Consultant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@willylondon",
    title: "IT Automation & Web Systems Consultant in Jamaica | Willy London",
    description:
      "Jamaica-based IT automation consultant and content creator. I build high-performance systems — automation workflows, websites, and content pipelines. 20+ years IT experience.",
    images: [
      "https://thecreativetechnician.online/assets/images/photo-from-willy-london.jpg",
    ],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  other: {
    "theme-color": "#080808",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
              name: "The Creative Technician",
              description:
                "IT infrastructure expert and digital growth coach specialising in automation workflows, website development, and content systems for creative professionals.",
              url: "https://thecreativetechnician.online",
              telephone: "+1-876-797-8034",
              email: "willardwells@gmail.com",
              areaServed: "Jamaica",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Kingston",
                addressCountry: "JM",
              },
              image:
                "https://thecreativetechnician.online/assets/images/photo-from-willy-london.jpg",
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
              url: "https://thecreativetechnician.online",
              image:
                "https://thecreativetechnician.online/assets/images/photo-from-willy-london.jpg",
              description:
                "Jamaica-based IT professional with 20+ years experience. Automation consultant, content creator, and digital growth coach.",
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
              offers: [
                {
                  "@type": "Offer",
                  name: "Automation Sprint",
                  price: "450",
                  priceCurrency: "USD",
                },
                {
                  "@type": "Offer",
                  name: "Website Revamp",
                  price: "650",
                  priceCurrency: "USD",
                },
                {
                  "@type": "Offer",
                  name: "Content Systems",
                  price: "350",
                  priceCurrency: "USD",
                },
              ],
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
