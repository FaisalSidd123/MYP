"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

/* ─────────────────────────────────────────────────────────────────
   FONT SETUP — add this inside <head> in your layout.tsx:

   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
   <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
───────────────────────────────────────────────────────────────── */

// ─── Motion Variants ──────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};
const fadeLeft = {
  hidden: { opacity: 0, x: -36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

// ─── Scroll InView wrapper ─────────────────────────────────────────────────────

function InView({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const features = [
  { icon: "⚡", tag: "AI-Powered", title: "Raw Text Parser", desc: "Paste any unformatted contact — email, name, phone, budget — and our AI maps it to the right fields instantly.", accent: "#4f8ef7" },
  { icon: "🗂", tag: "Organised", title: "Kanban Workflow", desc: "Move contacts through Pending, In Review, Approved, and Completed stages with a visual drag-and-drop board.", accent: "#a78bfa" },
  { icon: "📅", tag: "Scheduling", title: "Smart Calendar", desc: "Color-coded events and weekly views keep every appointment and deadline perfectly in sight.", accent: "#34d399" },
  { icon: "🔍", tag: "Insights", title: "Activity Timeline", desc: "Every interaction — calls, notes, meetings — logged chronologically so you never lose context.", accent: "#f59e0b" },
  { icon: "🏷", tag: "Tagging", title: "Smart Filters", desc: "Tag, segment, and filter contacts by status, priority, industry, or budget range in milliseconds.", accent: "#f472b6" },
  { icon: "🔐", tag: "Secure", title: "Role-based Access", desc: "Control who sees what. Assign permissions per team member so sensitive client data stays protected.", accent: "#22d3ee" },
];

const steps = [
  { n: "01", title: "Paste raw data", desc: "Drop in any unstructured contact info — no formatting needed." },
  { n: "02", title: "AI auto-fills", desc: "Our parser extracts name, email, phone, company, and budget." },
  { n: "03", title: "Review & confirm", desc: "Check the pre-filled card, adjust if needed, then hit Save." },
  { n: "04", title: "Manage & track", desc: "Contact lands on your board, ready to schedule and track." },
];

// ─── Shared style tokens ──────────────────────────────────────────────────────

const poppins = { fontFamily: "'Poppins', sans-serif" } as React.CSSProperties;
const inter = { fontFamily: "'Inter', sans-serif" } as React.CSSProperties;
const gradText: React.CSSProperties = {
  background: "linear-gradient(135deg, #4f8ef7 0%, #a78bfa 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(135deg, #4f8ef7 0%, #7c3aed 100%)",
  boxShadow: "0 4px 20px rgba(79,142,247,0.28)",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
  const heroY = useTransform(smooth, [0, 0.4], ["0%", "10%"]);
  const heroOp = useTransform(smooth, [0, 0.35], [1, 0.65]);

  return (
    <div className="min-h-screen text-white antialiased overflow-x-hidden" style={{ ...inter, background: "#060911" }}>

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
        style={{ scaleX: smooth, background: "linear-gradient(90deg,#4f8ef7,#a78bfa)" }}
      />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-[12%] w-[700px] h-[700px] rounded-full bg-[#1a3a6b]/18 blur-[140px]" />
        <div className="absolute bottom-[-8%] right-[0%] w-[550px] h-[550px] rounded-full bg-[#2d1b69]/14 blur-[110px]" />
        <div className="absolute top-[42%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#0d2860]/10 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{ backgroundImage: "radial-gradient(circle,#ffffff 1px,transparent 1px)", backgroundSize: "36px 36px" }}
        />
      </div>

      {/* ══════════════════════════════
          NAVIGATION
      ══════════════════════════════ */}
      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-5 pt-4">
          <div
            className="flex items-center justify-between h-[54px] px-5 rounded-2xl border border-white/[0.08]"
            style={{
              background: "rgba(8,12,24,0.74)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[14px] font-bold shadow-lg group-hover:scale-105 transition-transform duration-200"
                style={{ background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", boxShadow: "0 4px 14px rgba(79,142,247,0.35)" }}
              >
                ✦
              </div>
              <span className="text-[15px] font-semibold text-white/90 tracking-[-0.01em]" style={poppins}>
                ContactHub
              </span>
            </Link>

            {/* Nav links — centered absolutely */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {[
                { label: "Features", href: "#features" },
                { label: "How it works", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="relative px-4 py-1.5 text-[13px] font-medium text-white/46 hover:text-white/88 rounded-xl hover:bg-white/[0.05] transition-all duration-200 group"
                  style={poppins}
                >
                  {label}
                  <span className="absolute bottom-1 left-4 right-4 h-px bg-gradient-to-r from-[#4f8ef7] to-[#a78bfa] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                </Link>
              ))}
            </nav>

            {/* Auth CTAs */}
            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white rounded-xl transition-all hover:scale-[1.03] hover:brightness-110"
                  style={{ ...poppins, ...primaryBtn }}
                >
                  Dashboard <span className="opacity-70">→</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:block px-4 py-2 text-[13px] font-medium text-white/50 hover:text-white/85 rounded-xl hover:bg-white/[0.05] transition-all"
                    style={poppins}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-[13px] font-semibold text-white rounded-xl transition-all hover:scale-[1.03] hover:brightness-110"
                    style={{ ...poppins, ...primaryBtn }}
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-24">
        <motion.div style={{ y: heroY, opacity: heroOp }} className="max-w-3xl mx-auto text-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/[0.05] mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4f8ef7] opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4f8ef7]" />
            </span>
            <span className="text-[11px] font-medium text-white/48 uppercase tracking-[0.18em]" style={poppins}>
              AI-Powered Contact Management
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="text-[40px] md:text-[58px] lg:text-[66px] font-bold leading-[1.08] tracking-[-0.03em] mb-5"
            style={poppins}
          >
            <span style={gradText}>The smartest way</span>
            <br />
            <span className="text-white/88">to manage your</span>
            <br />
            <span className="text-white/88">contacts</span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-[15px] md:text-[17px] font-light leading-[1.8] text-white/40 max-w-xl mx-auto mb-10"
            style={inter}
          >
            Paste raw contact data and let AI do the sorting. Schedule, track stages,
            and manage your entire client network — beautifully.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.42 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {user ? (
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[14px] font-semibold text-white transition-all hover:scale-[1.04]"
                style={{ ...poppins, ...primaryBtn }}
              >
                Go to Dashboard
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[14px] font-semibold text-white transition-all hover:scale-[1.04]"
                  style={{ ...poppins, ...primaryBtn }}
                >
                  Start for free
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>
                <Link
                  href="#features"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[14px] font-medium text-white/48 border border-white/10 hover:border-white/22 hover:text-white/75 hover:bg-white/[0.05] transition-all"
                  style={poppins}
                >
                  Explore features
                </Link>
              </>
            )}
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center justify-center gap-10 mt-14 pt-8 border-t border-white/[0.06]"
          >
            {[
              { val: "12K+", label: "Active users" },
              { val: "99.9%", label: "Uptime SLA" },
              { val: "4.9 ★", label: "User rating" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-[22px] font-bold text-white/80 tracking-tight" style={poppins}>{s.val}</div>
                <div className="text-[11px] font-medium text-white/28 uppercase tracking-widest mt-0.5" style={inter}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[480px] h-px bg-gradient-to-r from-transparent via-[#4f8ef7]/35 to-transparent" />
      </section>

      {/* ══════════════════════════════
          FEATURES
      ══════════════════════════════ */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <InView className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/26 mb-3" style={poppins}>
              Everything you need
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[32px] md:text-[42px] font-bold tracking-[-0.025em] text-white/90 mb-3" style={poppins}>
              Built for the way <span style={gradText}>you work</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-[15px] font-light text-white/36 max-w-md mx-auto leading-relaxed" style={inter}>
              Every feature is designed to reduce friction and give you full clarity over your contacts and clients.
            </motion.p>
          </InView>

          <InView className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i * 0.4}
                whileHover={{ y: -7, transition: { duration: 0.22 } }}
                className="group relative p-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.055] transition-colors duration-300 cursor-default overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 0% 0%, ${f.accent}14, transparent 65%)` }}
                />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-[26px] leading-none">{f.icon}</span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ ...poppins, color: f.accent, background: `${f.accent}18` }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-white/85 mb-2 tracking-[-0.01em]" style={poppins}>{f.title}</h3>
                  <p className="text-[13px] font-light text-white/38 leading-relaxed" style={inter}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </InView>
        </div>
      </section>

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      <section id="how-it-works" className="relative py-24 px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg,transparent,rgba(79,142,247,0.025) 50%,transparent)" }}
        />
        <div className="max-w-5xl mx-auto">
          <InView className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Steps */}
            <div>
              <motion.p variants={fadeLeft} className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/26 mb-3" style={poppins}>
                How it works
              </motion.p>
              <motion.h2
                variants={fadeLeft}
                className="text-[30px] md:text-[38px] font-bold tracking-[-0.025em] text-white/90 mb-8 leading-[1.15]"
                style={poppins}
              >
                From messy text to{" "}
                <span style={gradText}>organised contact</span>
              </motion.h2>
              <div className="space-y-5">
                {steps.map((s, i) => (
                  <motion.div key={i} variants={fadeLeft} custom={i} className="flex gap-4 group">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold border border-white/10 group-hover:border-[#4f8ef7]/45 transition-colors"
                      style={{ ...poppins, background: "rgba(79,142,247,0.08)", color: "#4f8ef7" }}
                    >
                      {s.n}
                    </div>
                    <div className="pt-1.5">
                      <div className="text-[14px] font-semibold text-white/82 mb-0.5 tracking-[-0.01em]" style={poppins}>{s.title}</div>
                      <div className="text-[13px] font-light text-white/36 leading-relaxed" style={inter}>{s.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mock parser card */}
            <motion.div variants={fadeRight} className="relative">
              <div
                className="absolute -inset-6 rounded-3xl blur-3xl opacity-18 pointer-events-none"
                style={{ background: "linear-gradient(135deg,#4f8ef7,#7c3aed)" }}
              />
              <div
                className="relative rounded-2xl border border-white/10 overflow-hidden"
                style={{ background: "rgba(10,16,32,0.9)", backdropFilter: "blur(24px)" }}
              >
                {/* Chrome */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.07]">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/55" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/55" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/55" />
                  <span className="ml-3 text-[11px] font-medium text-white/22 tracking-wide" style={poppins}>AI Parser · ContactHub</span>
                </div>

                {/* Raw input */}
                <div className="p-5 border-b border-white/[0.06]">
                  <div className="text-[10px] font-semibold text-white/22 uppercase tracking-[0.2em] mb-2.5" style={poppins}>Raw input</div>
                  <div
                    className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4 text-[12px] text-white/46 leading-[1.9]"
                    style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
                  >
                    Faisal Ahmed<br />
                    faisal@gmail.com<br />
                    +92 320 9242 300<br />
                    Budget: 300,000
                  </div>
                </div>

                {/* Parsed fields */}
                <div className="p-5">
                  <div className="text-[10px] font-semibold text-white/22 uppercase tracking-[0.2em] mb-3" style={poppins}>AI extracted</div>
                  <div className="space-y-2">
                    {[
                      { label: "Name", val: "Faisal Ahmed", color: "#4f8ef7" },
                      { label: "Email", val: "faisal@gmail.com", color: "#34d399" },
                      { label: "Phone", val: "+92 320 9242 300", color: "#a78bfa" },
                      { label: "Budget", val: "PKR 300,000", color: "#f59e0b" },
                    ].map((row, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + i * 0.14, duration: 0.4 }}
                        className="flex items-center justify-between rounded-xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.06]"
                      >
                        <span className="text-[11px] font-medium text-white/28" style={poppins}>{row.label}</span>
                        <span className="text-[12px] font-semibold" style={{ ...poppins, color: row.color }}>{row.val}</span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.75 }}
                    className="mt-4 w-full py-3 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-110"
                    style={{ ...poppins, ...primaryBtn }}
                  >
                    Save contact →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </InView>
        </div>
      </section>

      {/* ══════════════════════════════
          CTA SECTION
      ══════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 50%,rgba(79,142,247,0.07),transparent 68%)" }}
        />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#4f8ef7]/28 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/7 to-transparent" />

        <InView className="max-w-2xl mx-auto text-center">
          <motion.p variants={fadeUp} className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/26 mb-3" style={poppins}>
            Get started today
          </motion.p>
          <motion.h2
            variants={fadeUp} custom={1}
            className="text-[34px] md:text-[48px] font-bold tracking-[-0.025em] text-white/90 mb-4 leading-[1.12]"
            style={poppins}
          >
            Your contacts,{" "}
            <span style={gradText}>finally in order</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-[15px] font-light text-white/36 mb-9 leading-relaxed max-w-lg mx-auto" style={inter}>
            Join thousands of professionals who use ContactHub to manage clients, schedules, and deals — without the chaos.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-[14px] font-semibold text-white transition-all hover:scale-[1.04]"
                style={{ ...poppins, ...primaryBtn }}
              >
                Go to Dashboard
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-[14px] font-semibold text-white transition-all hover:scale-[1.04]"
                  style={{ ...poppins, ...primaryBtn }}
                >
                  Create free account
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl text-[14px] font-medium text-white/46 border border-white/10 hover:border-white/22 hover:text-white/75 hover:bg-white/[0.05] transition-all"
                  style={poppins}
                >
                  Sign in
                </Link>
              </>
            )}
          </motion.div>
        </InView>
      </section>

      {/* ══════════════════════════════
          FOOTER
      ══════════════════════════════ */}
      <footer className="relative border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[14px] font-bold"
              style={{ background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", boxShadow: "0 2px 10px rgba(79,142,247,0.3)" }}
            >
              ✦
            </div>
            <span className="text-[14px] font-semibold text-white/62" style={poppins}>ContactHub</span>
          </div>

          <div className="flex items-center gap-6">
            {["Features", "Privacy", "Terms", "Contact"].map((l) => (
              <Link key={l} href="#" className="text-[12px] font-medium text-white/26 hover:text-white/55 transition-colors" style={poppins}>
                {l}
              </Link>
            ))}
          </div>

          <p className="text-[12px] text-white/20" style={inter}>© 2025 ContactHub. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}