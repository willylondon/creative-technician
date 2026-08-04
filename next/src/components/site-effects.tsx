"use client";

import { useEffect } from "react";
import gsap from "gsap";

export default function SiteEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const cleanup: Array<() => void> = [];

    if (!reduceMotion) {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .fromTo(
          '[data-motion="hero-copy"] > *',
          { y: 26 },
          { y: 0, duration: 0.82, stagger: 0.09, clearProps: "transform" },
        )
        .fromTo(
          '[data-motion="hero-visual"]',
          { x: 24 },
          { x: 0, duration: 0.9, clearProps: "transform" },
          0.12,
        );

      const tape = gsap.to(".signal-tape-track", {
        xPercent: -50,
        duration: 24,
        ease: "none",
        repeat: -1,
      });

      const scan = gsap.to(".portrait-panel", {
        "--scan-y": "78%",
        duration: 3.1,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      const revealNodes = Array.from(document.querySelectorAll<HTMLElement>('[data-motion="section"], [data-motion="project"]'));
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            gsap.fromTo(
              entry.target,
              { y: 30 },
              { y: 0, duration: 0.72, ease: "power2.out", clearProps: "transform" },
            );
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
      );
      revealNodes.forEach((node) => observer.observe(node));

      cleanup.push(() => {
        intro.kill();
        tape.kill();
        scan.kill();
        observer.disconnect();
      });
    }

    if (finePointer) {
      const dot = document.querySelector<HTMLElement>(".cursor-dot");
      const outline = document.querySelector<HTMLElement>(".cursor-outline");
      const hero = document.querySelector<HTMLElement>(".hero-section");

      if (dot && outline) {
        const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "none" });
        const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "none" });
        const ringX = gsap.quickTo(outline, "x", { duration: 0.34, ease: "power3.out" });
        const ringY = gsap.quickTo(outline, "y", { duration: 0.34, ease: "power3.out" });

        const move = (event: MouseEvent) => {
          dotX(event.clientX - 3);
          dotY(event.clientY - 3);
          ringX(event.clientX - 17);
          ringY(event.clientY - 17);

          if (hero) {
            const bounds = hero.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width) * 100;
            const y = ((event.clientY - bounds.top) / bounds.height) * 100;
            hero.style.setProperty("--spot-x", `${Math.max(0, Math.min(100, x))}%`);
            hero.style.setProperty("--spot-y", `${Math.max(0, Math.min(100, y))}%`);
          }
        };

        window.addEventListener("mousemove", move, { passive: true });
        cleanup.push(() => window.removeEventListener("mousemove", move));
      }

      const hoverables = Array.from(document.querySelectorAll<HTMLElement>(".data-hover"));
      const onEnter = () => document.body.classList.add("hovering");
      const onLeave = () => document.body.classList.remove("hovering");
      hoverables.forEach((element) => {
        element.addEventListener("mouseenter", onEnter);
        element.addEventListener("mouseleave", onLeave);
      });
      cleanup.push(() => hoverables.forEach((element) => {
        element.removeEventListener("mouseenter", onEnter);
        element.removeEventListener("mouseleave", onLeave);
      }));
    }

    return () => cleanup.forEach((dispose) => dispose());
  }, []);

  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />
      <div className="cursor-dot" aria-hidden="true" />
      <div className="cursor-outline" aria-hidden="true" />
    </>
  );
}
