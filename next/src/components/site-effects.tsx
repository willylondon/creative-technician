"use client";

import { useEffect } from "react";

export default function SiteEffects() {
  useEffect(() => {
    const revealNodes = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal")
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    revealNodes.forEach((node) => observer.observe(node));

    if (!window.matchMedia("(pointer: fine)").matches) {
      return () => observer.disconnect();
    }

    const dot = document.querySelector<HTMLElement>(".cursor-dot");
    const outline = document.querySelector<HTMLElement>(".cursor-outline");

    if (!dot || !outline) {
      return () => observer.disconnect();
    }

    const move = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      dot.style.left = `${clientX}px`;
      dot.style.top = `${clientY}px`;
      outline.animate(
        { left: `${clientX}px`, top: `${clientY}px` },
        { duration: 420, fill: "forwards" }
      );
    };

    const hoverables = document.querySelectorAll<HTMLElement>(".data-hover");
    const onEnter = () => document.body.classList.add("hovering");
    const onLeave = () => document.body.classList.remove("hovering");

    window.addEventListener("mousemove", move);
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", move);
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />
      <CourtLines />
      <div className="cursor-dot" aria-hidden="true" />
      <div className="cursor-outline" aria-hidden="true" />
    </>
  );
}

function CourtLines() {
  return (
    <div className="court-lines pointer-events-none absolute inset-[-10%] z-0 opacity-[0.15] [mask-image:radial-gradient(circle_at_50%_50%,black,transparent_70%)]">
      <svg width="100%" height="100%" viewBox="0 0 1200 800" fill="none">
        <rect
          x="120"
          y="90"
          width="960"
          height="620"
          rx="40"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        <circle
          cx="600"
          cy="400"
          r="80"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        <path
          d="M290 310c60 0 110 40 110 90s-50 90-110 90"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        <path
          d="M910 310c-60 0-110 40-110 90s50 90 110 90"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
