"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import MypLogo from "../brand/MypLogo";

interface HubCenterProps {
  isAbsorbing: boolean;
  className?: string;
}

export default function HubCenter({ isAbsorbing, className = "" }: HubCenterProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Outer concentric rotating ring 1 (60s rotation, counter-clockwise) */}
      <motion.svg
        viewBox="0 0 160 160"
        className="absolute w-36 h-36 sm:w-40 sm:h-40 pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="80"
          cy="80"
          r="72"
          stroke="rgba(99, 102, 241, 0.22)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          fill="none"
        />
        {/* Orbiting accent dot */}
        <circle cx="80" cy="8" r="2.2" fill="#6366F1" opacity="0.6" />
      </motion.svg>

      {/* Inner concentric rotating ring 2 (40s rotation, clockwise) */}
      <motion.svg
        viewBox="0 0 160 160"
        className="absolute w-28 h-28 sm:w-32 sm:h-32 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="80"
          cy="80"
          r="54"
          stroke="rgba(148, 163, 184, 0.28)"
          strokeWidth="1.2"
          strokeDasharray="3 5"
          fill="none"
        />
        {/* Orbiting accent dot */}
        <circle cx="134" cy="80" r="2" fill="#94A3B8" opacity="0.7" />
      </motion.svg>

      {/* Expanding pulse wave on chip absorb */}
      <AnimatePresence>
        {isAbsorbing && (
          <motion.div
            key="absorb-wave"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2.1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="absolute w-20 h-20 rounded-full border border-indigo-400 bg-indigo-500/15 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Center Frosted Glass Orb */}
      <motion.div
        animate={isAbsorbing ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-full p-2.5 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_12px_36px_rgba(30,27,75,0.14)] flex items-center justify-center will-change-transform"
      >
        {/* Center ambient glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-blue-500/15 to-transparent blur-md pointer-events-none" />

        {/* The MYP Convergence Y Mark */}
        <div className="relative z-10 scale-105">
          <MypLogo size={42} variant="mark" />
        </div>
      </motion.div>
    </div>
  );
}

