"use client";
import { useRef } from "react";
import { Icon } from "@/components/Icons";

export default function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.6, behavior: "smooth" });
  const btn = "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg hover:scale-105";
  return (
    <div className="relative mt-5">
      <div ref={ref} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <button aria-label="Sebelumnya" onClick={() => go(-1)} className={`${btn} left-2`}><Icon name="left" /></button>
      <button aria-label="Berikutnya" onClick={() => go(1)} className={`${btn} right-2`}><Icon name="right" /></button>
    </div>
  );
}