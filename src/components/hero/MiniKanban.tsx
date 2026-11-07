"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KanbanCardItem } from "./sampleData";

interface MiniKanbanProps {
  columns: Record<"new" | "contacted" | "qualified" | "won", KanbanCardItem[]>;
  isNewLeadLanding?: boolean;
}

const COLUMN_CONFIG: Array<{ key: "new" | "contacted" | "qualified" | "won"; label: string; dotColor: string }> = [
  { key: "new", label: "New", dotColor: "bg-indigo-500" },
  { key: "contacted", label: "Contacted", dotColor: "bg-blue-500" },
  { key: "qualified", label: "Qualified", dotColor: "bg-amber-500" },
  { key: "won", label: "Won", dotColor: "bg-emerald-500" },
];

export default function MiniKanban({ columns, isNewLeadLanding = false }: MiniKanbanProps) {
  return (
    <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-3 shadow-xs select-none">
      {/* Kanban Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-slate-500 text-[15px]">view_kanban</span>
          <span className="text-[11px] font-bold text-slate-800 tracking-tight font-sans">
            Leads Pipeline
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
          LIVE AUDIT
        </span>
      </div>

      {/* 4 Column Kanban Grid */}
      <div className="grid grid-cols-4 gap-2">
        {COLUMN_CONFIG.map(({ key, label, dotColor }) => {
          const items = columns[key] || [];

          return (
            <div key={key} className="flex flex-col bg-slate-50/70 border border-slate-100 rounded-xl p-1.5 min-h-[96px]">
              {/* Column Title + Counter */}
              <div className="flex items-center justify-between mb-1.5 px-1">
                <div className="flex items-center gap-1 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
                  <span className="text-[9px] font-bold text-slate-600 uppercase font-mono truncate">
                    {label}
                  </span>
                </div>
                <motion.span
                  key={items.length}
                  initial={{ scale: 1.3, color: "#4F46E5" }}
                  animate={{ scale: 1, color: "#64748B" }}
                  transition={{ duration: 0.3 }}
                  className="text-[9px] font-mono font-bold text-slate-500 px-1 py-0.2 rounded bg-white border border-slate-200 shrink-0"
                >
                  {items.length}
                </motion.span>
              </div>

              {/* Cards in this column */}
              <div className="space-y-1.5 flex-1">
                <AnimatePresence mode="popLayout">
                  {items.map((card) => (
                    <motion.div
                      layout
                      layoutId={`kanban-${card.id}`}
                      key={card.id}
                      initial={{ scale: 0.85, opacity: 0, y: -4 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 240,
                        damping: 22,
                      }}
                      className={`relative p-2 rounded-lg bg-white border shadow-2xs transition-colors ${
                        card.highlight || (key === "new" && isNewLeadLanding)
                          ? "border-indigo-400 ring-2 ring-indigo-100"
                          : "border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 leading-none mb-1">
                        <span className="text-[10px] font-bold text-slate-900 truncate font-sans">
                          {card.name}
                        </span>
                        {key === "won" ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-ping" />
                        ) : (
                          <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                            {card.dealScore}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono">
                        <span className="truncate max-w-[48px]">{card.company}</span>
                        <span className="font-bold text-slate-700">{card.value}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

