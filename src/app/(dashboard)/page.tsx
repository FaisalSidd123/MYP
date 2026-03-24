/* eslint-disable */
import React from 'react';

export default function DashboardPage() {
  return (
    <>
      {/* Welcome Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)] mb-1">Morning, Architect.</h2>
          <p className="text-[var(--color-on-surface-variant)]">Here's what's happening in your network today.</p>
        </div>
        <button className="primary-gradient text-[var(--color-on-primary)] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
          <span className="material-symbols-outlined">add</span>
          New Contact
        </button>
      </header>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Card 1 */}
        <div className="glass-card ghost-border p-6 rounded-2xl group hover:bg-[var(--color-surface-bright)]/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-green-400">trending_up</span>
              +12%
            </span>
          </div>
          <h3 className="text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider mb-1">Total Contacts</h3>
          <p className="text-3xl font-black text-[var(--color-on-surface)] tracking-tighter">1,248</p>
        </div>

        {/* Card 2 */}
        <div className="glass-card ghost-border p-6 rounded-2xl group hover:bg-[var(--color-surface-bright)]/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[var(--color-tertiary)]/10 rounded-xl text-[var(--color-tertiary)]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Live Today</span>
          </div>
          <h3 className="text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider mb-1">Scheduled Today</h3>
          <p className="text-3xl font-black text-[var(--color-on-surface)] tracking-tighter">12</p>
        </div>

        {/* Card 3 */}
        <div className="glass-card ghost-border p-6 rounded-2xl group hover:bg-[var(--color-surface-bright)]/40 transition-all duration-300 border-l-4 border-l-[var(--color-error)]/30">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[var(--color-error)]/10 rounded-xl text-[var(--color-error)]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-error-dim)]">Urgent</span>
          </div>
          <h3 className="text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider mb-1">Pending Approvals</h3>
          <p className="text-3xl font-black text-[var(--color-on-surface)] tracking-tighter">3</p>
        </div>

        {/* Card 4 */}
        <div className="glass-card ghost-border p-6 rounded-2xl group hover:bg-[var(--color-surface-bright)]/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-400/10 rounded-xl text-green-400">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">This Week</span>
          </div>
          <h3 className="text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider mb-1">Completed</h3>
          <p className="text-3xl font-black text-[var(--color-on-surface)] tracking-tighter">45</p>
        </div>
      </div>

      {/* Main Dashboard Split */}
      <div className="grid grid-cols-12 gap-8">
        {/* Recent Activity Feed (8 cols) */}
        <div className="col-span-12 lg:col-span-8 bg-[var(--color-surface-container-low)] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-bold text-[var(--color-on-surface)]">Recent activity</h3>
            <button className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-8 relative z-10">
            {/* Activity Item 1 */}
            <div className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[var(--color-primary)]/20 group-hover:ring-[var(--color-primary)] transition-all duration-500">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEU-iu3N91MaSerWpRBMEUKTEbYvsTxeCOPw7DUciXOsCg9KzwXn9x78FbCdQX66i53saIr_lktrceOqUxppCeIkqPiYDq0hxDJiK4nZ2lLroUnawF33xxQe-vIa8hRC-TJ3mSJ93S0JuShYT32I1AUbsKqXKEUeU08nua3i-3Qn3IQ3DsONVZxoD57XqBvHG84DC_0Aw0kQM4-8VJUPEEE5Oa-hz3dLRUHo3yB54wofdvAsky9L2saS6cfcynKVnbndJS3_s_b_R4" alt="User Avatar" />
                </div>
                <div className="w-[2px] flex-1 activity-line mt-4"></div>
              </div>
              <div className="pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[var(--color-on-surface)]">Jordan Vane</span>
                  <span className="text-[var(--color-on-surface-variant)] text-xs">• Added to Project Orion</span>
                </div>
                <p className="text-[var(--color-on-surface-variant)] text-sm mb-3">Updated contact details and linked to the new Q4 marketing campaign database.</p>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]/60 uppercase tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    2 hours ago
                  </span>
                  <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]/60 uppercase tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    San Francisco, CA
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[var(--color-primary)]/20 group-hover:ring-[var(--color-primary)] transition-all duration-500">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7d9TckHTbdNd9sQpWZwQbzEjvdo6aYrmBRHz2ZqYYUUJygJ-NsdsYLCejwyUBXHrbAWlZFSZj9ekbM4sRs3UqbSdQd9MiFVgIXcrdYSbqrCc4ZRVgk3TT97aXbpEmrU-QAPhrmqaqbdwOOJQCn7etHUs9rrDG9vL6rzMoDfVstFann8_u_MDzrwaSq4409FNT7eokyAmsQz62-t8zo5xMeMKoHFGh91Phsn509njc3qKF5QAk4_C07xog-Fv8WNQrUWFD5ZGjzKnY" alt="User Avatar" />
                </div>
                <div className="w-[2px] flex-1 activity-line mt-4"></div>
              </div>
              <div className="pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[var(--color-on-surface)]">Sarah Connor</span>
                  <span className="text-[var(--color-on-surface-variant)] text-xs">• Completed Task</span>
                </div>
                <p className="text-[var(--color-on-surface-variant)] text-sm mb-3">"Final review of the architectural blueprints for the downtown hub."</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-green-400/10 text-green-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    SUCCESS
                  </span>
                  <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]/60 uppercase tracking-widest flex items-center gap-1 ml-2">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    5 hours ago
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[var(--color-primary)]/20 group-hover:ring-[var(--color-primary)] transition-all duration-500">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE2sS-9GFjn_0QQmt0OM4HFSyxgO6kQWKvQYg7BAF970c8O4VcL05NlEvyy0h8U_Kj07JhUmNeoNxkgG7FqvMDs1RVhVhm037qKtKU05nHbmEwd7a3LOpaysO062v8mAdoJjn6iB1IyU7nvasnE_k8TsAFnkX9w4-q6iiTplH0Rk-VFXezHKkN7wnejEmPfVIRkn_kQp22_SpT1cfFyrYNLfn1LcGuskROnlp7teYG12gWqsCJDmsNaIbOT9S0aorN02ibEkJCOxTN" alt="User Avatar" />
                </div>
              </div>
              <div className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[var(--color-on-surface)]">Mark Thompson</span>
                  <span className="text-[var(--color-on-surface-variant)] text-xs">• New Meeting Scheduled</span>
                </div>
                <p className="text-[var(--color-on-surface-variant)] text-sm mb-3">Topic: Quarterly Performance Review. Participants: 4.</p>
                <div className="text-[10px] font-bold text-[var(--color-on-surface-variant)]/60 uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  Yesterday
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Calendar & Sidebar Widget (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Mini Calendar Widget */}
          <div className="glass-card ghost-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[var(--color-on-surface)]">October 2023</h3>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-[var(--color-surface-bright)] rounded text-[var(--color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="p-1 hover:bg-[var(--color-surface-bright)] rounded text-[var(--color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-4">
              <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]">M</span>
              <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]">T</span>
              <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]">W</span>
              <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]">T</span>
              <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]">F</span>
              <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]">S</span>
              <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]">S</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              <span className="p-2 text-xs text-[var(--color-on-surface-variant)]/20">28</span>
              <span className="p-2 text-xs text-[var(--color-on-surface-variant)]/20">29</span>
              <span className="p-2 text-xs text-[var(--color-on-surface-variant)]/20">30</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">1</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">2</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">3</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">4</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">5</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">6</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">7</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">8</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">9</span>
              <span className="p-2 text-xs primary-gradient text-[var(--color-on-primary)] rounded-lg font-bold">10</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer relative">11 <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--color-primary)] rounded-full"></span></span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">12</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">13</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer relative">14 <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--color-tertiary)] rounded-full"></span></span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">15</span>
              <span className="p-2 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] rounded-lg cursor-pointer">16</span>
            </div>
          </div>

          {/* Upcoming Widget */}
          <div className="bg-[var(--color-surface-container-high)] rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--color-primary)]/10 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/20 transition-all"></div>
            <h3 className="font-bold text-[var(--color-on-surface)] mb-6">Today's Schedule</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4 p-3 bg-[var(--color-surface-container-lowest)]/50 rounded-xl ghost-border">
                <div className="text-center min-w-[40px]">
                  <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase">10:00</p>
                  <p className="text-[8px] text-[var(--color-on-surface-variant)]">AM</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[var(--color-on-surface)]">Client Kickoff</p>
                  <p className="text-[10px] text-[var(--color-on-surface-variant)]">Zoom Meeting</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-[var(--color-surface-container-lowest)]/50 rounded-xl ghost-border">
                <div className="text-center min-w-[40px]">
                  <p className="text-[10px] font-bold text-[var(--color-tertiary)] uppercase">01:30</p>
                  <p className="text-[8px] text-[var(--color-on-surface-variant)]">PM</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[var(--color-on-surface)]">Internal Sync</p>
                  <p className="text-[10px] text-[var(--color-on-surface-variant)]">Main Office</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB Action */}
      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full primary-gradient text-[var(--color-on-primary)] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'opsz' 32, 'wght' 600" }}>edit_square</span>
      </button>
    </>
  );
}
