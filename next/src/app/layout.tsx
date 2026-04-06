import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative Technician",
  description: "React migration for Creative Technician site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="zCLC+rjJQ9XshNm2L5qAkQ"
          async
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
