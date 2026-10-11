"use client";

import { useEffect, useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/offers";
import TrackedLink from "@/components/tracked-link";

/**
 * Sticky call-to-action bar for small screens. It appears once the visitor has
 * scrolled past the hero and hides while the contact section is on screen.
 */
export default function MobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const contact = document.getElementById("contact");
    let pastHero = false;
    let contactInView = false;
    const sync = () => setVisible(pastHero && !contactInView);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) pastHero = !entry.isIntersecting;
        if (entry.target === contact) contactInView = entry.isIntersecting;
      });
      sync();
    });
    if (hero) observer.observe(hero);
    if (contact) observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`mobile-cta${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <a href="#contact" tabIndex={visible ? 0 : -1}>
        Start a project <Mail aria-hidden="true" />
      </a>
      <TrackedLink
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        event="whatsapp_click"
        eventParams={{ location: "mobile_bar" }}
        aria-label="Chat on WhatsApp"
        tabIndex={visible ? 0 : -1}
      >
        <MessageCircle aria-hidden="true" />
      </TrackedLink>
    </div>
  );
}
