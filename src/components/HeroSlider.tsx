"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icons";
import type { Slide } from "@/lib/banners";

const DUR = 500; // ms, samakan dengan duration-500 di bawah
const W = 78; // lebar slide aktif (%)

export default function HeroSlider({ slides, interval = 4500 }: { slides: Slide[]; interval?: number }) {
  const n = slides.length;
  // [clone terakhir, ...slide asli, clone pertama]
  const items = n > 1 ? [slides[n - 1], ...slides, slides[0]] : slides;

  const [pos, setPos] = useState(n > 1 ? 1 : 0);
  const [anim, setAnim] = useState(true);
  const paused = useRef(false);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);

  const idx = n > 1 ? (pos - 1 + n) % n : 0;

  const next = useCallback(() => { setAnim(true); setPos((p) => Math.min(p + 1, n + 1)); }, [n]);
  const prev = useCallback(() => { setAnim(true); setPos((p) => Math.max(p - 1, 0)); }, []);

  // Saat sampai di clone, lompat tanpa animasi ke slide aslinya
  useEffect(() => {
    if (n < 2) return;
    if (pos !== 0 && pos !== n + 1) return;
    const t = setTimeout(() => {
      setAnim(false);
      setPos(pos === 0 ? n : 1);
    }, DUR + 20);
    return () => clearTimeout(t);
  }, [pos, n]);

  // Geser otomatis
  useEffect(() => {
    if (n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (!paused.current && !document.hidden) next();
    }, interval);
    return () => clearInterval(t);
  }, [n, interval, next]);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, moved: false };
    paused.current = true;
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (e.pointerType !== "mouse") setTimeout(() => { paused.current = false; }, 3000);
    else paused.current = false;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 40) {
      d.moved = true;
      dx < 0 ? next() : prev();
      // cegah klik link setelah swipe
      const block = (ev: Event) => { ev.preventDefault(); ev.stopPropagation(); };
      window.addEventListener("click", block, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", block, true), 50);
    }
  };

  const arrow =
    "absolute top-[45%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 opacity-0 shadow-lg transition group-hover:opacity-100 hover:scale-105 sm:flex";

  const fade =
    "[-webkit-mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]";

  return (
    <div
      className="group relative"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") paused.current = true; }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") paused.current = false; }}
    >
      <div
        className={`overflow-hidden py-4 ${n > 1 ? fade : ""}`}
        style={{ touchAction: "pan-y" }}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => { drag.current = null; }}
      >
        <div
          className={`flex ${anim ? "transition-transform duration-500 ease-out motion-reduce:transition-none" : ""}`}
          style={{ transform: `translateX(${(100 - W) / 2 - pos * W}%)` }}
        >
{items.map((s, i) => {
  const active = (n > 1 ? (i - 1 + n) % n : 0) === idx;
  return (
    <div key={`${s.src}-${i}`} className="shrink-0 px-1.5" style={{ width: `${W}%` }}>
      <Link
        href={s.href}
        draggable={false}
        className={`relative block aspect-[1376/768] w-full overflow-hidden rounded-2xl bg-gray-100 ${
          anim ? "transition-all duration-500 motion-reduce:transition-none" : ""
        } ${active ? "scale-100 opacity-100 shadow-lg" : "scale-90 opacity-40"}`}
      >
        <Image
          src={s.src} alt={s.alt} fill quality={80} priority={i <= 1}
          draggable={false}
          sizes="(min-width: 1024px) 440px, 80vw" className="object-cover"
        />
      </Link>
    </div>
  );
})}
        </div>
      </div>

      {n > 1 && (
        <>
          <button aria-label="Banner sebelumnya" onClick={prev} className={`${arrow} left-1`}><Icon name="left" /></button>
          <button aria-label="Banner berikutnya" onClick={next} className={`${arrow} right-1`}><Icon name="right" /></button>
        </>
      )}
    </div>
  );
}