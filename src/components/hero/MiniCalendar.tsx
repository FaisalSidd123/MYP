"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CALENDAR_DAYS } from "./sampleData";

interface MiniCalendarProps {
  hasEventScheduled?: boolean;
}

export default function MiniCalendar({ hasEventScheduled = false }: MiniCalendarProps) {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-3 shadow-xs select-none">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-slate-500 text-[14px]">calendar_month</span>
          <span className="text-[10px] font-bold text-slate-800 tracking-tight font-sans">
            Schedule Stream
          </span>
        </div>
        <span className="text-[8px] font-mono font-bold text-slate-400">THIS WEEK</span>
      </div>

      {/* 5 Day Column Strip */}
      <div className="grid grid-cols-5 gap-1.5">
        {CALENDAR_DAYS.map((day) => {
          const isTargetDay = day === "Wed";

          return (
            <div
              key={day}
              className={`rounded-xl p-1.5 flex flex-col items-center justify-between min-h-[58px] transition-colors border ${
                isTargetDay && hasEventScheduled
                  ? "bg-indigo-50/60 border-indigo-200/90"
                  : "bg-slate-50/60 border-slate-100"
              }`}
            >
              <span className="text-[8px] font-bold uppercase font-mono text-slate-400">{day}</span>

              {/* Scheduled Event on Wednesday */}
              {isTargetDay && (
                <AnimatePresence>
                  {hasEventScheduled && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 280, damping: 20 }}
                      className="w-full p-1 rounded-lg bg-indigo-600 text-white shadow-xs text-center flex flex-col items-center justify-center gap-0.5"
                    >
                      <div className="flex items-center justify-center gap-1">
                        {/* Wiggling bell icon */}
                        <motion.span
                          animate={{ rotate: [0, -18, 18, -12, 12, 0] }}
                          transition={{ duration: 0.5, delay: 0.15 }}
                          className="material-symbols-outlined text-[10px]"
                        >
                          notifications_active
                        </motion.span>
                        <span className="text-[7px] font-bold font-mono tracking-tight truncate max-w-[42px]">
                          Site Visit
                        </span>
                      </div>
                      <span className="text-[6.5px] font-mono text-indigo-100 truncate max-w-[44px]">
                        Ahmed · 3 PM
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {!isTargetDay && <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mb-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

