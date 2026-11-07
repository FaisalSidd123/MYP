"use client";

import React from "react";
import { motion } from "framer-motion";
import { InputChipItem } from "./sampleData";

interface InputChipProps {
  chip: InputChipItem;
  style?: React.CSSProperties;
  className?: string;
  isFlying?: boolean;
}

export default function InputChip({ chip, style, className = "", isFlying = false }: InputChipProps) {
  return (
    <motion.div
      style={style}
      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.1)] transition-shadow select-none will-change-transform ${
        isFlying ? "pointer-events-none ring-2 ring-indigo-500/30" : ""
      } ${className}`}
    >
      {/* Icon pill */}
      <div
        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${chip.color} text-white flex items-center justify-center shrink-0 shadow-2xs`}
      >
        <span className="material-symbols-outlined text-[15px]">{chip.icon}</span>
      </div>

      {/* Chip Content */}
      <div className="min-w-0 pr-1">
        <div className="flex items-center gap-1.5 leading-none">
          <p className="text-[11px] font-bold text-slate-900 truncate max-w-[130px] font-sans">
            {chip.title}
          </p>
          {chip.badge && (
            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
              {chip.badge}
            </span>
          )}
        </div>
        <p className="text-[9px] text-slate-400 font-mono truncate max-w-[150px] mt-0.5">
          {chip.subtitle}
        </p>
      </div>

      {/* Micro Status Dot */}
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 ml-auto" />
    </motion.div>
  );
}

