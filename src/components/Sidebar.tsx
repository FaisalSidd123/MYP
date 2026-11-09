"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import MypLogo from "@/components/brand/MypLogo";
import { isUserAdmin } from "@/lib/adminCheck";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isAdmin = isUserAdmin(user?.email);

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

        {/* Admin Command Center Link */}
        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
            <span className="px-3.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Administration
            </span>
            <Link
              href="/admin"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-purple-950 text-white shadow-xs"
                  : "text-purple-800 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[19px]">admin_panel_settings</span>
                <span>Admin Portal</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-sm bg-purple-200 text-purple-900 text-[9px] font-mono font-extrabold">
                ADMIN
              </span>
            </Link>
          </div>
        )}
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
