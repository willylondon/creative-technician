"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sendContactMessage, type LeadInput } from "@/app/actions/contact";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  CONTACT_EMAIL,
  WHATSAPP_URL,
  budgetOptions,
  serviceOptions,
  timelineOptions,
} from "@/lib/offers";
import { trackEvent } from "@/lib/track";

const EMPTY: LeadInput = {
  name: "",
  organization: "",
  email: "",
  phone: "",
  service: "",
  budget: "",
  timeline: "",
  message: "",
  website: "",
};

/** UTM tags and referrer, so each lead shows which channel brought it in. */
function readSource(): string {
  const params = new URLSearchParams(window.location.search);
  const utm = ["utm_source", "utm_medium", "utm_campaign"]
    .map((key) => params.get(key))
    .filter(Boolean)
    .join(" / ");
  const referrer = document.referrer && !document.referrer.includes(window.location.host)
    ? new URL(document.referrer).hostname
    : "";
  return [utm, referrer && `ref: ${referrer}`].filter(Boolean).join(" · ") || "direct";
}

export default function ContactForm() {
  const [values, setValues] = useState<LeadInput>(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [fallback, setFallback] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // Offer cards link here with data-service (same page) or ?service= (other
  // pages, e.g. case studies), so the right option is preselected.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("service") ?? "";
    // Deferred a frame so it applies after hydration (the server has no URL).
    const frame = requestAnimationFrame(() => {
      if (serviceOptions.some((option) => option.id === fromUrl)) {
        setValues((current) => ({ ...current, service: current.service || fromUrl }));
      }
    });

    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[data-service]");
      if (!link) return;
      const service = link.dataset.service ?? "";
      if (serviceOptions.some((option) => option.id === service)) {
        setValues((current) => ({ ...current, service }));
        trackEvent("offer_cta_click", { service });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
    };
  }, []);

  function update<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("form_start", { form: "contact" });
    }
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");
    setFallback(false);

    let result: Awaited<ReturnType<typeof sendContactMessage>>;
    try {
      result = await sendContactMessage({ ...values, source: readSource() });
    } catch {
      result = {
        success: false,
        fallback: true,
        message: "Network error — please email or WhatsApp me directly.",
      };
    }

    setStatus(result.success ? "success" : "error");
    setFeedback(result.message);
    setFallback(Boolean(result.fallback));

    if (result.success) {
      trackEvent("generate_lead", {
        service: values.service,
        budget: values.budget,
        timeline: values.timeline,
      });
      setValues(EMPTY);
      startedRef.current = false;
    } else {
      trackEvent("form_error", { form: "contact", fallback: Boolean(result.fallback) });
    }
    // Move focus to the announcement so keyboard/screen-reader users hear the outcome.
    requestAnimationFrame(() => feedbackRef.current?.focus());
  }

  function resetForm() {
    setStatus("idle");
    setFeedback("");
  }

  const busy = status === "loading";
  const sent = status === "success";
  const locked = busy || sent;

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="contact-name">Your name</label>
          <input
            id="contact-name"
            type="text"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Farika Atkins"
            autoComplete="name"
            maxLength={100}
            required
            disabled={locked}
          />
        </div>
        <div className="form-field">
          <label htmlFor="contact-org">Organisation <span>(optional)</span></label>
          <input
            id="contact-org"
            type="text"
            value={values.organization}
            onChange={(e) => update("organization", e.target.value)}
            placeholder="Company or school"
            autoComplete="organization"
            maxLength={200}
            disabled={locked}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            spellCheck={false}
            required
            disabled={locked}
          />
        </div>
        <div className="form-field">
          <label htmlFor="contact-phone">WhatsApp / phone <span>(optional)</span></label>
          <input
            id="contact-phone"
            type="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 876 …"
            autoComplete="tel"
            maxLength={25}
            disabled={locked}
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="contact-service">What do you need?</label>
        <select
          id="contact-service"
          value={values.service}
          onChange={(e) => update("service", e.target.value)}
          required
          disabled={locked}
        >
          <option value="" disabled>Choose a service…</option>
          {serviceOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="contact-budget">Budget <span>(optional)</span></label>
          <select
            id="contact-budget"
            value={values.budget}
            onChange={(e) => update("budget", e.target.value)}
            disabled={locked}
          >
            <option value="">Choose if you know…</option>
            {budgetOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="contact-timeline">Timeline <span>(optional)</span></label>
          <select
            id="contact-timeline"
            value={values.timeline}
            onChange={(e) => update("timeline", e.target.value)}
            disabled={locked}
          >
            <option value="">Choose if you know…</option>
            {timelineOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="contact-message">What are you trying to achieve?</label>
        <textarea
          id="contact-message"
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          rows={4}
          placeholder="The problem, who it affects, and what “done” looks like…"
          maxLength={5000}
          required
          disabled={locked}
        />
      </div>

      {/* Honeypot: hidden from people and assistive tech, irresistible to bots. */}
      <div className="form-trap" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      <div aria-live="polite" role="status">
        {feedback && (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            className={`form-feedback ${sent ? "success" : "error"}`}
          >
            {sent ? <CheckCircle aria-hidden="true" /> : <AlertCircle aria-hidden="true" />}
            <span>
              {feedback}
              {fallback && (
                <>
                  {" "}
                  <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Project enquiry")}`}>Email {CONTACT_EMAIL}</a>
                  {" · "}
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {sent ? (
        <button type="button" onClick={resetForm} className="form-submit">
          Send another message
        </button>
      ) : (
        <button type="submit" disabled={busy} className="form-submit">
          {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
          {busy ? "Sending…" : "Send enquiry"}
        </button>
      )}
      <p className="form-note">
        Reply within one business day · No obligation. Your enquiry is processed by
        our email and workflow providers so we can respond. <Link href="/privacy">Privacy policy</Link>.
      </p>
    </form>
  );
}
