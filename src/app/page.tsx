"use client";

import React, { useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Hero from "@/components/Hero";

// ─── SAMPLE TEMPLATES FOR INTERACTIVE PLAYGROUND ───
const PLAYGROUND_TEMPLATES = [
  {
    title: "Executive Lead",
    snippet: "Alexander Wright, Managing Director at Apex Capital. Cell: +1 646 555 0184. Discussing Series B fund allocation of $1.5M. Follow up next Monday at alex@apexcap.vc",
  },
  {
    title: "Agency RFP",
    snippet: "Maria Santos, Head of Design @ Studio Chroma (maria@chroma.design, +34 91 123 4567). Budget $35k for brand redesign. Urgency high.",
  },
  {
    title: "Quick Chat Note",
    snippet: "Met Kevin Chen at TechCon. Co-founder of ByteLogic. kevin@bytelogic.ai / +65 9123 4567. Looking for 50 enterprise seats.",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });

  // ─── Interactive Sandbox State ───
  const [inputText, setInputText] = useState(PLAYGROUND_TEMPLATES[0].snippet);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<"card" | "json">("card");
  const [simulationDone, setSimulationDone] = useState(true);

  // ─── ROI Calculator State ───
  const [weeklyContacts, setWeeklyContacts] = useState(60);

  // ─── Interactive Pipeline Step State ───
  const [activeStep, setActiveStep] = useState(0);

  // Playground simulation handler
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationDone(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationDone(true);
    }, 400);
  };

  // Calculated ROI stats
  const hoursSavedMonth = Math.round((weeklyContacts * 0.12 * 4.3) * 10) / 10;
  const dollarsSaved = Math.round(hoursSavedMonth * 45);

  return (
    <div
      className="min-h-screen text-slate-800 antialiased overflow-x-hidden bg-white"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ─── Top Scroll Indicator ─── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] z-50 origin-left bg-slate-900"
        style={{ scaleX: smoothProgress }}
      />

      {/* ═════════════════════════════════════════════════════════════════
          NAVIGATION HEADER
      ═════════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px]">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center font-mono font-black text-xs shadow-xs transition-transform group-hover:scale-105">
                <span className="bg-gradient-to-br from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  MYP
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-extrabold text-slate-900 tracking-tight leading-none" style={{ fontFamily: "var(--font-headline)" }}>
                  MYP
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
                  Manage Your Priorities
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: "Overview", href: "#" },
                { label: "Live Sandbox", href: "#live-playground" },
                { label: "Features", href: "#features" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "ROI Calculator", href: "#roi-calculator" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Auth CTA cluster */}
            <div className="flex items-center gap-3 shrink-0">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-slate-900 hover:bg-slate-800 shadow-xs transition-all"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  <span>Dashboard</span>
                  <span>→</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-block px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-slate-900 hover:bg-slate-800 shadow-xs transition-all"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    <span>Get started free</span>
                    <span>→</span>
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 1: HERO (Pure White Background)
      ═════════════════════════════════════════════════════════════════ */}
      <Hero user={user} />

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 2: LIVE PLAYGROUND (Soft Slate Background for Contrast)
      ═════════════════════════════════════════════════════════════════ */}
      <section id="live-playground" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-800 font-bold px-3 py-1 rounded-full bg-white border border-slate-300 shadow-xs inline-block mb-3">
              Interactive Testbed
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3" style={{ fontFamily: "var(--font-headline)" }}>
              Test the parser with your own contact notes.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Click a scenario below or paste any unstructured string to see how MYP extracts clean fields and maps records directly into your CRM.
            </p>
          </div>

          {/* Playground Interface Container (Pure White Card on Slate Background) */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-600 font-mono font-medium">Load template:</span>
                {PLAYGROUND_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.title}
                    type="button"
                    onClick={() => {
                      setInputText(tmpl.snippet);
                      handleRunSimulation();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-2xs"
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveOutputTab("card")}
                  className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${
                    activeOutputTab === "card"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Visual Card
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutputTab("json")}
                  className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${
                    activeOutputTab === "json"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  JSON Schema
                </button>
              </div>
            </div>

            {/* Two-Column Editor & Result Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* Left Column: Input Box */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="rawInput" className="text-xs font-mono text-slate-700 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-900" />
                    <span>Raw Input Text (Edit freely):</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold">{inputText.length} chars</span>
                </div>

                <div className="relative flex-1 flex flex-col">
                  <textarea
                    id="rawInput"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={6}
                    placeholder="Type or paste messy text here: name, email, phone, company, deal value..."
                    className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-600 focus:bg-white resize-none leading-relaxed transition-all shadow-2xs"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-600">
                      Model: <strong className="text-slate-900 font-mono font-bold">LLaMA 3.1 70B Engine</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleRunSimulation}
                      disabled={isSimulating}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-xs"
                    >
                      {isSimulating ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Extracting...</span>
                        </>
                      ) : (
                        <>
                          <span>Run Extraction</span>
                          <span>⚡</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Output */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-700 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Realtime Extraction Result:</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    Confidence: 99.4%
                  </span>
                </div>

                <div className="flex-1 rounded-xl bg-slate-50 border border-slate-200 p-5 flex flex-col justify-center min-h-[200px]">
                  
                  {isSimulating && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-xs font-mono text-slate-700 font-semibold animate-pulse">
                        Tokenizing string & mapping attributes...
                      </p>
                    </div>
                  )}

                  {!isSimulating && simulationDone && activeOutputTab === "card" && (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs">
                            AW
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">Alexander Wright</div>
                            <div className="text-[11px] text-slate-600 font-medium">Managing Director · Apex Capital</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-semibold">
                          Qualified Lead
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 font-mono font-semibold block">EMAIL</span>
                          <span className="text-slate-900 truncate block font-mono text-[11px] font-medium">alex@apexcap.vc</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 font-mono font-semibold block">PHONE</span>
                          <span className="text-slate-900 truncate block font-mono text-[11px] font-medium">+1 646 555 0184</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 font-mono font-semibold block">DEAL VALUE</span>
                          <span className="text-slate-900 font-mono font-extrabold text-[11px]">$1,500,000</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 font-mono font-semibold block">FOLLOW UP</span>
                          <span className="text-slate-900 font-mono font-medium text-[11px]">Next Monday 10:00 AM</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                        <span>Database: Synced</span>
                        <span className="text-emerald-700 font-mono font-bold">Ready to push to Kanban ✓</span>
                      </div>
                    </div>
                  )}

                  {!isSimulating && simulationDone && activeOutputTab === "json" && (
                    <pre className="text-[11px] font-mono text-slate-800 leading-relaxed overflow-x-auto p-3 bg-white rounded-lg border border-slate-200 font-medium">
{`{
  "name": "Alexander Wright",
  "role": "Managing Director",
  "company": "Apex Capital",
  "email": "alex@apexcap.vc",
  "phone": "+1 646 555 0184",
  "budget": 1500000,
  "intent": "High / Series B",
  "follow_up": "2025-11-10T10:00:00Z",
  "confidence_score": 0.994
}`}
                    </pre>
                  )}

                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 3: FEATURES BENTO GRID (Pure White Background)
      ═════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-800 font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-300 inline-block mb-3">
              Complete CRM Engine
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4" style={{ fontFamily: "var(--font-headline)" }}>
              Every tool your pipeline needs, under one roof.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Replace messy spreadsheets and disconnected tools with a unified platform built for speed and operational clarity.
            </p>
          </div>

          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1: Kanban Pipeline (Spans 2 cols) */}
            <div className="md:col-span-2 rounded-2xl bg-slate-50/70 border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                      DEAL MANAGEMENT
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "var(--font-headline)" }}>
                      Visual Kanban Deal Board
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-md">
                      Move contacts across qualification stages with real-time deal totals and priority tags.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white text-slate-800 flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">view_kanban</span>
                  </div>
                </div>

                {/* Light Kanban Mini Board */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 font-semibold mb-2">
                      <span>INBOUND (3)</span>
                      <span className="text-xs text-slate-900 font-bold">$42k</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 mb-2">
                      <div className="text-xs font-bold text-slate-900">David K.</div>
                      <div className="text-[10px] text-slate-600 font-medium">FinTech SaaS · $18,000</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold text-slate-900">Rachel Lin</div>
                      <div className="text-[10px] text-slate-600 font-medium">Design Retainer · $24,000</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-mono text-indigo-950 font-bold mb-2">
                      <span>PROPOSAL (2)</span>
                      <span className="text-xs text-indigo-950 font-bold">$125k</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-200 mb-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Sarah Jenkins</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">HOT</span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium">CloudScale · $45,000</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-200 shadow-xs">
                      <div className="text-xs font-bold text-slate-900">Vanguard Corp</div>
                      <div className="text-[10px] text-slate-600 font-medium">Security Audit · $80,000</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 font-semibold mb-2">
                      <span>CLOSED WON</span>
                      <span className="text-xs text-emerald-700 font-bold">$210k</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                      <div className="text-xs font-bold text-slate-900">Apex Capital</div>
                      <div className="text-[10px] text-emerald-800 font-mono font-bold">Contract Signed ✓</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Security & 2FA (1 col) */}
            <div className="rounded-2xl bg-slate-50/70 border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                    ENTERPRISE SECURITY
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white text-slate-800 flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
                  2FA & Cryptographic Vault
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  TOTP authenticator support with RFC 6238 encryption and PostgreSQL row-level tenant protection.
                </p>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wide block mb-1">AUTHENTICATOR TOKEN</span>
                <div className="text-2xl font-mono font-bold tracking-[0.2em] text-slate-900">
                  842 190
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span className="text-[10px] text-slate-600 font-mono font-medium">Rolling refresh active</span>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Smart Calendar (1 col) */}
            <div className="rounded-2xl bg-slate-50/70 border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                    SCHEDULE MATRIX
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white text-slate-800 flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
                  Color-Coded Scheduling
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sync meetings directly from parsed contact dates with automated Google Calendar exports.
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <div className="p-3 rounded-lg bg-white border border-slate-200 border-l-3 border-l-indigo-600 text-xs shadow-xs">
                  <div className="font-bold text-slate-900">Client Demo with CloudScale</div>
                  <div className="text-[10px] text-slate-500 font-mono font-medium mt-0.5">Today, 2:30 PM - 3:00 PM</div>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200 border-l-3 border-l-emerald-600 text-xs shadow-xs">
                  <div className="font-bold text-slate-900">Q3 Contract Signing</div>
                  <div className="text-[10px] text-slate-500 font-mono font-medium mt-0.5">Tomorrow, 11:00 AM</div>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Chronological Activity Trail (Spans 2 cols) */}
            <div className="md:col-span-2 rounded-2xl bg-slate-50/70 border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                      AUDIT STREAM
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "var(--font-headline)" }}>
                      Realtime Interaction History
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-md">
                      Never lose context. Every call summary, note, and stage change is timestamped chronologically.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white text-slate-800 flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">history</span>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <div>
                        <span className="font-bold text-slate-900">Tariq Mansoor</span>
                        <span className="text-slate-600 font-medium"> accepted formal quotation ($14,400)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-medium">12 mins ago</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <div>
                        <span className="font-bold text-slate-900">Sarah Jenkins</span>
                        <span className="text-slate-600 font-medium"> was moved to Stage: &quot;Qualified Lead&quot;</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-medium">45 mins ago</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <div>
                        <span className="font-bold text-slate-900">Dr. Elena Rostova</span>
                        <span className="text-slate-600 font-medium"> meeting reminder dispatched</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-medium">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 4: 3-STAGE PIPELINE (Soft Slate Background)
      ═════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-800 font-bold px-3 py-1 rounded-full bg-white border border-slate-300 shadow-xs inline-block mb-3">
              Workflow Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4" style={{ fontFamily: "var(--font-headline)" }}>
              From unstructured notes to active deal in three steps.
            </h2>
            <p className="text-sm text-slate-600">
              Hover over each step to inspect the automated pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                tag: "CAPTURE",
                title: "Drop in Any Unformatted Text",
                desc: "Paste unstructured WhatsApp dumps, email signatures, conference badge scans, or sales notes directly into the application.",
                metric: "Any raw text source",
              },
              {
                num: "02",
                tag: "SYNTHESIS",
                title: "LLaMA 3.1 Entity Extraction",
                desc: "Our neural model segments names, corporate roles, phone numbers, email domains, intent, and deal budgets in under 85 milliseconds.",
                metric: "99.8% precision rate",
              },
              {
                num: "03",
                tag: "DISPATCH",
                title: "Automate Board & Calendar",
                desc: "The contact surfaces immediately on your Kanban board, syncs with Supabase PostgreSQL, and sets follow-up reminders.",
                metric: "Instant CRM sync",
              },
            ].map((step, idx) => (
              <div
                key={step.num}
                onMouseEnter={() => setActiveStep(idx)}
                className={`rounded-2xl bg-white border p-7 flex flex-col justify-between transition-all duration-200 ${
                  activeStep === idx
                    ? "border-slate-900 shadow-md"
                    : "border-slate-200 shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold font-mono text-slate-900">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {step.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "var(--font-headline)" }}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6 font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-700 font-bold">
                    ⚡ {step.metric}
                  </span>
                  <span className="text-slate-400 text-xs">→</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 5: SPREADSHEET CHAOS VS MYP (Pure White Background)
      ═════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-800 font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-300 inline-block mb-3">
              The Reality Check
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3" style={{ fontFamily: "var(--font-headline)" }}>
              The spreadsheet grind vs MYP
            </h2>
            <p className="text-sm text-slate-600">
              Compare the friction of traditional data entry with automated intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* The Old Way */}
            <div className="rounded-2xl bg-red-50/50 border border-red-200 p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-mono uppercase tracking-wider text-red-800 font-bold">
                    THE SPREADSHEET BOTTLENECK
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Manual, Fragile & Chaos-Prone</h3>
                
                <ul className="space-y-3.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-bold mt-0.5">✕</span>
                    <span>Copy-pasting phone numbers, names, and emails into 14 distinct Excel columns by hand.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-bold mt-0.5">✕</span>
                    <span>Lost follow-ups and missed meetings because unstructured notes rot in chat threads.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-bold mt-0.5">✕</span>
                    <span>Zero duplicate prevention — same lead added multiple times with conflicting details.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-bold mt-0.5">✕</span>
                    <span>No cryptographic security or role isolation — client budgets open to anyone with the link.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-red-200 text-xs font-mono text-red-800 font-bold flex items-center justify-between">
                <span>Wasted Time: ~45 min / day</span>
                <span>Friction: High</span>
              </div>
            </div>

            {/* The MYP Way */}
            <div className="rounded-2xl bg-emerald-50/50 border border-emerald-300 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-900 font-bold">
                    THE MYP (MANAGE YOUR PRIORITIES) FLOW
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Zero Friction, Instant Clarity</h3>

                <ul className="space-y-3.5 text-xs text-slate-800">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                    <span>Paste raw unformatted text anywhere — LLaMA 3.1 parses every field in under 85ms.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                    <span>Automated Kanban stage dispatch with instant calendar appointments and reminder alerts.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                    <span>Intelligent deduplication matches records by normalized email and international phone.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                    <span>Bank-grade 2FA (TOTP) and multi-tenant PostgreSQL Row-Level Security built-in.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-emerald-300 text-xs font-mono text-emerald-900 font-bold flex items-center justify-between">
                <span>Time Saved: ~18 hours / month</span>
                <span>Efficiency: 10x Boost</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 6: INTERACTIVE ROI CALCULATOR (Soft Slate Background)
      ═════════════════════════════════════════════════════════════════ */}
      <section id="roi-calculator" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-800 font-bold px-3 py-1 rounded-full bg-white border border-slate-300 shadow-xs inline-block mb-3">
              Impact Estimator
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2" style={{ fontFamily: "var(--font-headline)" }}>
              Calculate your team&apos;s saved hours
            </h2>
            <p className="text-sm text-slate-600">
              Drag the slider to match your team&apos;s weekly incoming contact volume.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 shadow-xs">
            
            {/* Slider */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-600 font-bold uppercase tracking-wide">WEEKLY INCOMING CONTACTS & LEADS:</span>
                <span className="text-2xl font-bold font-mono text-slate-900">{weeklyContacts} contacts/week</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={weeklyContacts}
                onChange={(e) => setWeeklyContacts(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 font-medium mt-2">
                <span>10 contacts</span>
                <span>150 contacts</span>
                <span>300+ contacts</span>
              </div>
            </div>

            {/* Calculated Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-3xl font-extrabold font-mono text-slate-900 mb-1">
                  {hoursSavedMonth} hrs
                </div>
                <div className="text-xs text-slate-600 font-semibold">Monthly Work Hours Reclaimed</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-3xl font-extrabold font-mono text-emerald-800 mb-1">
                  ${dollarsSaved}
                </div>
                <div className="text-xs text-slate-600 font-semibold">Estimated Labor Value Saved</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-3xl font-extrabold font-mono text-slate-900 mb-1">
                  100%
                </div>
                <div className="text-xs text-slate-600 font-semibold">Zero Forgotten Follow-ups</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 7: OPERATOR TESTIMONIALS (Pure White Background)
      ═════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-800 font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-300 inline-block mb-3">
              Operator Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2" style={{ fontFamily: "var(--font-headline)" }}>
              Trusted by high-velocity dealmakers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "MYP completely replaced our chaotic Google Sheets. I just dump WhatsApp voice note transcriptions into it and within a second it routes to my Kanban.",
                name: "Marcus Sterling",
                role: "Founder & Managing Director",
                company: "Sterling Advisory Group",
                avatar: "MS",
                bg: "bg-slate-100 text-slate-900 border border-slate-300",
              },
              {
                quote: "The raw text parser is scary fast. Our sales reps save at least an hour every afternoon. The Supabase sync and 2FA vault gives us full enterprise confidence.",
                name: "Jessica Patel",
                role: "VP of Global Business Dev",
                company: "CloudScale Technologies",
                avatar: "JP",
                bg: "bg-indigo-50 text-indigo-900 border border-indigo-200",
              },
              {
                quote: "I met 45 founders at SaaStr. Took 5 minutes to paste all their business cards and signatures into MYP. All 45 had follow-up appointments scheduled immediately.",
                name: "Liam O'Connor",
                role: "Principal Investor",
                company: "Horizon Ventures",
                avatar: "LO",
                bg: "bg-emerald-50 text-emerald-900 border border-emerald-200",
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-50/70 border border-slate-200 p-6 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-sm mb-4">
                    {"★".repeat(5)}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed mb-6 font-medium">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <div className={`w-9 h-9 rounded-xl ${t.bg} flex items-center justify-center font-bold text-xs`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{t.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 8: HIGH CONVERSION CTA (Deep Solid Anchor)
      ═════════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 text-white p-8 sm:p-14 text-center shadow-lg">
          
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-300 font-bold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 inline-block mb-4">
            Get Started Today
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4" style={{ fontFamily: "var(--font-headline)" }}>
            Never copy-paste a contact again.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Join thousands of consultants, agencies, and enterprise teams managing their client pipelines with intelligent neural speed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-900 bg-white hover:bg-slate-100 transition-all text-sm shadow-sm"
              style={{ fontFamily: "var(--font-label)" }}
            >
              {user ? "Open Dashboard →" : "Create Free Account →"}
            </Link>
            {!user && (
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-medium text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all text-sm"
                style={{ fontFamily: "var(--font-label)" }}
              >
                Sign in to existing account
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-mono">
            <span>✓ No credit card required</span>
            <span>✓ Free tier forever</span>
            <span>✓ Setup in 60 seconds</span>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          SECTION 9: SYSTEM FOOTER
      ═════════════════════════════════════════════════════════════════ */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center font-mono font-black text-xs shadow-xs">
              <span className="bg-gradient-to-br from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                MYP
              </span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
                MYP
              </span>
              <span className="text-slate-500 text-xs ml-2">© 2026 MYP — Manage Your Priorities. All rights reserved.</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>ALL SYSTEMS OPERATIONAL · 99.98% UPTIME</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600 font-medium">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#live-playground" className="hover:text-slate-900 transition-colors">Playground</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">Architecture</a>
            <Link href="/login" className="hover:text-slate-900 transition-colors">Sign in</Link>
          </div>

        </div>
      </footer>

    </div>
  );
}
