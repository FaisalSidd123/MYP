"use client";
import React from 'react';
import Link from 'next/link';

export default function ContactProfilePage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/contacts" className="hover:text-slate-900 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Contacts
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Jane Doe</span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all">
            Edit Contact
          </button>
          <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs">
            Send Message
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-2xl text-slate-800 shadow-xs">
              JD
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
                Jane Doe
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold tracking-wider uppercase font-mono">
                VIP Client
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold tracking-wider uppercase font-mono">
                Active
              </span>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mb-3">
              Marketing Director at <span className="font-semibold text-slate-900">Aether Systems</span>
            </p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                <span>jane.doe@aethersystems.io</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">call</span>
                <span className="font-mono">+1 (555) 234-8890</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          <div className="flex md:flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0 w-full md:w-auto justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono mb-0.5">Pipeline Value</p>
              <p className="text-xl font-extrabold text-slate-900 font-mono">$42,500</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono mb-0.5">Lead Score</p>
              <p className="text-xl font-extrabold text-slate-900 font-mono">98<span className="text-xs font-normal text-slate-400">/100</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Activity Pulse & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Timeline (2 cols) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-headline)" }}>
                Activity Pulse
              </h3>
              <span className="text-xs text-slate-500 font-mono">4 interactions recorded</span>
            </div>

            <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
              
              <div className="relative">
                <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-indigo-50 border-2 border-indigo-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-slate-900">Campaign Email Sent</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Today, 10:45 AM</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sent &ldquo;Product Roadmap Q4&rdquo; presentation. Email opened 3 times within the first hour.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-slate-900">Outbound Call Log</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Yesterday, 2:15 PM</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Duration: 12m 45s. Discussed contract renewal terms. Jane requested a follow-up on pricing tiers.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-slate-900">In-Person Meeting Completed</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Oct 12, 2024</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Quarterly Strategy Review at Aether HQ. Identified 3 new upsell opportunities.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Right Sidebar (1 col) */}
        <aside className="space-y-5">
          {/* Upcoming Event */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs border-l-4 border-l-indigo-600">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider font-mono">Upcoming Meeting</span>
            <h4 className="text-xs font-bold text-slate-900 mt-1">Pricing Review</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Tomorrow at 9:00 AM • Google Meet</p>
            <button className="mt-3 w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors">
              Prepare Meeting
            </button>
          </div>

          {/* Quick Notes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Quick Notes</h4>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 min-h-[120px] resize-none mb-3"
              placeholder="Jot down a quick thought or internal note about Jane..."
            ></textarea>
            <button className="w-full bg-slate-900 text-white py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs">
              Save Note
            </button>
          </div>

          {/* Associated Entity */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono block mb-3">Organization</span>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Aether Systems</p>
                <p className="text-[10px] text-slate-400">Primary Enterprise Account</p>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
