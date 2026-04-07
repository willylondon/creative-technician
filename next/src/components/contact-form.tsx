"use client";

import { useState } from "react";
import { sendContactMessage } from "@/app/actions/contact";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    const result = await sendContactMessage(name, email, message);

    setStatus(result.success ? "success" : "error");
    setFeedback(result.message);

    if (result.success) {
      setName("");
      setEmail("");
      setMessage("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="neo-card reveal space-y-4 rounded-2xl p-6"
      style={{ transitionDelay: "150ms" }}
    >
      <div>
        <label htmlFor="contact-name" className="block text-xs text-slate-400 mb-1.5">
          Name / Organization
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Farika Atkins / Hillel Academy"
          autoComplete="name"
          required
          disabled={status === "loading" || status === "success"}
          className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 transition disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-xs text-slate-400 mb-1.5">
          Email Address
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          required
          disabled={status === "loading" || status === "success"}
          className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 transition disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs text-slate-400 mb-1.5">
          Project details or inquiry
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Tell me about what you need…"
          required
          disabled={status === "loading" || status === "success"}
          className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 transition disabled:opacity-50"
        />
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
            status === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {status === "success" ? (
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          {feedback}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "loading"
          ? "Sending…"
          : status === "success"
          ? "Message Sent ✓"
          : "Send Message"}
      </button>
    </form>
  );
}
