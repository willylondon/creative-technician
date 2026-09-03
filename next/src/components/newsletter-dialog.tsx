"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, AlertCircle, Loader2, Sparkles } from "lucide-react";
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
import { subscribeToNewsletter } from "@/app/actions/brevo";

interface NewsletterDialogProps {
  children?: React.ReactNode;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerVariant?: "default" | "primary" | "outline" | "secondary" | "ghost" | "link";
}

export function NewsletterDialog({
  children,
  triggerLabel = "Newsletter",
  triggerClassName,
  triggerVariant = "outline",
}: NewsletterDialogProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const result = await subscribeToNewsletter(email);
      setStatus(result.success ? "success" : "error");
      setMessage(result.message);

      if (result.success) {
        setEmail("");
        setTimeout(() => {
          setOpen(false);
          setStatus("idle");
          setMessage("");
        }, 2200);
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset status when modal closes
      setStatus("idle");
      setMessage("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant={triggerVariant} className={triggerClassName}>
            <Mail className="mr-2 size-4" aria-hidden="true" />
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(234,240,235,0.18)] bg-[#121b18] text-[#72e8ef] shadow-inner"
            aria-hidden="true"
          >
            <Sparkles size={22} strokeWidth={2} />
          </div>

          <DialogHeader>
            <DialogTitle>The Creative Technician Dispatch</DialogTitle>
            <DialogDescription>
              Practical automations, systems architecture, and field notes delivered straight to your inbox. No fluff, no spam.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="newsletter-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                spellCheck={false}
                autoComplete="email"
                disabled={status === "loading" || status === "success"}
                className="pl-10 text-sm"
                aria-label="Email address"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#74807a]">
                <Mail size={16} aria-hidden="true" />
              </div>
            </div>
          </div>

          {status !== "idle" && message && (
            <div
              role="status"
              aria-live="polite"
              className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-relaxed ${
                status === "success"
                  ? "border-[#075431] bg-[#075431]/20 text-[#3cdf8f]"
                  : "border-[#7e1b1b] bg-[#7e1b1b]/20 text-[#f87171]"
              }`}
            >
              {status === "success" ? (
                <CheckCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              )}
              <span>{message}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full text-sm font-semibold tracking-wide"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Subscribing…
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle className="mr-2 size-4" aria-hidden="true" />
                Subscribed!
              </>
            ) : (
              "Subscribe to Dispatch"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-[#74807a]">
          By subscribing, you agree to the{" "}
          <Link
            href="/privacy"
            onClick={() => setOpen(false)}
            className="underline underline-offset-2 hover:text-[#72e8ef]"
          >
            Privacy Policy
          </Link>
          . Unsubscribe anytime with one click.
        </p>
      </DialogContent>
    </Dialog>
  );
}
