# React + shadcn setup for these components

This repository is currently a static Jekyll site (no `package.json`, no Tailwind build, no TypeScript compile).
The React files under `components/ui` are source assets for a React app and do not execute in GitHub Pages/Jekyll directly.

## Required stack
- TypeScript
- Tailwind CSS
- shadcn/ui structure

## Quick setup (Next.js + shadcn)
```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npx shadcn@latest init
npm install motion lucide-react @radix-ui/react-avatar
```

## Default paths
- Components: `components/ui`
- Styles: `app/globals.css` (or `src/app/globals.css` if using `src/`)

If your app does not have `components/ui`, create it. Keeping UI primitives in one consistent location is important for:
- predictable imports (`@/components/ui/...`)
- compatibility with shadcn generators
- reuse and easier maintenance

## Tailwind config extension
Add this under `theme.extend` in `tailwind.config.js` or `tailwind.config.ts`:

```js
maxWidth: {
  container: "1280px",
},
animation: {
  marquee: 'marquee var(--duration) linear infinite',
},
keyframes: {
  marquee: {
    from: { transform: 'translateX(0)' },
    to: { transform: 'translateX(calc(-100% - var(--gap)))' }
  }
}
```

## Components added in this repo
- `components/ui/testimonials-with-marquee.tsx`
- `components/ui/testimonial-card.tsx`
- `components/ui/avatar.tsx`
- `components/blocks/testimonials-with-marquee.tsx`
- `components/blocks/testimonials-with-marquee-demo.tsx`

## Existing static-site implementation
A live marquee testimonials effect has also been implemented directly in `index.html` under the `#proof` section so it works on GitHub Pages now.
