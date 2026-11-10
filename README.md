# The Creative Technician

Personal site, portfolio, case studies, and field notes for Willard Wells ("Willy London") — Kingston, Jamaica.

## Architecture

The production application lives in [`next/`](./next) (Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, GSAP, Three.js):

- **Content:** Published blog posts live in `next/src/content/_posts/`. Legal pages live in `next/src/content/privacy-policy.md` and `next/src/content/terms-of-service.md`.
- **CMS:** Git-backed Sveltia CMS is served at `/admin` (`next/public/admin/config.yml`).
- **Development & Verification:**
  ```bash
  npm --prefix next run dev
  npm --prefix next run lint
  npm --prefix next test
  npm --prefix next run build
  npm --prefix next run test:smoke
  ```

## Authoring

- See [`AUTHORING_CHECKLIST.md`](./AUTHORING_CHECKLIST.md) for post frontmatter and image guidelines.

