export interface InputChipItem {
  id: string;
  type: 'contact' | 'email' | 'call' | 'whatsapp' | 'card' | 'web';
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  color: string;
}

export interface KanbanCardItem {
  id: string;
  name: string;
  company: string;
  value: string;
  dealScore: number;
  highlight?: boolean;
}

export interface ProjectItem {
  name: string;
  phase: string;
  progress: number;
  avatars: string[];
}

export interface CalendarEventItem {
  title: string;
  time: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
}

export const SAMPLE_CHIPS_POOL: InputChipItem[] = [
  {
    id: 'chip-web-1',
    type: 'web',
    title: 'New inquiry from website',
    subtitle: 'DHA Commercial Plaza · High Intent',
    icon: 'language',
    badge: 'Website',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'chip-contact-1',
    type: 'contact',
    title: 'Ahmed Raza',
    subtitle: '+92 300 4567890 · Direct Call',
    icon: 'person',
    badge: 'Client',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'chip-wa-1',
    type: 'whatsapp',
    title: 'Is the plot still available?',
    subtitle: 'WhatsApp · 0321-8899120',
    icon: 'chat',
    badge: 'WhatsApp',
    color: 'from-emerald-600 to-green-600',
  },
  {
    id: 'chip-email-1',
    type: 'email',
    title: 'Re: Pricing for 3 units',
    subtitle: 'sana.malik@apexcap.pk',
    icon: 'mail',
    badge: 'Proposal',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'chip-card-1',
    type: 'card',
    title: 'Imported 24 contacts',
    subtitle: 'Zameen Expo 2026 Batch',
    icon: 'badge',
    badge: 'CSV Import',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'chip-call-1',
    type: 'call',
    title: 'Missed call · 2m ago',
    subtitle: 'Bilal Khan · Clifton Seaview',
    icon: 'call',
    badge: 'Urgent',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'chip-wa-2',
    type: 'whatsapp',
    title: 'Follow up tomorrow 11 AM',
    subtitle: 'Ayesha Siddiqui · Bahria Heights',
    icon: 'chat',
    badge: 'Follow-up',
    color: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'chip-email-2',
    type: 'email',
    title: 'Re: Payment plan details',
    subtitle: 'usman.tariq@gulfholdings.com',
    icon: 'mail',
    badge: 'Contract',
    color: 'from-indigo-500 to-blue-700',
  },
  {
    id: 'chip-web-2',
    type: 'web',
    title: 'Brochure downloaded',
    subtitle: 'Hira Sheikh · Floor 14 Penthouse',
    icon: 'download',
    badge: 'Lead Magnet',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'chip-card-2',
    type: 'card',
    title: 'Business Card: Apex Builders',
    subtitle: 'Tariq Mansoor · Managing Director',
    icon: 'credit_card',
    badge: 'VIP Lead',
    color: 'from-slate-700 to-slate-900',
  },
];

export const INITIAL_KANBAN_DATA: Record<'new' | 'contacted' | 'qualified' | 'won', KanbanCardItem[]> = {
  new: [
    { id: 'k-1', name: 'Sana Malik', company: 'Apex Advisory', value: '$45,000', dealScore: 82 },
    { id: 'k-2', name: 'Tariq Mansoor', company: 'Nexus Logistics', value: '$18,500', dealScore: 74 },
  ],
  contacted: [
    { id: 'k-3', name: 'Bilal Khan', company: 'DHA Plaza Inv.', value: '$95,000', dealScore: 88 },
  ],
  qualified: [
    { id: 'k-4', name: 'Ayesha Siddiqui', company: 'Clifton Residencies', value: '$120,000', dealScore: 92 },
  ],
  won: [
    { id: 'k-5', name: 'Usman Tariq', company: 'Gulf Holdings', value: '$65,000', dealScore: 96 },
  ],
};

export const SAMPLE_PROJECTS: ProjectItem[] = [
  {
    name: 'Bahria Heights',
    phase: 'Phase 2 · Commercial',
    progress: 62,
    avatars: ['AR', 'SM', 'BK'],
  },
  {
    name: 'DHA Commercial Plaza',
    phase: 'Tower B Booking',
    progress: 58,
    avatars: ['AS', 'UT', 'HS'],
  },
  {
    name: 'Clifton Seaview Towers',
    phase: 'Penthouse Closures',
    progress: 70,
    avatars: ['TM', 'AR', 'SM'],
  },
];

export const CALENDAR_DAYS: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

