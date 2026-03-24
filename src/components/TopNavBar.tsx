/* eslint-disable */
"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function TopNavBar() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-[#070d1f]/30 backdrop-blur-md flex justify-between items-center px-8 text-sm font-medium">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] text-lg">search</span>
          <input 
            className="w-full bg-[var(--color-surface-container-lowest)] border-none rounded-full py-2 pl-11 pr-4 text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/40 transition-all" 
            placeholder="Search contacts, tasks, or events..." 
            type="text" 
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-[#a5aac2] hover:text-[#dfe4fe] hover:bg-[#171f36]/40 rounded-full p-2 transition-colors duration-200 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-primary)] rounded-full border-2 border-[var(--color-background)]"></span>
        </button>
        <div className="h-8 w-[1px] bg-[var(--color-outline-variant)]/20 mx-2"></div>
        <div className="flex items-center gap-3 pl-2 border-r border-[var(--color-outline-variant)]/20 pr-4">
          <div className="text-right">
            <p className="text-xs font-bold text-[var(--color-on-surface)]">{user?.displayName || "Architect User"}</p>
            <p className="text-[10px] text-[var(--color-on-surface-variant)]">{user?.email || "Admin Access"}</p>
          </div>
          <img 
            alt="User Profile Avatar" 
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-[var(--color-primary)]/20" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC2_m45ACW1-T_eXUTaDdCProXIAOl_FWMlu7a6k-OyahsmiTBGPlUTyBz1Li3kejS6Z87vJmjRjfnze13CfWy_c5RnDjSWG-n-rW5-3WL_GllwpHp-zksYMf7I_6tWImVdSUPdRiUYcsUSi8nP1SXLGGZfUeLt_Bg_4OW_77sPVu77RyRq5RlFnXUX6KJqECJ-OaOGXsa1J5DRTf1EoYxq6HfqwimDzmogpjvxtGOczSSh5GK2sAaMv_I606Kl2NhkB-z2nR-uPEy"
          />
        </div>
        <button 
          onClick={signOut}
          className="text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-full p-2 transition-colors duration-200"
          title="Sign Out"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}
