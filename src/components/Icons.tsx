import type { ReactNode } from "react";

const P = {
    send: <><path d="M21 3 10 14" /><path d="m21 3-7 18-4-7-7-4 18-7Z" /></>,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16v.01" /></>,
  wallet: <><path d="M4 7a2 2 0 0 1 2-2h12v3" /><rect x="3" y="8" width="18" height="12" rx="2.5" /><path d="M16 14h2" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  cart: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 11.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  chart: <><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-6" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  shield: <><path d="M12 3 4 6v6c0 4.5 3.2 7.5 8 9 4.8-1.5 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  bank: <><path d="M3 10 12 4l9 6" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" /></>,
  phone: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 14v.01M14 21h3M21 17v4" /></>,
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
    sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
      coin: <><circle cx="12" cy="12" r="9" /><path d="M14.8 9.2c-.5-1-1.5-1.5-2.8-1.5-1.6 0-2.7.8-2.7 2 0 3 5.6 1.4 5.6 4.3 0 1.2-1.2 2-2.9 2-1.4 0-2.5-.6-3-1.7M12 6v1.7M12 16.3V18" /></>,
  list: <><rect x="4" y="3" width="14" height="18" rx="2.5" /><path d="M8 8h6M8 12h6M8 16h3" /></>,
  left: <path d="m15 6-6 6 6 6" />,
  right: <path d="m9 6 6 6-6 6" />,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>,
  download: <><path d="M12 4v11M7 10l5 5 5-5" /><path d="M5 20h14" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof P;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={name === "star" ? "currentColor" : "none"} stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {P[name]}
    </svg>
  );
}