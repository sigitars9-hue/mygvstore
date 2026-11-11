"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function Bar() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [on, setOn] = useState(false);
  const [w, setW] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval>>(undefined);
  const hide = useRef<ReturnType<typeof setTimeout>>(undefined);

  const start = () => {
    clearInterval(tick.current);
    clearTimeout(hide.current);
    setOn(true);
    setW(12);
    tick.current = setInterval(() => setW((x) => x + (92 - x) * 0.08), 200);
  };

  const finish = () => {
    clearInterval(tick.current);
    setW(100);
    hide.current = setTimeout(() => { setOn(false); setW(0); }, 300);
  };

  // Halaman sudah berganti: selesai
  useEffect(() => { finish(); }, [pathname, search]);

  // Link internal diklik: mulai
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      start();
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearInterval(tick.current);
      clearTimeout(hide.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-1"
      style={{ opacity: on ? 1 : 0, transition: "opacity .3s" }}
    >
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-pink-500 to-violet-500 shadow-[0_0_10px_rgba(236,72,153,0.6)]"
        style={{ width: `${w}%`, transition: "width .2s ease-out" }}
      />
    </div>
  );
}

export default function NavProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}