"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface UserLike {
  email?: string | null;
  displayName?: string | null;
}

interface HeroProps {
  user?: UserLike | null;
}

const PRESETS = [
  {
    id: "inbound",
    label: "Sales Inbound",
    icon: "💼",
    raw: "Hey team, this is Sarah Jenkins, VP of Ops at CloudScale. Call me at +1 (415) 892-3410 or email sarah.j@cloudscale.io. We have a $45,000 budget for Q3 expansion. Urgency is high.",
    extracted: {
      name: "Sarah Jenkins",
      role: "VP of Operations",
      company: "CloudScale Inc.",
      email: "sarah.j@cloudscale.io",
      phone: "+1 (415) 892-3410",
      budget: "$45,000",
      intent: "High Intent",
      tags: ["Enterprise", "Q3 Deal", "Expansion"],
      stage: "Qualified Lead",
      initials: "SJ",
      avatarBg: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    },
  },
  {
    id: "whatsapp",
    label: "WhatsApp Dump",
    icon: "💬",
    raw: "Yo Tariq here from Nexus Logistics (+92 300 4567890). We need around 120 team accounts for our dispatch hub ASAP. Shoot quotation to tariq@nexuslog.co by Thursday.",
    extracted: {
      name: "Tariq Mansoor",
      role: "Logistics Director",
      company: "Nexus Logistics",
      email: "tariq@nexuslog.co",
      phone: "+92 300 4567890",
      budget: "120 Seats ($14.4k)",
      sentiment: "Urgent Lead",
      tags: ["Logistics", "Volume Deal", "Inbound"],
      stage: "Proposal Prep",
      initials: "TM",
      avatarBg: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    },
  },
  {
    id: "signature",
    label: "Email Signature",
    icon: "✉️",
    raw: "Dr. Elena Rostova | Chief Innovation Officer | BioNova Genomics | London, UK | elena.rostova@bionova.org | Direct: +44 20 7946 0912 | Meeting booked for next Tuesday.",
    extracted: {
      name: "Dr. Elena Rostova",
      role: "Chief Innovation Officer",
      company: "BioNova Genomics",
      email: "elena.rostova@bionova.org",
      phone: "+44 20 7946 0912",
      budget: "Enterprise Tier",
      sentiment: "Partnership",
      tags: ["Biotech", "Executive", "London"],
      stage: "Meeting Scheduled",
      initials: "ER",
      avatarBg: "bg-amber-100 text-amber-800 border border-amber-200",
    },
  },
];

export default function Hero({ user }: HeroProps) {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const activePreset = PRESETS[activePresetIndex];

  const handleSelectPreset = (index: number) => {
    if (index === activePresetIndex) return;
    setActivePresetIndex(index);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
      {/* Subtle crisp grid background */}
      <div className="absolute inset-0 subtle-canvas-grid opacity-35 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* ─── LEFT COLUMN: Value Proposition ─── */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            
            {/* Clean Status Pill (No loud neon glow) */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                AI Contact Ingestion & CRM
              </span>
              <span className="text-[11px] text-slate-400 font-mono">v3.4</span>
            </div>

            {/* Headline - Solid Crisp Slate-900 (No tacky gradient text) */}
            <h1
              className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-[-0.035em] text-slate-900 leading-[1.08] mb-6"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Turn messy contact notes into verified client deals.
            </h1>

            {/* Subtitle - Balanced readable slate-600 */}
            <p
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Stop wasting hours manually re-typing client information. Paste any raw email signature,
              WhatsApp dump, or meeting memo. MYP (Manage Your Priorities) extracts clean contact fields, organizes your
              Kanban pipeline, and schedules follow-ups in seconds.
            </p>

            {/* CTA Cluster - Solid, authoritative button styles */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <Link
                href={user ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm active:scale-[0.99] transition-all text-sm"
                style={{ fontFamily: "var(--font-label)" }}
              >
                <span>{user ? "Open Dashboard" : "Start Free Trial"}</span>
                <span>→</span>
              </Link>

              <a
                href="#live-playground"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-all text-sm"
                style={{ fontFamily: "var(--font-label)" }}
              >
                <span>Try Live Sandbox</span>
              </a>
            </div>

            {/* Assurances */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 border-t border-slate-200 pt-6 w-full">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Instant Supabase sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Sub-100ms inference</span>
              </div>
            </div>

          </div>

          {/* ─── RIGHT COLUMN: Clean Light-Themed Interactive Studio ─── */}
          <div className="lg:col-span-6 w-full">
            <div className="light-card-elevated rounded-2xl p-5 sm:p-7 bg-white">
              
              {/* Studio Window Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                  <span className="ml-2 text-xs font-semibold text-slate-700 font-mono">
                    realtime_parser.ts
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  LIVE DEMO
                </span>
              </div>

              {/* Scenario Preset Selector Tabs */}
              <div className="mb-4">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2 font-mono flex items-center justify-between">
                  <span>Input Scenario:</span>
                  <span className="text-indigo-600 lowercase font-medium">click to test</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((preset, idx) => {
                    const isSelected = activePresetIndex === idx;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(idx)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <span>{preset.icon}</span>
                        <span className="truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Top: Raw Input Box */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">RAW INPUT STRING</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    UNSTRUCTURED
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 font-mono leading-relaxed min-h-[58px]">
                  {activePreset.raw}
                </div>
              </div>

              {/* Status Bridge */}
              <div className="flex items-center justify-center gap-3 py-1 mb-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ⚡ EXTRACTED IN 42ms · 99.8% PRECISION
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Bottom: Verified Structured Contact Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePreset.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${activePreset.extracted.avatarBg} flex items-center justify-center font-bold text-sm shadow-xs`}>
                        {activePreset.extracted.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
                            {activePreset.extracted.name}
                          </h4>
                          <span className="text-blue-600 text-xs font-bold" title="Verified extraction">✓</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {activePreset.extracted.role} · <span className="font-semibold text-slate-800">{activePreset.extracted.company}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                        {activePreset.extracted.stage}
                      </span>
                    </div>
                  </div>

                  {/* Contact Fields Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3.5">
                    {/* Email */}
                    <div
                      onClick={() => copyToClipboard(activePreset.extracted.email, "email")}
                      className="group flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-slate-400 text-xs">✉</span>
                        <span className="text-xs text-slate-800 truncate font-mono">{activePreset.extracted.email}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-700 shrink-0 font-mono">
                        {copiedField === "email" ? "Copied!" : "copy"}
                      </span>
                    </div>

                    {/* Phone */}
                    <div
                      onClick={() => copyToClipboard(activePreset.extracted.phone, "phone")}
                      className="group flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-slate-400 text-xs">📞</span>
                        <span className="text-xs text-slate-800 truncate font-mono">{activePreset.extracted.phone}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-700 shrink-0 font-mono">
                        {copiedField === "phone" ? "Copied!" : "copy"}
                      </span>
                    </div>
                  </div>

                  {/* Tags & Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Tags:</span>
                      {activePreset.extracted.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {activePreset.extracted.budget}
                      </span>
                      <Link
                        href={user ? "/contacts" : "/register"}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs inline-flex items-center gap-1"
                      >
                        Push to CRM →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>
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
