// ─── SVG Icons ────────────────────────────────────────────────────────────────
import Image from 'next/image';

export const IconHome = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e8001d' : '#606060'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const IconTrend = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e8001d' : '#606060'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

export const IconDumbbell = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e8001d' : '#606060'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" />
    <path d="M4 8.5v7M8 5.5v13M16 5.5v13M20 8.5v7" />
    <rect x="2" y="7.5" width="4" height="9" rx="1" /><rect x="18" y="7.5" width="4" height="9" rx="1" />
  </svg>
);

export const IconUser = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e8001d' : '#606060'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#606060" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

export const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8001d" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const IconWeight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8001d" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="8" r="4" /><path d="M2 20h20M4 16l2 4M20 16l-2 4" />
  </svg>
);

export const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── BullRep Bull Mascot ──────────────────────────────────────────────────────
export const BullMascot = ({ size = 70 }: { size?: number }) => (
  <Image
    src="/images/avatar.png"
    alt="Mascote BullRep"
    width={size}
    height={size}
    style={{
      width: size,
      height: size,
      objectFit: 'contain'
    }}
  />
);
