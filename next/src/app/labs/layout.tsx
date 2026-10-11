import type { Metadata } from "next";

// Experiments, not client-facing pages: keep them out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
