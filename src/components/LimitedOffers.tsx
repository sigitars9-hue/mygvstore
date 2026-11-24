"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Offer } from "@/lib/offers";

const SPEED = 35; // px per detik
const URGENT_MS = 86_400_000; // < 24 jam dianggap mendesak

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const p = (n: number) => String(n).padStart(2, "0");
  const t = `${p(Math.floor((s % 86400) / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
  return d > 0 ? `${d} hari ${t}` : t;
};

const parts = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
};

export default function LimitedOffers({ offers }: { offers: Offer[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ---------- Hitung mundur ---------- */
  const [now, setNow] = useState<number | null>(null);
  const hasTimer = offers.some((o) => o.ends_at);

  useEffect(() => {
    if (!hasTimer) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasTimer]);

  // offer yang waktunya habis langsung hilang
  const visible =
    now === null ? offers : offers.filter((o) => !o.ends_at || new Date(o.ends_at).getTime() > now);

  // offer yang paling cepat berakhir (untuk badge di header)
  const soonest =
    now === null
      ? null
      : visible
          .flatMap((o) => (o.ends_at ? [new Date(o.ends_at).getTime()] : []))
          .sort((a, b) => a - b)[0] ?? null;

  const n = visible.length;
  const loop = n > 1;
  const reps = !loop ? 1 : n >= 6 ? 3 : n >= 3 ? 5 : 8;

  /* ---------- Infinite loop ---------- */
  // lebar satu set item (termasuk gap)
  const setWidth = (el: HTMLElement) => {
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return (el.scrollWidth + gap) / reps;
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || !loop) return;

    let W = setWidth(el);
    let pos = W; // mulai dari set ke-2
    el.scrollLeft = pos;

    const onResize = () => {
      W = setWidth(el);
      pos = el.scrollLeft = Math.min(Math.max(el.scrollLeft, W), 2 * W - 1);
    };
    window.addEventListener("resize", onResize);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    let wasPaused = false;

    const frame = (t: number) => {
      const dt = Math.min(t - last, 64) / 1000;
      last = t;
      const stop = reduce || paused.current || document.hidden;
      if (stop) {
        wasPaused = true;
      } else {
        if (wasPaused) {
          pos = el.scrollLeft; // sinkron dengan posisi terakhir user
          wasPaused = false;
        }
        pos += SPEED * dt;
        if (pos >= 2 * W) pos -= W;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop, reps, n]);

  // saat user geser manual: jaga posisi tetap di set tengah
  const onScroll = () => {
    const el = ref.current;
    if (!el || !paused.current) return;
    const W = setWidth(el);
    if (el.scrollLeft >= 2 * W) el.scrollLeft -= W;
    else if (el.scrollLeft < W) el.scrollLeft += W;
  };

  const hold = () => {
    clearTimeout(timer.current);
    paused.current = true;
  };
  const release = (delay = 0) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      paused.current = false;
    }, delay);
  };

  if (!n) return null;

  return (
    <section className="mt-8" aria-label="Limited offers">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">Limited Offers</h2>
        <span className="rounded bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tabular-nums tracking-wide text-white">
          {soonest && now ? `Berakhir ${fmt(soonest - now)}` : "Terbatas"}
        </span>
      </div>

      <div
        ref={ref}
        onScroll={onScroll}
        onPointerEnter={(e) => e.pointerType === "mouse" && hold()}
        onPointerLeave={(e) => e.pointerType === "mouse" && release()}
        onTouchStart={hold}
        onTouchEnd={() => release(2500)}
        className="flex gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {Array.from({ length: reps }).flatMap((_, r) =>
          visible.map((o, i) => {
            const left = o.ends_at && now !== null ? new Date(o.ends_at).getTime() - now : null;
            const urgent = left !== null && left < URGENT_MS;
            const t = left !== null ? parts(left) : null;
            const segs = t
              ? [
                  ...(t.d > 0 ? [{ v: t.d, u: "hari" }] : []),
                  { v: t.h, u: "jam" },
                  { v: t.m, u: "mnt" },
                  { v: t.s, u: "dtk" },
                ]
              : [];

            const card = (
              <div className="group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-pink-500/50 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07] dark:hover:shadow-none">
                {/* Gambar 4:5 tanpa overlay */}
                <div className="relative aspect-[4/5] w-full bg-gray-200">
                  <Image
                    src={o.image_url}
                    alt={r === 0 ? o.alt || `Limited offer ${i + 1}` : ""}
                    fill
                    sizes="(min-width: 1024px) 240px, (min-width: 640px) 200px, 44vw"
                    className="object-cover"
                    draggable={false}
                    priority={r === 0 && i < 3}
                  />
                </div>

                {/* Panel info */}
                {(o.label || t) && (
                  <div className="flex flex-1 flex-col gap-2.5 p-2.5 sm:p-3">
                    {o.label && (
                      <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 sm:text-sm dark:text-white">
                        {o.label}
                      </p>
                    )}

                    {t && (
                      <div className="mt-auto">
                        <p
                          className={`mb-1.5 text-[10px] font-bold uppercase tracking-wider ${
                            urgent
                              ? "text-pink-500 dark:text-pink-400"
                              : "text-gray-500 dark:text-white/50"
                          }`}
                        >
                          Berakhir dalam
                        </p>
                        <div
                          className="grid gap-1"
                          style={{ gridTemplateColumns: `repeat(${segs.length}, minmax(0, 1fr))` }}
                        >
                          {segs.map((g) => (
                            <div
                              key={g.u}
                              className={`rounded-lg py-1 text-center ${
                                urgent
                                  ? "bg-gradient-to-b from-red-500 to-pink-500 text-white"
                                  : "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
                              }`}
                            >
                              <div className="text-sm font-extrabold leading-none tabular-nums sm:text-base">
                                {String(g.v).padStart(2, "0")}
                              </div>
                              <div className="mt-0.5 text-[9px] font-medium uppercase leading-none opacity-70">
                                {g.u}
                              </div>
                            </div>
                          ))}
                        </div>
                        <span className="sr-only">Berakhir {fmt(left!)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );

            return (
              <div
                key={`${r}-${o.id}`}
                aria-hidden={r !== 0 || undefined}
                className="flex w-[44%] shrink-0 sm:w-[200px] lg:w-[240px]"
              >
                {o.href ? (
                  <Link
                    href={o.href}
                    className="flex w-full"
                    target={o.href.startsWith("http") ? "_blank" : undefined}
                    tabIndex={r === 0 ? undefined : -1}
                  >
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}