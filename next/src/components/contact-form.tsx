"use client";

import { useRef, useState } from "react";
import { sendContactMessage } from "@/app/actions/contact";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const feedbackRef = useRef<HTMLDivElement>(null);

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
    } else {
      // Move focus to the announcement so keyboard/screen-reader users land on the error.
      requestAnimationFrame(() => feedbackRef.current?.focus());
    }
  }

  function resetForm() {
    setStatus("idle");
    setFeedback("");
  }

  const busy = status === "loading";
  const sent = status === "success";

  return (
    <form
      onSubmit={handleSubmit}
      className="contact-form"
    >
      <div className="form-field">
        <label htmlFor="contact-name">
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
          disabled={busy || sent}
        />
      </div>

      <div className="form-field">
        <label htmlFor="contact-email">
          Email Address
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          spellCheck={false}
          required
          disabled={busy || sent}
        />
      </div>

      <div className="form-field">
        <label htmlFor="contact-message">
          Project details or inquiry
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Tell me about what you need…"
          required
          disabled={busy || sent}
        />
      </div>

      <div aria-live="polite" role="status">
        {feedback && (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            className={`form-feedback ${status === "success" ? "success" : "error"}`}
          >
            {status === "success" ? (
              <CheckCircle aria-hidden="true" />
            ) : (
              <AlertCircle aria-hidden="true" />
            )}
            {feedback}
          </div>
        )}
      </div>

      {sent ? (
        <button type="button" onClick={resetForm} className="form-submit">
          Send Another Message
        </button>
      ) : (
        <button type="submit" disabled={busy} className="form-submit">
          {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
          {busy ? "Sending…" : "Send Message"}
        </button>
      )}
    </form>
  );
}
