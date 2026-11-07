"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import MypLogo from "@/components/brand/MypLogo";

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
      {/* Attractive MYP Brand Header with interactive Convergence Y logo */}
      <Link href="/dashboard" className="mb-7 px-2 block group">
        <MypLogo size={38} variant="full" showTagline={true} />
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
