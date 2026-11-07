"use client";
import { useRef } from "react";
import { Icon } from "@/components/Icons";

export default function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.5, behavior: "smooth" });
  const btn = "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:scale-105 lg:h-12 lg:w-12 lg:shadow-lg";
  return (
    <div className="relative mt-3 lg:mt-5">
      <div ref={ref} className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] lg:gap-4 [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <button aria-label="Sebelumnya" onClick={() => go(-1)} className={`${btn} left-1 lg:left-2`}><Icon name="left" className="h-4 w-4 lg:h-5 lg:w-5" /></button>
      <button aria-label="Berikutnya" onClick={() => go(1)} className={`${btn} right-1 lg:right-2`}><Icon name="right" className="h-4 w-4 lg:h-5 lg:w-5" /></button>
    </div>
  );
}