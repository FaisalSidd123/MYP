export type LeadStatusKey =
  | 'new'
  | 'contacted'
  | 'demo_required'
  | 'demo_sent'
  | 'follow_up'
  | 'negotiation'
  | 'postponed'
  | 'won'
  | 'lost';

export interface LeadStatusMeta {
  id: LeadStatusKey;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  category: 'inbox' | 'active' | 'closed';
  badgeClasses: string;
  dotColor: string;
  accentColor: string;
}

export const LEAD_STATUSES: LeadStatusMeta[] = [
  {
    id: 'new',
    label: 'New Lead',
    shortLabel: 'NEW',
    icon: 'fiber_new',
    description: 'Fresh lead not yet contacted',
    category: 'inbox',
    badgeClasses: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    dotColor: 'bg-amber-500',
    accentColor: '#f59e0b',
  },
  {
    id: 'contacted',
    label: 'Contacted',
    shortLabel: 'CONTACTED',
    icon: 'call_made',
    description: 'Initial outreach made via phone, email, or message',
    category: 'active',
    badgeClasses: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100',
    dotColor: 'bg-sky-500',
    accentColor: '#0284c7',
  },
  {
    id: 'demo_required',
    label: 'Demo Required',
    shortLabel: 'DEMO REQ',
    icon: 'ondemand_video',
    description: 'Prospect requested a walkthrough, presentation, or portfolio sample',
    category: 'active',
    badgeClasses: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
    dotColor: 'bg-purple-500',
    accentColor: '#9333ea',
  },
  {
    id: 'demo_sent',
    label: 'Demo Sent',
    shortLabel: 'DEMO SENT',
    icon: 'send_and_archive',
    description: 'Walkthrough video or pitch deck delivered; waiting for prospect review',
    category: 'active',
    badgeClasses: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100',
    dotColor: 'bg-indigo-500',
    accentColor: '#6366f1',
  },
  {
    id: 'follow_up',
    label: 'Follow-up Needed',
    shortLabel: 'FOLLOW UP',
    icon: 'history_toggle_off',
    description: 'Pending response; scheduled check-in required',
    category: 'active',
    badgeClasses: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100',
    dotColor: 'bg-teal-500',
    accentColor: '#0d9488',
  },
  {
    id: 'negotiation',
    label: 'Negotiation',
    shortLabel: 'NEGOTIATION',
    icon: 'handshake',
    description: 'Actively discussing pricing, deliverables, or package scope',
    category: 'active',
    badgeClasses: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100',
    dotColor: 'bg-orange-500',
    accentColor: '#ea580c',
  },
  {
    id: 'postponed',
    label: 'On Hold / Postponed',
    shortLabel: 'ON HOLD',
    icon: 'pause_circle',
    description: 'Interested but paused (e.g. looking forward after 2 weeks or next month)',
    category: 'active',
    badgeClasses: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
    dotColor: 'bg-slate-500',
    accentColor: '#64748b',
  },
  {
    id: 'won',
    label: 'Won / Closed',
    shortLabel: 'WON',
    icon: 'verified',
    description: 'Deal successfully closed; client onboarded or converted',
    category: 'closed',
    badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    dotColor: 'bg-emerald-500',
    accentColor: '#10b981',
  },
  {
    id: 'lost',
    label: 'Lost / Disqualified',
    shortLabel: 'LOST',
    icon: 'cancel',
    description: 'Prospect declined, budget mismatch, or no response',
    category: 'closed',
    badgeClasses: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100',
    dotColor: 'bg-rose-500',
    accentColor: '#f43f5e',
  },
];

/**
 * Normalizes any legacy or arbitrary status string into a valid LeadStatusKey.
 */
export function normalizeLeadStatus(status?: string | null): LeadStatusKey {
  if (!status) return 'new';
  const clean = status.trim().toLowerCase().replace(/[\s\-_]+/g, '_');

  switch (clean) {
    case 'approved':
    case 'completed':
    case 'won':
    case 'closed_won':
    case 'won_approved':
      return 'won';

    case 'inactive':
    case 'lost':
    case 'dropped':
    case 'closed_lost':
      return 'lost';

    case 'on_hold':
    case 'postponed':
    case 'delayed':
    case 'waiting':
      return 'postponed';

    case 'demo_required':
    case 'demo_req':
    case 'demo':
    case 'need_demo':
      return 'demo_required';

    case 'demo_sent':
    case 'demo_pitched':
    case 'pitched':
      return 'demo_sent';

    case 'follow_up':
    case 'followup':
    case 'follow_up_needed':
      return 'follow_up';

    case 'negotiation':
    case 'negotiating':
    case 'in_negotiation':
      return 'negotiation';

    case 'contacted':
    case 'called':
    case 'emailed':
      return 'contacted';

    case 'new':
    default:
      return 'new';
  }
}

/**
 * Returns metadata for a given status string.
 */
export function getLeadStatusMeta(status?: string | null): LeadStatusMeta {
  const normalized = normalizeLeadStatus(status);
  const found = LEAD_STATUSES.find((s) => s.id === normalized);
  return found || LEAD_STATUSES[0];
}

/**
 * Checks whether a lead is in an active pipeline stage.
 */
export function isLeadActive(status?: string | null): boolean {
  const norm = normalizeLeadStatus(status);
  return ['contacted', 'demo_required', 'demo_sent', 'follow_up', 'negotiation', 'postponed'].includes(norm);
}

/**
 * Checks whether a lead is won / approved.
 */
export function isLeadWon(status?: string | null): boolean {
  return normalizeLeadStatus(status) === 'won';
}

/**
 * Checks whether a lead is closed (won or lost).
 */
export function isLeadClosed(status?: string | null): boolean {
  const norm = normalizeLeadStatus(status);
  return norm === 'won' || norm === 'lost';
}

/**
 * Helpful scenario presets that sales reps or owners can click to auto-fill current scenario notes.
 */
export const QUICK_SCENARIO_PRESETS = [
  {
    label: 'Looking forward after 2 weeks',
    tag: '2 weeks',
    text: 'Client interested · Looking forward to reconnecting after 2 weeks.',
  },
  {
    label: 'Demo requested',
    tag: 'Demo',
    text: 'Prospect requested a walkthrough video & portfolio presentation.',
  },
  {
    label: 'Demo sent · Awaiting review',
    tag: 'Demo Sent',
    text: 'Demo walkthrough & proposal sent · Awaiting client review and feedback.',
  },
  {
    label: 'Follow up next week',
    tag: 'Follow-up',
    text: 'Follow-up required next week to confirm schedule and next steps.',
  },
  {
    label: 'Discussing pricing & package',
    tag: 'Pricing',
    text: 'Active negotiation on pricing, payment terms, and deliverable scope.',
  },
  {
    label: 'Decision maker out of office',
    tag: 'Decision Maker',
    text: 'Spoke with gatekeeper; primary decision maker traveling. Revisit shortly.',
  },
];
