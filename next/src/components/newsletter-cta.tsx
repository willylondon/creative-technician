"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/app/actions/brevo";

interface NewsletterCTAProps {
  className?: string;
  title?: string;
  description?: string;
}

export default function NewsletterCTA({
  className = "",
  title = "The Creative Technician Dispatch",
  description = "Field notes on AI, automation pipelines, and infrastructure built for real-world operations. Delivered periodically.",
}: NewsletterCTAProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again later.");
    }
  }

  return (
    <aside
      aria-label="Newsletter Subscription"
      className={`relative my-10 overflow-hidden rounded-2xl border border-[rgba(234,240,235,0.16)] bg-gradient-to-b from-[#0e1513] to-[#0a0f0e] p-6 sm:p-8 shadow-xl ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#72e8ef] uppercase">
            <Sparkles size={14} aria-hidden="true" />
            <span>Field Dispatch</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#eaf0eb]">
            {title}
          </h3>
          <p className="text-sm text-[#a8b4ad] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="w-full md:max-w-md">
          {status === "success" ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#075431] bg-[#075431]/20 p-4 text-sm text-[#3cdf8f]">
              <CheckCircle size={20} className="shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">{message}</p>
                <p className="text-xs text-[#a8b4ad] mt-0.5">
                  Keep an eye out for upcoming dispatches.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    spellCheck={false}
                    autoComplete="email"
                    disabled={status === "loading"}
                    className="pl-10 text-sm h-11"
                    aria-label="Your email address"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#74807a]">
                    <Mail size={16} aria-hidden="true" />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="h-11 px-6 font-semibold shrink-0 cursor-pointer"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                      Joining…
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </div>

              {status === "error" && message && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2 text-xs text-[#f87171]"
                >
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{message}</span>
                </div>
              )}

              <p className="text-xs text-[#74807a]">
                Zero spam. Read our{" "}
                <Link href="/privacy" className="underline hover:text-[#72e8ef]">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
}
