"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Mode = "list" | "grid";

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin text-pink-500 sm:h-5 sm:w-5" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function ViewToggle({
  isGrid,
  listHref,
  gridHref,
}: {
  isGrid: boolean;
  listHref: string;
  gridHref: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [target, setTarget] = useState<Mode | null>(null);

  const current: Mode = isGrid ? "grid" : "list";
  const active: Mode = pending && target ? target : current;

  // Tandai <html> supaya daftar game bisa dipudarkan lewat CSS
  useEffect(() => {
    const el = document.documentElement;
    if (pending) el.setAttribute("data-view-loading", "");
    else el.removeAttribute("data-view-loading");
    return () => el.removeAttribute("data-view-loading");
  }, [pending]);

  const go = (mode: Mode) => {
    if (mode === current || pending) return;
    setTarget(mode);
    start(() => router.push(mode === "grid" ? gridHref : listHref, { scroll: false }));
  };

  const btn = (mode: Mode) =>
    `flex h-8 w-8 items-center justify-center rounded-full transition sm:h-9 sm:w-9 ${
      active === mode ? "bg-white shadow-sm" : "text-gray-400 hover:text-gray-700"
    }`;

  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-full bg-gray-100 p-1"
      role="group"
      aria-label="Ganti tampilan"
      aria-busy={pending}
    >
      <button type="button" aria-label="Tampilan list" aria-pressed={active === "list"} onClick={() => go("list")} className={btn("list")}>
        {pending && target === "list" ? (
          <Spinner />
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <button type="button" aria-label="Tampilan grid" aria-pressed={active === "grid"} onClick={() => go("grid")} className={btn("grid")}>
        {pending && target === "grid" ? (
          <Spinner />
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
            <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
            <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
            <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
          </svg>
        )}
      </button>
    </div>
  );
}