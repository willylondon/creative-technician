# The Creative Technician — Next.js App

Production Next.js 16 (App Router) application for [www.thecreativetechnician.online](https://www.thecreativetechnician.online).

## Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling & Typography:** Tailwind CSS v4 (`@tailwindcss/postcss`, `@tailwindcss/typography`) with `Bricolage_Grotesque`, `Manrope`, and `IBM_Plex_Mono` via `next/font/google`
- **Motion & 3D:** GSAP + ScrollTrigger, Three.js
- **Content:** Markdown posts in `src/content/_posts/` parsed by `src/lib/posts.ts` and rendered with `react-markdown`

## Scripts

```bash
npm run dev          # Start local dev server on http://localhost:3000
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run Node test suite (src/lib/*.test.mjs, next.config.test.mjs)
npm run test:smoke   # Smoke-test built output in .next/server/app
```


## Invoice workspace

The private workspace is served by the same Next.js app at `/invoices`. Enter the same four-digit PIN on each device to access synced invoices. Use **Settings** to set the preferred payment account. Its instructions appear on new invoices and can be edited for each client. **Email invoice** sends the PDF through the site’s Resend account, using the invoice contact address for replies. Use **Get PDF** to download or share a copy to Google Drive.

Connect a private Vercel Blob store to the production project. Set `INVOICE_PIN_HASH` to `salt:hash` (hex for a 16-byte random salt and a 32-byte Node.js scrypt result) and `INVOICE_SESSION_KEY` to a random secret at least 32 characters long. Rotating the PIN hash or session key signs out all devices. The canonical website origin is used by default. For a separate deployment set `INVOICE_APP_ORIGIN` to its origin.

To move existing invoices, export a backup from the original local workspace and import it online under **Settings**. Existing invoice numbers are skipped. For local use, set `INVOICE_LOCAL_MODE=true` and use the same hostname and port as the original app to find the browser’s saved records.
