import Link from "next/link";
import React from "react";

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#0c1326]/40 backdrop-blur-xl flex flex-col p-4 space-y-2 z-50 antialiased tracking-tight shadow-[0_0_15px_rgba(163,166,255,0.05)]">
       <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center text-color-on-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-[#dfe4fe]">ContactHub</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] font-bold">Management Suite</p>
          </div>
       </div>
       <nav className="flex-1 space-y-1">
          <Link className="flex items-center gap-3 px-4 py-3 text-[#dfe4fe] bg-[#171f36] rounded-xl font-semibold transition-all duration-300 scale-102 active:scale-98" href="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-[#a5aac2] hover:text-[#dfe4fe] hover:bg-[#222b47]/50 transition-all duration-300 rounded-xl" href="/contacts">
            <span className="material-symbols-outlined">group</span>
            <span>Contacts</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-[#a5aac2] hover:text-[#dfe4fe] hover:bg-[#222b47]/50 transition-all duration-300 rounded-xl" href="/schedule">
            <span className="material-symbols-outlined">calendar_today</span>
            <span>Schedule</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-[#a5aac2] hover:text-[#dfe4fe] hover:bg-[#222b47]/50 transition-all duration-300 rounded-xl" href="/tasks">
            <span className="material-symbols-outlined">fact_check</span>
            <span>Tasks</span>
          </Link>
       </nav>
       <div className="pt-4 border-t border-[var(--color-outline-variant)]/10 space-y-1">
          <Link className="flex items-center gap-3 px-4 py-3 text-[#a5aac2] hover:text-[#dfe4fe] hover:bg-[#222b47]/50 transition-all duration-300 rounded-xl" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-[#a5aac2] hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 rounded-xl" href="#">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </Link>
       </div>
    </aside>
  );
}
