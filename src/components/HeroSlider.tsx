"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icons";
import type { Slide } from "@/lib/banners";

export default function HeroSlider({ slides, interval = 4500 }: { slides: Slide[]; interval?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);
  const paused = useRef(false);
  const [idx, setIdx] = useState(0);

  const goTo = useCallback((i: number) => {
    const el = ref.current;
    if (!el) return;
    const n = (i + slides.length) % slides.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  }, [slides.length]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    idxRef.current = i;
    setIdx(i);
  };

  // Geser otomatis (berhenti saat disentuh/di-hover, tab tidak aktif, atau reduce motion)
  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (!paused.current && !document.hidden) goTo(idxRef.current + 1);
    }, interval);
    return () => clearInterval(t);
  }, [slides.length, interval, goTo]);

  const arrow =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 opacity-0 shadow-lg transition group-hover:opacity-100 hover:scale-105 sm:flex";

  return (
    <div
      className="group relative"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") paused.current = true; }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") paused.current = false; }}
      onTouchStart={() => { paused.current = true; }}
      onTouchEnd={() => { setTimeout(() => { paused.current = false; }, 3000); }}
    >
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto bg-gray-100 shadow-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <Link key={s.src} href={s.href} className="relative block aspect-[1376/768] w-full shrink-0 basis-full snap-center">
            <Image
              src={s.src} alt={s.alt} fill quality={80} priority={i === 0}
              sizes="(min-width: 1024px) 560px, 100vw" className="object-cover"
            />
          </Link>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button aria-label="Banner sebelumnya" onClick={() => goTo(idx - 1)} className={`${arrow} left-3`}><Icon name="left" /></button>
          <button aria-label="Banner berikutnya" onClick={() => goTo(idx + 1)} className={`${arrow} right-3`}><Icon name="right" /></button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.src} aria-label={`Banner ${i + 1}`} onClick={() => goTo(i)}
                className={`h-2 rounded-full bg-white shadow transition-all duration-300 ${i === idx ? "w-6" : "w-2 opacity-60"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}