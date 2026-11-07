"use client";

import React from "react";
import Link from "next/link";
import HeroPipelineAnimation from "./hero/HeroPipelineAnimation";

interface UserLike {
  email?: string | null;
  displayName?: string | null;
}

interface HeroProps {
  user?: UserLike | null;
}

export default function Hero({ user }: HeroProps) {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
      {/* Subtle crisp grid background */}
      <div className="absolute inset-0 subtle-canvas-grid opacity-35 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* ─── LEFT COLUMN: Value Proposition ─── */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            
            {/* Clean Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-semibold tracking-wide uppercase font-mono">
                MYP Neural Pipeline · v2.4 Active
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08] mb-6"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Everything you juggle,{" "}
              <span className="text-slate-900 underline decoration-indigo-500 decoration-wavy decoration-2">
                MYP manages.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Stop wasting hours manually re-typing client records. Paste any raw WhatsApp inquiry,
              email signature, or meeting memo. MYP (Manage Your Priorities) automatically funnels messy inputs
              into organized lead pipelines, milestone trackers, and schedules.
            </p>

            {/* CTA Cluster */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <Link
                href={user ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm active:scale-[0.99] transition-all text-sm cursor-pointer"
                style={{ fontFamily: "var(--font-label)" }}
              >
                <span>{user ? "Open Dashboard" : "Start Free with MYP"}</span>
                <span>→</span>
              </Link>

              <a
                href="#live-playground"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-all text-sm cursor-pointer"
                style={{ fontFamily: "var(--font-label)" }}
              >
                <span>Try Live Sandbox</span>
              </a>
            </div>

            {/* Assurances */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 border-t border-slate-200 pt-6 w-full">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Zero manual entry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Real-time Kanban & Calendar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Strict multi-user isolation</span>
              </div>
            </div>

          </div>

          {/* ─── RIGHT COLUMN: Animated Illustration (From Chaos to Pipeline) ─── */}
          <div className="lg:col-span-6 w-full flex items-center justify-center">
            <HeroPipelineAnimation />
          </div>

        </div>

        {/* ─── METRIC STAT STRIP BELOW HERO ─── */}
        <div className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="p-4 text-center border-r border-slate-100 last:border-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">99.8%</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Field Extraction Precision</div>
          </div>
          <div className="p-4 text-center lg:border-r border-slate-100">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono">&lt; 85ms</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Neural Parse Latency</div>
          </div>
          <div className="p-4 text-center border-r border-slate-100">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">500,000+</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Contacts Managed</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">0 Manual</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Data Entry Required</div>
          </div>
        </div>

      </div>
    </section>
  );
}
