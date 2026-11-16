This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Invoice workspace

The private workspace is served by the same Next.js app at `/invoices`. Enter the same PIN on each device to access synced invoices. Use **Settings** to set the preferred payment account. Its instructions appear on new invoices and can be edited for each client. **Email invoice** sends the PDF through the site’s Resend account, using the invoice contact address for replies. Use **Get PDF** to download or share a copy to Google Drive.

Connect a private Vercel Blob store to the production project. Set `INVOICE_PIN_HASH` to `salt:hash` (hex for a 16-byte random salt and a 32-byte Node.js scrypt result) and `INVOICE_SESSION_KEY` to a random secret at least 32 characters long. Rotating the PIN hash or session key signs out all devices. The canonical website origin is used by default. For a separate deployment set `INVOICE_APP_ORIGIN` to its origin.

To move existing invoices, export a backup from the original local workspace and import it online under **Settings**. Existing invoice numbers are skipped. For local use, set `INVOICE_LOCAL_MODE=true` and use the same hostname and port as the original app to find the browser’s saved records.
