"use client";

import React, { useState, useEffect, useRef, useMemo, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputChip from "./InputChip";
import HubCenter from "./HubCenter";
import MiniKanban from "./MiniKanban";
import MiniProjectCard from "./MiniProjectCard";
import MiniCalendar from "./MiniCalendar";
import StatBadge from "./StatBadge";
import {
  SAMPLE_CHIPS_POOL,
  INITIAL_KANBAN_DATA,
  SAMPLE_PROJECTS,
  KanbanCardItem,
} from "./sampleData";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HeroPipelineAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Subscribe to prefers-reduced-motion without cascading renders
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  // Cycle index to rotate through sample data items
  const [cycleCount, setCycleCount] = useState(0);

  // Coordinated timeline step (0 to 8)
  const [timelineStep, setTimelineStep] = useState<number>(0);

  // Mouse Parallax coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ─── VISIBILITY & INTERSECTION OBSERVERS ───
  useEffect(() => {
    // 1. Intersection Observer to pause when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // 2. Visibility change to pause on background tab
    const handleVisibility = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // ─── SINGLE CENTRAL TIMELINE STATE MACHINE ───
  // Total cycle = 9.0 seconds, divided into precision keyframes
  useEffect(() => {
    if (prefersReducedMotion || !isInView || !isTabVisible) {
      return;
    }

    const STEP_TIMINGS = [
      { step: 0, delay: 0 },     // 0.0s Idle
      { step: 1, delay: 600 },   // 0.6s Chip 1 detaches & flies to hub
      { step: 2, delay: 1400 },  // 1.4s Chip 1 reaches hub & absorbs
      { step: 3, delay: 1700 },  // 1.7s Clean lead card emitted to Kanban New
      { step: 4, delay: 2600 },  // 2.6s Card moves from Contacted -> Qualified
      { step: 5, delay: 3400 },  // 3.4s Chip 2 flies in -> Calendar event lands
      { step: 6, delay: 5000 },  // 5.0s Project progress bar 62% -> 74%
      { step: 7, delay: 6000 },  // 6.0s Qualified -> Won + Confetti + 18% -> 19%
      { step: 8, delay: 7000 },  // 7.0s New chips fade in to replace absorbed
      { step: 9, delay: 9000 },  // 9.0s Reset & increment cycle
    ];

    const timeouts: NodeJS.Timeout[] = [];

    STEP_TIMINGS.forEach(({ step, delay }) => {
      const timeout = setTimeout(() => {
        if (step === 9) {
          setTimelineStep(0);
          setCycleCount((c) => c + 1);
        } else {
          setTimelineStep(step);
        }
      }, delay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isInView, isTabVisible, prefersReducedMotion, cycleCount]);

  // Handle Mouse Parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || prefersReducedMotion) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // ─── DERIVED CYCLE DATA ───
  // Cycle through pool of 10+ items so animation content changes on each loop
  const activeChips = useMemo(() => {
    const offset = (cycleCount * 2) % (SAMPLE_CHIPS_POOL.length - 4);
    return SAMPLE_CHIPS_POOL.slice(offset, offset + 6);
  }, [cycleCount]);

  const activeProject = useMemo(() => {
    return SAMPLE_PROJECTS[cycleCount % SAMPLE_PROJECTS.length];
  }, [cycleCount]);

  // Dynamic Kanban State based on Timeline Step
  const kanbanColumns = useMemo(() => {
    // Deep clone initial state
    const cols: Record<"new" | "contacted" | "qualified" | "won", KanbanCardItem[]> = {
      new: [...INITIAL_KANBAN_DATA.new],
      contacted: [...INITIAL_KANBAN_DATA.contacted],
      qualified: [...INITIAL_KANBAN_DATA.qualified],
      won: [...INITIAL_KANBAN_DATA.won],
    };

    // Step 3+: New lead card emitted into 'new'
    if (timelineStep >= 3) {
      cols.new = [
        {
          id: `lead-emitted-${cycleCount}`,
          name: activeChips[0]?.title.split(" · ")[0] || "Inquiry Lead",
          company: "Web Portal",
          value: "$75,000",
          dealScore: 94,
          highlight: timelineStep === 3,
        },
        ...cols.new,
      ];
    }

    // Step 4+: Contacted card moves to Qualified
    if (timelineStep >= 4) {
      const movedCard = cols.contacted[0];
      if (movedCard) {
        cols.contacted = cols.contacted.filter((c) => c.id !== movedCard.id);
        cols.qualified = [{ ...movedCard, dealScore: 95 }, ...cols.qualified];
      }
    }

    // Step 7+: Qualified card moves to Won
    if (timelineStep >= 7) {
      const wonCard = cols.qualified[cols.qualified.length - 1];
      if (wonCard) {
        cols.qualified = cols.qualified.filter((c) => c.id !== wonCard.id);
        cols.won = [{ ...wonCard, value: "$120,000" }, ...cols.won];
      }
    }

    return cols;
  }, [timelineStep, cycleCount, activeChips]);

  // Flying Chip 1 (Step 1 -> 2)
  const isChip1Flying = timelineStep === 1;
  const isChip1Absorbed = timelineStep >= 2;

  // Flying Chip 2 (Step 5)
  const isChip2Flying = timelineStep === 5;

  // Hub absorb pulse active
  const isHubAbsorbing = timelineStep === 2 || timelineStep === 5;

  // Project progress step (62% -> 74% at step 6)
  const projectProgress = timelineStep >= 6 ? 74 : activeProject.progress;
  const showExtraAvatar = timelineStep >= 6;

  // Calendar event scheduled at step 5
  const hasCalendarEvent = timelineStep >= 5;

  // Stat conversion rate (18% -> 19% at step 7)
  const conversionRate = timelineStep >= 7 ? 19 : 18;
  const showConfetti = timelineStep === 7;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label="Animation showing contacts, leads, projects and schedules being organized by MYP"
      className="relative w-full h-[520px] sm:h-[540px] max-w-[580px] mx-auto rounded-[28px] bg-slate-900 border border-slate-800/80 shadow-[0_24px_64px_rgba(15,23,42,0.25)] overflow-hidden select-none will-change-transform"
    >
      {/* ─── FAINT CANVAS GRID PATTERN ─── */}
      <div
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #94A3B8 1px, transparent 0)`,
          backgroundSize: "24px 24px",
          transform: `translate(${mousePos.x * 6}px, ${mousePos.y * 6}px)`,
          transition: "transform 0.2s ease-out",
        }}
      />

      {/* ─── LARGE BLURRED RADIAL GLOW IN CENTER ─── */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-indigo-600/25 via-blue-600/20 to-purple-600/15 blur-[90px] pointer-events-none" />

      {/* ─── SVG BEZIER MOTION TRAILS (Behind cards) ─── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
        <defs>
          <linearGradient id="trail-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="trail-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Path 1: From Zone 1 (Top Left) into Hub (Center) */}
        <path
          id="chip-path-1"
          d="M 110 90 C 130 140, 180 180, 240 220"
          fill="none"
          stroke="url(#trail-grad-1)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className={`transition-opacity duration-500 ${isChip1Flying ? "opacity-90" : "opacity-0"}`}
        />

        {/* Path 2: Emitted from Hub (Center) into Zone 3 Kanban */}
        <path
          d="M 240 220 C 300 240, 340 180, 400 130"
          fill="none"
          stroke="url(#trail-grad-2)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className={`transition-opacity duration-500 ${timelineStep === 3 ? "opacity-90" : "opacity-0"}`}
        />
      </svg>

      {/* ═════════════════════════════════════════════════════════════════
          ZONE 1: INBOX CHAOS (Top-Left Incoming Items)
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:block"
        style={{
          x: mousePos.x * 12,
          y: mousePos.y * 12,
          transition: "transform 0.15s ease-out",
        }}
      >
        <div className="flex items-center gap-1.5 mb-2 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-slate-400">
            Unstructured Inbound (Chaos)
          </span>
        </div>

        {/* Floating Input Chips Cluster */}
        <div className="relative w-[220px] h-[190px]">
          {/* Chip 1 (The one that flies into the Hub on Step 1) */}
          <AnimatePresence>
            {!isChip1Absorbed && activeChips[0] && (
              <motion.div
                key={`chip-flying-1-${cycleCount}`}
                animate={
                  isChip1Flying
                    ? {
                        x: 130,
                        y: 130,
                        scale: 0.58,
                        rotate: 0,
                        opacity: 0,
                      }
                    : {
                        x: [0, 2, -2, 0],
                        y: [0, -5, 4, 0],
                        rotate: [-2, 0, -3, -2],
                      }
                }
                transition={
                  isChip1Flying
                    ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                    : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
                }
                className="absolute top-0 left-0 z-30"
              >
                <InputChip chip={activeChips[0]} isFlying={isChip1Flying} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chip 2: Ahmed Raza (Flies into Hub on Step 5) */}
          {activeChips[1] && (
            <motion.div
              animate={
                isChip2Flying
                  ? {
                      x: 110,
                      y: 85,
                      scale: 0.55,
                      rotate: 0,
                      opacity: 0,
                    }
                  : {
                      x: [0, -3, 2, 0],
                      y: [0, 4, -5, 0],
                      rotate: [3, 1, 4, 3],
                    }
              }
              transition={
                isChip2Flying
                  ? { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 5.2, repeat: Infinity, ease: "easeInOut" }
              }
              className="absolute top-14 left-4 z-20"
            >
              <InputChip chip={activeChips[1]} isFlying={isChip2Flying} />
            </motion.div>
          )}

          {/* Chip 3: WhatsApp Inquiry (Drifting) */}
          {activeChips[2] && (
            <motion.div
              animate={{
                x: [0, 3, -3, 0],
                y: [0, -4, 3, 0],
                rotate: [-4, -1, -5, -4],
              }}
              transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-28 left-0 z-10 opacity-80"
            >
              <InputChip chip={activeChips[2]} />
            </motion.div>
          )}

          {/* Chip 4: Replaced chip fading in on Step 8 */}
          <AnimatePresence>
            {(timelineStep >= 8 || timelineStep <= 1) && activeChips[3] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, x: -12 }}
                animate={{ opacity: 0.75, scale: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute top-40 left-3 z-0"
              >
                <InputChip chip={activeChips[3]} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ═════════════════════════════════════════════════════════════════
          ZONE 2: THE HUB (MYP Convergence Center)
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 z-30"
        style={{
          x: mousePos.x * 4,
          y: mousePos.y * 4,
          transition: "transform 0.2s ease-out",
        }}
      >
        <HubCenter isAbsorbing={isHubAbsorbing} />
      </motion.div>

      {/* ═════════════════════════════════════════════════════════════════
          ZONE 3: MANAGED WORKSPACE (Right and Bottom Output)
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute right-4 bottom-4 left-4 sm:left-auto sm:w-[330px] z-20 space-y-2.5"
        style={{
          x: mousePos.x * 8,
          y: mousePos.y * 8,
          transition: "transform 0.18s ease-out",
        }}
      >
        {/* Output Header Pill */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-slate-300">
              MYP Managed Pipeline
            </span>
          </div>
          <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded">
            AUTOMATED 100%
          </span>
        </div>

        {/* 1. Mini Kanban Leads Pipeline */}
        <MiniKanban columns={kanbanColumns} isNewLeadLanding={timelineStep === 3} />

        {/* 2. Mini Project Card */}
        <MiniProjectCard
          project={activeProject}
          progressOverride={projectProgress}
          showExtraAvatar={showExtraAvatar}
        />

        {/* 3. Bottom Row: Mini Calendar Strip & Floating Stat Badge */}
        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-7">
            <MiniCalendar hasEventScheduled={hasCalendarEvent} />
          </div>

          <div className="col-span-5 flex justify-end">
            <StatBadge conversionRate={conversionRate} showConfetti={showConfetti} />
          </div>
        </div>
      </motion.div>

      {/* ─── BOTTOM ACCENT LINE ─── */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
    </div>
  );
}
