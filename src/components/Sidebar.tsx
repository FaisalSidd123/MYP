"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Contacts & Leads", href: "/contacts", icon: "group" },
    { label: "Niche Verticals", href: "/niches", icon: "category" },
    { label: "Schedule", href: "/schedule", icon: "calendar_today" },
    { label: "Tasks Board", href: "/tasks", icon: "fact_check" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white border-r border-slate-200 flex flex-col p-4 space-y-2 z-50 antialiased tracking-tight shadow-xs">
      {/* Brand Header */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            hub
          </span>
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900">ContactHub</h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-medium">Management Suite</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Utilities */}
      <div className="pt-4 border-t border-slate-200 space-y-1">
        <Link
          className="flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-lg text-xs font-medium"
          href="#"
        >
          <span className="material-symbols-outlined text-[19px]">settings</span>
          <span>Settings</span>
        </Link>
        <Link
          className="flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg text-xs font-medium"
          href="/login"
        >
          <span className="material-symbols-outlined text-[19px]">logout</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
