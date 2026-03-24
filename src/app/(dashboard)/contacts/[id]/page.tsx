/* eslint-disable */
import React from 'react';

export default function ContactProfilePage() {
  return (
    <>
      

<header className="flex justify-between items-center w-full px-12 py-6 sticky top-0 bg-[#070d1f]/80 backdrop-blur-xl z-30">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant tracking-wider uppercase">
<a className="hover:text-primary transition-colors" href="#">Contacts</a>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-on-surface">Jane Doe</span>
</div>
<h1 className="text-2xl font-black tracking-tighter text-[#dfe4fe]">Contact Profile</h1>
</div>
<div className="flex items-center gap-4">
<button className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface text-sm font-semibold hover:bg-surface-bright transition-all active:scale-95">
                    Edit
                </button>
<button className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dim text-on-primary text-sm font-bold shadow-[0_0_15px_rgba(163,166,255,0.2)] hover:scale-[1.02] transition-all active:scale-95">
                    Send Message
                </button>
<div className="w-[1px] h-6 bg-outline-variant/20 mx-2"></div>
<button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
<span className="material-symbols-outlined">settings</span>
</button>
</div>
</header>
<div className="px-12 pb-12 flex flex-col gap-8">

<section className="glass-card rounded-2xl p-8 flex items-center gap-8 relative overflow-hidden group">
<div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
<div className="relative">
<div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/20 p-1 bg-surface">
<img alt="Jane Doe" className="w-full h-full object-cover rounded-xl" data-alt="professional portrait of a confident woman with dark hair in a sleek office setting, soft cinematic lighting, corporate leadership style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe9BBZuML_T2cAkagrQf3tiOCCuwImFJMDKY0jTZSJ-_NAKtoF1YymlZqPzjN95hZa_LTldBhezbh1Url8MxybLEL6dqCUTPktsGo4fn7GSXNoGXQrcVrTEL5CRnTzx5G-8PW2--_90M8osG-sTEDHkau5yUJh7_PX86iwj3HqAvwKiH9o5h2gO4UoYJRZ6-bxiH_fRFDmZmUuEsCEx4cEKCVzoJvP0HMgJagttLe4sPIS649SceGYVgcAqsfyBwxoaWtSy-lj8Whp"/>
</div>
<div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-surface flex items-center justify-center">
<div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
</div>
</div>
<div className="flex-1">
<div className="flex items-center gap-4 mb-2">
<h2 className="text-3xl font-bold tracking-tight text-on-surface">Jane Doe</h2>
<div className="flex gap-2">
<span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold tracking-wider uppercase border border-amber-500/20">VIP</span>
<span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase border border-primary/20">Tech</span>
<span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold tracking-wider uppercase border border-green-500/20">Client</span>
</div>
</div>
<p className="text-on-surface-variant font-medium text-lg mb-6">Marketing Director at <span className="text-on-surface">Aether Systems</span></p>
<div className="flex items-center gap-8">
<div className="flex items-center gap-3 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-primary">mail</span>
                            jane.doe@aethersystems.io
                        </div>
<div className="flex items-center gap-3 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-primary">call</span>
                            +1 (555) 234-8890
                        </div>
<div className="flex items-center gap-3 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-primary">location_on</span>
                            San Francisco, CA
                        </div>
</div>
</div>
<div className="flex flex-col gap-2">
<div className="text-right">
<p className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-1">Total Value</p>
<p className="text-2xl font-black text-primary tracking-tighter">$42,500</p>
</div>
<div className="text-right">
<p className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-1">Lead Score</p>
<p className="text-2xl font-black text-on-surface tracking-tighter">98<span className="text-sm font-normal text-on-surface-variant ml-1">/100</span></p>
</div>
</div>
</section>

<div className="grid grid-cols-3 gap-8">

<section className="col-span-2 flex flex-col gap-6">
<div className="flex justify-between items-end">
<h3 className="text-lg font-bold tracking-tight">Activity Pulse</h3>
<button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline transition-all">View All History</button>
</div>
<div className="glass-card rounded-2xl p-8 relative">
<div className="absolute left-[39px] top-12 bottom-12 w-[2px] activity-line"></div>
<div className="space-y-12">

<div className="flex gap-6 relative group">
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center z-10 shadow-[0_0_15px_rgba(147,150,255,0.3)]">
<span className="material-symbols-outlined text-on-primary-container text-sm">mail</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">Campaign Email Sent</h4>
<span className="text-xs text-on-surface-variant">Today, 10:45 AM</span>
</div>
<p className="text-sm text-on-surface-variant leading-relaxed">Sent "Product Roadmap Q4" presentation. Email tracked and opened 3 times within the first hour.</p>
</div>
</div>

<div className="flex gap-6 relative group">
<div className="w-8 h-8 rounded-full bg-surface-bright border border-outline-variant/30 flex items-center justify-center z-10">
<span className="material-symbols-outlined text-secondary text-sm">call</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<h4 className="font-bold text-on-surface">Outbound Call Log</h4>
<span className="text-xs text-on-surface-variant">Yesterday, 2:15 PM</span>
</div>
<p className="text-sm text-on-surface-variant leading-relaxed">Duration: 12m 45s. Discussed contract renewal terms. Jane requested a follow-up on pricing tiers.</p>
</div>
</div>

<div className="flex gap-6 relative group">
<div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center z-10">
<span className="material-symbols-outlined text-green-500 text-sm">groups</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<h4 className="font-bold text-on-surface">In-Person Meeting Completed</h4>
<span className="text-xs text-on-surface-variant">Oct 12, 2023</span>
</div>
<p className="text-sm text-on-surface-variant leading-relaxed">Quarterly Strategy Review at Aether HQ. Identified 3 new upsell opportunities for the dev team.</p>
<div className="mt-3 flex gap-2">
<span className="px-2 py-1 rounded bg-surface-variant text-[10px] text-on-surface-variant border border-outline-variant/20">STRATEGY_DECK.PDF</span>
<span className="px-2 py-1 rounded bg-surface-variant text-[10px] text-on-surface-variant border border-outline-variant/20">NOTES_V2.DOCX</span>
</div>
</div>
</div>

<div className="flex gap-6 relative group opacity-60">
<div className="w-8 h-8 rounded-full bg-surface-bright border border-outline-variant/30 flex items-center justify-center z-10">
<span className="material-symbols-outlined text-on-surface-variant text-sm">task_alt</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<h4 className="font-bold text-on-surface">Initial Discovery Call</h4>
<span className="text-xs text-on-surface-variant">Sep 28, 2023</span>
</div>
<p className="text-sm text-on-surface-variant leading-relaxed">Qualified lead as Marketing Director. High intent for enterprise migration.</p>
</div>
</div>
</div>
</div>
</section>

<aside className="col-span-1 flex flex-col gap-8">

<div className="flex flex-col gap-4">
<h3 className="text-lg font-bold tracking-tight">Upcoming</h3>
<div className="glass-card rounded-2xl p-6 border-l-4 border-primary">
<div className="flex justify-between items-start mb-3">
<div>
<h4 className="font-bold text-on-surface">Pricing Review</h4>
<p className="text-xs text-primary font-medium">Tomorrow at 9:00 AM</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant text-sm">video_camera_front</span>
</div>
<p className="text-xs text-on-surface-variant mb-4">Google Meet • 30 mins</p>
<button className="w-full bg-surface-bright hover:bg-surface-variant py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-on-surface transition-all">Prepare Meeting</button>
</div>
</div>

<div className="flex flex-col gap-4">
<h3 className="text-lg font-bold tracking-tight">Quick Notes</h3>
<div className="glass-card rounded-2xl p-6">
<textarea className="w-full bg-surface-container-lowest border-none rounded-xl p-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/40 min-h-[160px] resize-none mb-4" placeholder="Jot down a quick thought or internal note about Jane..."></textarea>
<button className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(163,166,255,0.15)] hover:scale-[1.02] active:scale-95 transition-all">
                                Save Note
                            </button>
</div>
</div>

<div className="glass-card rounded-2xl p-6">
<h4 className="text-[10px] font-black text-on-surface-variant tracking-widest uppercase mb-4">Associated With</h4>
<div className="space-y-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-[#222b47] flex items-center justify-center">
<span className="material-symbols-outlined text-primary">corporate_fare</span>
</div>
<div>
<p className="text-sm font-bold text-on-surface">Aether Systems</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Primary Organization</p>
</div>
</div>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-[#222b47] flex items-center justify-center">
<span className="material-symbols-outlined text-secondary">account_tree</span>
</div>
<div>
<p className="text-sm font-bold text-on-surface">Q4 Expansion</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Current Project</p>
</div>
</div>
</div>
</div>
</aside>
</div>
</div>

    </>
  );
}
