"use client";

import React from "react";
import { motion } from "framer-motion";
import { ProjectItem } from "./sampleData";

interface MiniProjectCardProps {
  project: ProjectItem;
  progressOverride?: number;
  showExtraAvatar?: boolean;
}

export default function MiniProjectCard({
  project,
  progressOverride,
  showExtraAvatar = false,
}: MiniProjectCardProps) {
  const currentProgress = progressOverride !== undefined ? progressOverride : project.progress;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-3 shadow-xs select-none">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[14px]">apartment</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-900 truncate leading-tight font-sans">
              {project.name}
            </p>
            <p className="text-[8px] text-slate-400 font-mono truncate">{project.phase}</p>
          </div>
        </div>

        {/* Avatars Stack */}
        <div className="flex items-center -space-x-1.5 shrink-0 pl-1">
          {project.avatars.map((initials, idx) => (
            <div
              key={idx}
              className="w-5 h-5 rounded-full bg-slate-900 border border-white text-white font-mono font-bold text-[7px] flex items-center justify-center shadow-2xs"
            >
              {initials}
            </div>
          ))}

          {/* Animated extra avatar entering on timeline step 5 */}
          {showExtraAvatar && (
            <motion.div
              initial={{ scale: 0, x: 8, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-5 h-5 rounded-full bg-emerald-600 border border-white text-white font-mono font-bold text-[7px] flex items-center justify-center shadow-2xs"
              title="Assigned Partner"
            >
              UT
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] font-mono">
          <span className="text-slate-400">Milestone Phase</span>
          <motion.span
            key={currentProgress}
            initial={{ scale: 1.15, color: "#4F46E5" }}
            animate={{ scale: 1, color: "#0F172A" }}
            transition={{ duration: 0.3 }}
            className="font-bold font-mono"
          >
            {currentProgress}%
          </motion.span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            initial={{ width: `${project.progress}%` }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-xs"
          />
        </div>
      </div>
    </div>
  );
}

