# Handover & Recovery Instructions: The Creative Technician

## Project Overview
We are migrating the authoritative **Jekyll** site (`thecreativetechnician.online`) to a modern **Next.js** framework on Vercel.

## Current Status (Last Known State)
- **Deployment Tracker:** [Vercel Project Overview](https://vercel.com/willardwells-7888s-projects/creative-technician)
- **Repo:** `willylondon/creative-technician`

### What Has Been Implemented:
1. **Newsletter Logic:** Brevo integration is live. `BREVO_API_KEY` and `BREVO_LIST_ID` are configured in Vercel.
2. **Authoritative Content:** Hero text ("IT Brain. Creator Hands..."), Stats section (20+ yrs), and 5 primary capabilities have been restored to `next/src/app/page.tsx`.
3. **Aesthetics:** "Court Lines" SVG background and "Noise Overlay" have been added to `SiteEffects`. Google Fonts (Epilogue, Space Grotesk) are imported.
4. **Blog Migration:** 
   - A `posts.ts` utility reads MD files from the root `_posts` folder.
   - `/blog` (Archive) and `/blog/[slug]` (Detail) routes have been created.
   - **Crucial:** The home page only shows the latest 3 posts. The full archive is at `/blog`.

## Identified Issues / "Missing" Items:
The user reports the Vercel site is "still missing so much." This likely refers to:

### 1. Potential Build Failure
The `posts.ts` utility uses `path.join(process.cwd(), "..", "_posts")`. 
> [!WARNING]
> **Check the Build Log:** If Vercel fails to build, it's likely because the `_posts` folder is in the parent directory relative to the `next` root. If Vercel's "Root Directory" is set to `next/`, it may not have access to the `_posts` folder during the build phase.
> **Fix:** Move the `_posts` folder inside `next/src/content` and update the `POSTS_PATH` in `posts.ts`.

### 2. Missing Navigation
The header nav link for "Blog" points to `#blog` (on-page section), not `/blog` (the full archive).
> **Fix:** Update header in `page.tsx` to link to `/blog`.

### 3. Missing Sub-Pages
Check the original Jekyll repo for other files like `about.md`, `stack.md`, etc., that might not have been ported to individual Next.js pages.

### 4. Styles & Assets
- **Broken Images:** Check if `public/profile.jpg` or other images used in posts are missing.
- **Font Loading:** Ensure Epilogue and Space Grotesk are correctly prioritized in `globals.css`.

## Instructions for Next Agent:
1. **Audit the Vercel Build:** Check the latest deployment logs for errors.
2. **Verify Path Integrity:** Ensure `_posts` are accessible during build.
3. **Full Content Audit:** Compare `index.html` (Jekyll root) with `page.tsx` (Next root) side-by-side. Look for specific bullet points, testimonials, or footer details I might have missed.
4. **Update Domain:** Once Next.js is 1:1 or 1:better, help the user update DNS/Vercel settings for `thecreativetechnician.online`.
5. **Verify Newsletter:** Ensure the subscribe action works on the Vercel URL.
