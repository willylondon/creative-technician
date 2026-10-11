import type { NextConfig } from "next";

const archivedPostRedirects = [
  ["best-n8n-integrations-2026", "/blog"],
  ["drone-training-and-applied-technology-programs-at-utech-jamaica", "/blog"],
  ["how-to-automate-tasks-with-n8n", "/blog/bridging-the-gap-how-i-automated-local-community-outreach-with-n8n"],
  ["n8n-workflow-examples-for-beginners", "/blog/bridging-the-gap-how-i-automated-local-community-outreach-with-n8n"],
  ["getting-started-with-n8n-workflow-automation", "/blog/how-i-built-a-headless-cms-with-google-sheets-n8n"],
  ["how-to-automate-your-small-business-with-free-tools-in-2026", "/blog/bridging-the-gap-how-i-automated-local-community-outreach-with-n8n"],
  ["top-free-tools-jamaican-freelancers-should-be-using", "/blog/ai-tools-in-jamaica-2026-guide"],
  ["best-ai-tools-for-content-creators-in-jamaica", "/blog/ai-tools-in-jamaica-2026-guide"],
  ["how-to-build-a-personal-website-with-no-code-in-2026", "/#services"],
].map(([slug, destination]) => ({
  source: `/blog/${slug}`,
  destination,
  permanent: true,
}));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/blog/butterflies-living-memory-banks",
        destination: "/blog/butterflies-world-memory-banks",
        permanent: true,
      },
      // Generic auto-generated posts archived in Oct 2026; each points at the
      // closest real write-up so existing links and rankings carry over.
      ...archivedPostRedirects,
      {
        source: "/privacy-policy",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/terms-of-service",
        destination: "/terms",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
