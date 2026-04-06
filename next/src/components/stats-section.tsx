"use client";

import React from "react";
import { cn } from "@/lib/utils";

const stats = [
  {
    value: "20+ yrs",
    label: "IT systems experience",
  },
  {
    value: "50k+",
    label: "Audience across platforms",
  },
  {
    value: "5–15 hrs",
    label: "Saved weekly via automation",
  },
  {
    value: "2–5 days",
    label: "Typical delivery window",
  },
];

export function StatsSection() {
  return (
    <section className="border-y border-white/5 bg-black/40 py-20 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 text-center"
            >
              <div className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
                {stat.value}
              </div>
              <div className="text-sm font-medium uppercase tracking-[0.1em] text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
