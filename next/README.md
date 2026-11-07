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

