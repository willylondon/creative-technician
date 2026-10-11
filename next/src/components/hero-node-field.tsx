"use client";

import { useEffect, useRef } from "react";

/**
 * HeroNodeField — ambient n8n-style node graph for the homepage hero.
 * Sits absolutely inside .hero-section, behind the copy. A slow execution
 * loop pulses through the nodes continuously (no scroll coupling).
 *
 * three.js is loaded on demand and only on wide screens with a fine pointer:
 * on phones the graph sits behind the stacked copy, so it would cost battery
 * and ~150 KB of JavaScript for no visible benefit. Disabled for reduced motion.
 */
export default function HeroNodeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest(".hero-section") as HTMLElement | null;
    if (!canvas || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 901px) and (pointer: fine)").matches) return;

    let dispose: (() => void) | undefined;
    let cancelled = false;
    import("./hero-node-field-scene").then(({ mountNodeField }) => {
      if (!cancelled) dispose = mountNodeField(canvas, section);
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-node-field" aria-hidden="true" />;
}
