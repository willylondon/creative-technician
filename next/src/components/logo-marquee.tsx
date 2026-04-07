"use client";

import React from "react";

const logos = [
  "JAMAICA BASKETBALL",
  "JPS WORKSHOPS",
  "THE SOURCE ARENA",
  "LIFESTYLE HIKERS",
  "HILLEL ACADEMY",
];

export function LogoMarquee() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden border-y border-white/5 bg-black/20 py-8 backdrop-blur-sm">
      <div className="group flex overflow-hidden p-2 [--gap:3rem] [gap:var(--gap)] flex-row [--duration:30s]">
        <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
          {[...Array(4)].map((_, setIndex) => (
            <React.Fragment key={setIndex}>
              {logos.map((logo, i) => (
                <span
                  key={`${setIndex}-${i}`}
                  className="text-sm font-semibold tracking-[0.2em] text-white/40 transition hover:text-white/80 sm:text-lg"
                >
                  {logo}
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
    </div>
  );
}
