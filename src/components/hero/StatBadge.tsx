"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StatBadgeProps {
  conversionRate: number;
  showConfetti?: boolean;
}

export default function StatBadge({ conversionRate, showConfetti = false }: StatBadgeProps) {
  // Sparkline coordinates
  const sparklinePath =
    conversionRate >= 19
      ? "M 2 16 L 10 14 L 18 15 L 26 10 L 34 11 L 42 5 L 50 3"
      : "M 2 16 L 10 14 L 18 15 L 26 10 L 34 11 L 42 7";

  return (
    <div className="relative inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_6px_20px_rgba(15,23,42,0.08)] select-none">
      {/* Subtle Confetti Dots Burst */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
            {[
              { id: 1, x: -18, y: -20, c: "#10B981" },
              { id: 2, x: 22, y: -24, c: "#6366F1" },
              { id: 3, x: -26, y: 14, c: "#F59E0B" },
              { id: 4, x: 28, y: 16, c: "#3B82F6" },
              { id: 5, x: 0, y: -28, c: "#EC4899" },
              { id: 6, x: -12, y: 22, c: "#10B981" },
              { id: 7, x: 18, y: -12, c: "#8B5CF6" },
            ].map((p) => (
              <motion.span
                key={p.id}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{ scale: [0, 1.3, 0], x: p.x, y: p.y, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: p.c }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          CONVERSION WIN
        </span>
        <div className="flex items-center gap-1.5 leading-none mt-0.5">
          <motion.span
            key={conversionRate}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-extrabold text-emerald-700 font-mono"
          >
            ↑ {conversionRate}%
          </motion.span>
          <span className="text-[9px] text-slate-400 font-mono">Pipeline avg</span>
        </div>
      </div>

      {/* Self-drawing SVG Sparkline */}
      <svg width="52" height="20" viewBox="0 0 52 20" fill="none" className="shrink-0 overflow-visible">
        <motion.path
          key={sparklinePath}
          d={sparklinePath}
          stroke="#10B981"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0.5, opacity: 0.7 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {/* Glow end dot */}
        <circle cx={conversionRate >= 19 ? "50" : "42"} cy={conversionRate >= 19 ? "3" : "7"} r="2.2" fill="#10B981" />
      </svg>
    </div>
  );
}

