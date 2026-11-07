"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Contacts & Leads", href: "/contacts", icon: "group" },
    { label: "Niche Verticals", href: "/niches", icon: "category" },
    { label: "Schedule", href: "/schedule", icon: "calendar_today" },
    { label: "Tasks Board", href: "/tasks", icon: "fact_check" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white border-r border-slate-200 flex flex-col p-4 space-y-2 z-50 antialiased tracking-tight shadow-xs">
      {/* Attractive MYP Brand Header */}
      <Link href="/dashboard" className="mb-8 px-2 flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 shrink-0">
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-br from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent font-mono">
            MYP
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-none" style={{ fontFamily: "var(--font-headline)" }}>
              MYP
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="System Active" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium tracking-tight truncate mt-0.5">
            Manage Your Priorities
          </p>
        </div>
      </Link>

      {/* Nav List */}
      <nav className="flex-1 space-y-1">
        {navLinks.map((item) => {
          const isActive = pathname === item.href || (item.href === "/niches" && pathname.startsWith("/niches"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
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
          className="flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-xl text-xs font-medium"
          href="/mfa/setup"
        >
          <span className="material-symbols-outlined text-[19px]">shield</span>
          <span>Security & 2FA</span>
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl text-xs font-medium text-left cursor-pointer"
        >
          <span className="material-symbols-outlined text-[19px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
