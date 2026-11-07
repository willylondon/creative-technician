# Authoring Checklist (Next.js 16 + Sveltia CMS)

- **Post location:** Published posts live in `next/src/content/_posts/YYYY-MM-DD-slug.md`.
- **Frontmatter fields:**
  - `title`: Post title (rendered as the page `<h1>` in the header; do not repeat `# Title` in the Markdown body).
  - `date`: `YYYY-MM-DD` publication date.
  - `description`: 1–2 sentence summary used for SEO meta descriptions, Open Graph cards, and the article deck.
  - `categories`: Inline list (`categories: [Automation, n8n]`) or multi-line YAML list (`categories:\n  - Automation\n  - n8n`).
  - `topic` *(optional)*: `builds` or `life` (auto-inferred from `categories` when omitted).
  - `image` *(optional)*: Root-relative path under `next/public/assets/images/...` (e.g. `/assets/images/post-cover.webp`). If omitted, the first Markdown image in the post body is promoted to the hero cover automatically.
  - `image_alt` *(optional)*: Accessible alt text for the cover image (falls back to the first Markdown image's alt text or the post title).
- **Inline images in posts:**
  - Use standard Markdown syntax: `![Descriptive alt text](/assets/images/example.webp)`
  - Do **not** append Jekyll/Kramdown `{: width="..." ... }` attribute blocks; `react-markdown` automatically applies `loading="lazy"` and `decoding="async"` to all inline images.

