"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export type MypLogoVariant = "mark" | "full";
export type MypLogoTheme = "light" | "dark";
export type MypLogoStyle = "convergence" | "orbit" | "stacked";

export interface MypLogoProps {
  /** Size in pixels (number) or CSS dimension (string). Defaults to 36. */
  size?: number | string;
  /** "mark" for standalone icon, "full" for icon + "MYP" wordmark. */
  variant?: MypLogoVariant;
  /** Background context theme: "dark" or "light" (affects wordmark text color). */
  theme?: MypLogoTheme;
  /** Visual direction: standard "convergence" (The Convergence Y), or alternates "orbit" / "stacked". */
  iconStyle?: MypLogoStyle;
  /** Whether to render the descriptive subtitle "Manage Your Priorities" in full variant. */
  showTagline?: boolean;
  /** Optional container class. */
  className?: string;
  /** External hover control if needed. */
  isHovered?: boolean;
}

export default function MypLogo({
  size = 36,
  variant = "mark",
  theme = "light",
  iconStyle = "convergence",
  showTagline = false,
  className = "",
  isHovered: externalHovered,
}: MypLogoProps) {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHovered !== undefined ? externalHovered : internalHover;

  const numericSize = typeof size === "number" ? size : parseInt(String(size), 10) || 36;
  const isSmall = numericSize <= 22;

  // Primary Convergence Y Icon (viewBox 0 0 48 48)
  const renderConvergenceY = () => (
    <svg
      viewBox="0 0 48 48"
      width={numericSize}
      height={numericSize}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none overflow-visible"
      role="img"
      aria-label="MYP Convergence Y Logo Mark"
    >
      <defs>
        {/* Subtle diagonal depth gradient for the container */}
        <linearGradient id="myp-bg-gradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="60%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Ambient top light */}
        <linearGradient id="myp-stroke-highlight" x1="12" y1="4" x2="36" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
        </linearGradient>

        {/* Stream glow */}
        <filter id="myp-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Rounded square container (rx = 12) */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="url(#myp-bg-gradient)"
        stroke="url(#myp-stroke-highlight)"
        strokeWidth="1.2"
      />

      <g filter="url(#myp-glow)">
        {/* Two upper arms of the Y curving inward into one vertical stem */}
        {/* Left arm merging into center */}
        <path
          d="M 14.5 13.5 C 16.5 19.5, 21.8 23.5, 24 25.5"
          stroke="#FFFFFF"
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right arm merging into center */}
        <path
          d="M 33.5 13.5 C 31.5 19.5, 26.2 23.5, 24 25.5"
          stroke="#FFFFFF"
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Central stem */}
        <path
          d="M 24 25.5 L 24 33"
          stroke="#FFFFFF"
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Floating third node (incoming leads) - hidden at <=20px for optical clarity */}
        {!isSmall && (
          <motion.circle
            cx="24"
            cy="9.5"
            r="1.6"
            fill="#93C5FD"
            animate={
              isHovered
                ? { y: [0, 4, 0], opacity: [0.85, 1, 0.85] }
                : { y: [0, -1, 0], opacity: [0.85, 0.65, 0.85] }
            }
            transition={{
              duration: isHovered ? 0.35 : 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Left arm top node - slides down along arm into stem on hover */}
        <motion.circle
          cx={14.5}
          cy={13.5}
          r={2.4}
          fill="#FFFFFF"
          animate={
            isHovered
              ? { cx: 24, cy: 25.5, opacity: 0.1 }
              : { cx: 14.5, cy: 13.5, opacity: 1 }
          }
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Right arm top node - slides down along arm into stem on hover */}
        <motion.circle
          cx={33.5}
          cy={13.5}
          r={2.4}
          fill="#FFFFFF"
          animate={
            isHovered
              ? { cx: 24, cy: 25.5, opacity: 0.1 }
              : { cx: 33.5, cy: 13.5, opacity: 1 }
          }
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Bottom converted/managed circle with tiny checkmark */}
        <motion.g
          animate={
            isHovered
              ? { scale: [1, 1.18, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }
              : { scale: 1 }
          }
          transition={{ duration: 0.45, ease: "easeOut", times: [0, 0.5, 1] }}
          style={{ originX: "24px", originY: "34.5px" }}
        >
          <circle cx="24" cy="34.5" r="4.3" fill="#FFFFFF" />
          {/* Check mark inside bottom circle */}
          <path
            d="M 22.3 34.6 L 23.6 35.9 L 25.8 33.3"
            stroke="#0F172A"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </g>
    </svg>
  );

  // Alternate Direction A: "Orbit"
  const renderOrbitAlt = () => (
    <svg
      viewBox="0 0 48 48"
      width={numericSize}
      height={numericSize}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none overflow-visible"
    >
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#0F172A" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
      {/* Tilted elliptical orbit ring */}
      <ellipse
        cx="24"
        cy="24"
        rx="15"
        ry="7"
        transform="rotate(-28 24 24)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      {/* Managed core */}
      <circle cx="24" cy="24" r="5" fill="#FFFFFF" />
      {/* Orbiting contact nodes */}
      <circle cx="12" cy="18" r="2.2" fill="#93C5FD" />
      <circle cx="36" cy="30" r="2.2" fill="#93C5FD" />
      <circle cx="28" cy="14" r="1.8" fill="#FFFFFF" />
    </svg>
  );

  // Alternate Direction B: "Stacked Pipeline"
  const renderStackedPipelineAlt = () => (
    <svg
      viewBox="0 0 48 48"
      width={numericSize}
      height={numericSize}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none overflow-visible"
    >
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#0F172A" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
      {/* Funnel bars of decreasing width */}
      <rect x="11" y="14" width="26" height="4.2" rx="2.1" fill="#FFFFFF" />
      <rect x="15" y="21.5" width="18" height="4.2" rx="2.1" fill="#93C5FD" />
      <rect x="19" y="29" width="10" height="4.2" rx="2.1" fill="#60A5FA" />
      {/* Tiny check mark icon */}
      <path d="M 22.5 37 L 23.8 38.3 L 26 35.8" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const iconMarkup =
    iconStyle === "orbit"
      ? renderOrbitAlt()
      : iconStyle === "stacked"
      ? renderStackedPipelineAlt()
      : renderConvergenceY();

  if (variant === "mark") {
    return (
      <div
        className={`inline-flex items-center justify-center cursor-pointer ${className}`}
        onMouseEnter={() => setInternalHover(true)}
        onMouseLeave={() => setInternalHover(false)}
        title="MYP — Manage Your Priorities"
      >
        {iconMarkup}
      </div>
    );
  }

  // Full Wordmark Variant
  const textColor = theme === "dark" ? "text-white" : "text-slate-900";
  const taglineColor = theme === "dark" ? "text-slate-400" : "text-slate-500";

  return (
    <div
      className={`inline-flex items-center gap-3 select-none cursor-pointer group ${className}`}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      {iconMarkup}

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-extrabold tracking-[-0.02em] ${textColor} transition-colors group-hover:text-indigo-600`}
            style={{
              fontSize: Math.max(14, Math.round(numericSize * 0.46)),
              fontFamily: "var(--font-headline, 'Plus Jakarta Sans', sans-serif)",
            }}
          >
            MYP
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="System Operational" />
        </div>

        {showTagline && (
          <span
            className={`text-[10px] font-medium tracking-tight mt-0.5 truncate ${taglineColor}`}
            style={{ fontFamily: "var(--font-body, 'Inter', sans-serif)" }}
          >
            Manage Your Priorities
          </span>
        )}
      </div>
    </div>
  );
}

