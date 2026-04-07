# Newsletter Implementation Guide

## Overview
Implement a newsletter subscription feature using Brevo (formerly Sendinblue) API with a React/Next.js dialog component.

---

## Prerequisites

- Next.js project with TypeScript
- Tailwind CSS installed
- shadcn/ui or similar component library
- Brevo account (free tier: 300 emails/day)

---

## Step 1: Install Dependencies

```bash
npm install @radix-ui/react-dialog @radix-ui/react-icons @radix-ui/react-slot lucide-react
```

---

## Step 2: Create Environment Variables

Create `.env.local` in the project root:

```env
BREVO_API_KEY=your_brevo_api_key_here
BREVO_LIST_ID=your_list_id_number
```

**To get these values:**
1. Sign up at https://www.brevo.com/
2. Go to Settings → API Keys → Create new key
3. Go to Contacts → Lists → Create list → Note the ID from URL (e.g., `/id/2`)

---

## Step 3: Create Server Action

Create `src/app/actions/brevo.ts`:

```typescript
"use server";

interface SubscribeResult {
  success: boolean;
  message: string;
}

export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    return { success: false, message: "Newsletter service is not configured." };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email: email,
        listIds: [parseInt(process.env.BREVO_LIST_ID || "1")],
        updateEnabled: true,
      }),
    });

    if (response.ok) {
      return { success: true, message: "Thanks for subscribing! Check your inbox." };
    }

    const error = await response.json();
    
    if (error.code === "duplicate_parameter") {
      return { success: true, message: "You're already subscribed!" };
    }

    return { success: false, message: error.message || "Something went wrong. Please try again." };
  } catch (error) {
    return { success: false, message: "Network error. Please try again later." };
  }
}
```

---

## Step 4: Create UI Components

### Button Component (`src/components/ui/button.tsx`)

```typescript
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm shadow-black/5 hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-black/5 hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm shadow-black/5 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm shadow-black/5 hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### Input Component (`src/components/ui/input.tsx`)

```typescript
import { cn } from "@/lib/utils";
import * as React from "react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
          type === "search" &&
            "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
          type === "file" &&
            "p-0 pr-3 italic text-muted-foreground/70 file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-input file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic file:text-foreground",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
```

### Dialog Component (`src/components/ui/dialog.tsx`)

```typescript
"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[101] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-[101] grid max-h-[calc(100%-4rem)] w-full -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto border bg-background p-6 shadow-lg shadow-black/5 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:max-w-[400px] sm:rounded-xl",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="group absolute right-3 top-3 flex size-7 items-center justify-center rounded-lg outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none">
        <Cross2Icon
          width={16}
          height={16}
          strokeWidth={2}
          className="opacity-60 transition-opacity group-hover:opacity-100"
        />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
```

---

## Step 5: Create Newsletter Dialog Component

Create `src/components/newsletter-dialog.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/brevo";

export function NewsletterDialog() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const result = await subscribeToNewsletter(email);
    
    setStatus(result.success ? "success" : "error");
    setMessage(result.message);

    if (result.success) {
      setEmail("");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setMessage("");
      }, 2000);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Newsletter</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="mb-2 flex flex-col items-center gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
            aria-hidden="true"
          >
            <svg
              className="stroke-zinc-800 dark:stroke-zinc-100"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
            </svg>
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">Never miss an update</DialogTitle>
            <DialogDescription className="sm:text-center">
              Subscribe to receive news and special offers.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="dialog-subscribe"
                className="peer ps-9"
                placeholder="hi@yourcompany.com"
                type="email"
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading" || status === "success"}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Mail size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
          </div>

          {status !== "idle" && message && (
            <div className={`flex items-center gap-2 text-sm ${status === "success" ? "text-green-500" : "text-red-500"}`}>
              {status === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {message}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? "Subscribing..." : status === "success" ? "Subscribed!" : "Subscribe"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          By subscribing you agree to our{" "}
          <a className="underline hover:no-underline" href="/privacy-policy">
            Privacy Policy
          </a>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Step 6: Add to Page

Import and add the component to your page (e.g., `src/app/page.tsx`):

```typescript
import { NewsletterDialog } from "@/components/newsletter-dialog";

// In your JSX, add where you want it to appear:
<NewsletterDialog />
```

**Recommended placement:** In the header/navigation area or near the footer as a CTA.

---

## Step 7: Deployment Configuration

### For Vercel:
1. Go to Project Settings → Environment Variables
2. Add:
   - `BREVO_API_KEY` = your_api_key
   - `BREVO_LIST_ID` = your_list_id

### For Netlify:
1. Go to Site Settings → Environment Variables
2. Add the same variables

### For other platforms:
Add environment variables in the platform's dashboard or deployment configuration.

---

## Testing

1. Run locally: `npm run dev`
2. Open http://localhost:3000
3. Click "Newsletter" button
4. Enter an email and submit
5. Check Brevo dashboard → Contacts to verify the email was added

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Newsletter service is not configured" | Check `.env.local` exists and has correct values |
| "Invalid API key" | Regenerate API key in Brevo settings |
| Emails not appearing in list | Verify `BREVO_LIST_ID` matches the list URL ID |
| CORS errors | Ensure server action is marked with `"use server"` |

---

## Security Notes

- Never commit `.env.local` to git (should be in `.gitignore`)
- Use Brevo's double opt-in feature for production
- Consider rate limiting the API endpoint
- Add honeypot field to prevent bot submissions
