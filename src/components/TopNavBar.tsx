"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";

export default function TopNavBar() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 flex justify-between items-center px-8 text-sm font-medium">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            placeholder="Search contacts, deals, tasks, or appointments..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationsDropdown />
        <div className="h-6 w-[1px] bg-slate-200 mx-1" />
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900">{user?.displayName || "Verified User"}</p>
            <p className="text-[10px] text-slate-500 font-mono">{user?.email || "Admin Access"}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : "CH"}
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors duration-150"
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  );
}
