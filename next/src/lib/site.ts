/**
 * Canonical origin for the site.
 *
 * The apex redirects to the `www` host, so `www` is the canonical form and must
 * be what appears in canonical tags, Open Graph URLs and the sitemap.
 */
export const SITE_URL = "https://www.thecreativetechnician.online";

export const SITE_NAME = "The Creative Technician";

/**
 * 1200×630 card used wherever a page has no suitable image of its own.
 * Social platforms crop to roughly 1.91:1 and do not render SVG.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/assets/images/og-default.png",
  width: 1200,
  height: 630,
  alt: "The Creative Technician — websites, automation and AI training by Willard Wells, Kingston, Jamaica",
};

/** Formats social crawlers can render; anything else falls back to the default card. */
export function socialImage(src?: string): string {
  return src && /\.(?:png|jpe?g|webp|gif)(?:\?.*)?$/i.test(src) ? src : DEFAULT_OG_IMAGE.url;
}
