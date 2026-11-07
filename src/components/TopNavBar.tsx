"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import NotificationsDropdown from "./NotificationsDropdown";

export default function TopNavBar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/contacts?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getInitials = () => {
    if (user?.displayName) {
      const parts = user.displayName.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.displayName.slice(0, 2).toUpperCase();
    }
    return "MYP";
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 flex justify-between items-center px-8 text-sm font-medium">
      <form onSubmit={handleSearchSubmit} className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <button
            type="submit"
            className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-[18px] transition-colors cursor-pointer"
          >
            search
          </button>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-2xs"
            placeholder="Search contacts, leads, deals, or tasks (press Enter)..."
            type="text"
          />
        </div>
      </form>
      <div className="flex items-center gap-4">
        <NotificationsDropdown />
        <div className="h-6 w-[1px] bg-slate-200 mx-1" />
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900 leading-tight">{user?.displayName || "Active User"}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user?.email || "MYP Workspace"}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs font-mono">
            {getInitials()}
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl p-2 transition-colors duration-150 cursor-pointer"
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  );
}
