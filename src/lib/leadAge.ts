export type LeadAgeStatus = 'fresh' | 'active' | 'aging' | 'stale';

export interface LeadAgeInfo {
  formattedDate: string;
  daysOld: number;
  label: string;
  badgeText: string;
  status: LeadAgeStatus;
  badgeClasses: string;
  dotColor: string;
}

/**
 * Calculates how many days old a lead is based on its creation or arrival date,
 * and returns visual badges and relative age labels.
 */
export function calculateLeadAge(dateStr?: string | Date | null): LeadAgeInfo {
  if (!dateStr) {
    return {
      formattedDate: 'Date not set',
      daysOld: 0,
      label: 'Added today',
      badgeText: 'Today (0d)',
      status: 'fresh',
      badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotColor: 'bg-emerald-500',
    };
  }

  const created = new Date(dateStr);
  const now = new Date();

  // Guard against invalid date
  if (isNaN(created.getTime())) {
    return {
      formattedDate: 'Date not set',
      daysOld: 0,
      label: 'Date unknown',
      badgeText: 'Unknown age',
      status: 'fresh',
      badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200',
      dotColor: 'bg-slate-400',
    };
  }

  // Calculate difference in whole 24-hr calendar days
  const diffMs = now.getTime() - created.getTime();
  const daysOld = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const formattedDate = created.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  let status: LeadAgeStatus = 'fresh';
  let badgeText = '';
  let badgeClasses = '';
  let dotColor = '';

  if (daysOld === 0) {
    status = 'fresh';
    badgeText = 'Today (0d)';
    badgeClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (daysOld === 1) {
    status = 'fresh';
    badgeText = '1 day old';
    badgeClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (daysOld <= 3) {
    status = 'fresh';
    badgeText = `${daysOld}d old`;
    badgeClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (daysOld <= 14) {
    status = 'active';
    badgeText = `${daysOld}d old`;
    badgeClasses = 'bg-blue-50 text-blue-800 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (daysOld <= 30) {
    status = 'aging';
    badgeText = `Aging · ${daysOld}d old`;
    badgeClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else {
    status = 'stale';
    badgeText = `Stale · ${daysOld}d old`;
    badgeClasses = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
  }

  const label =
    daysOld === 0
      ? 'Added today'
      : daysOld === 1
      ? '1 day ago'
      : `${daysOld} days ago`;

  return {
    formattedDate,
    daysOld,
    label,
    badgeText,
    status,
    badgeClasses,
    dotColor,
  };
}

