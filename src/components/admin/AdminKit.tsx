import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icons";
import { card } from "@/components/admin/ui";

/** Delay muncul bergantian: style={stagger(index)} */
export const stagger = (i: number) => ({ "--i": Math.min(i, 8) }) as React.CSSProperties;

const TONE = {
  pink: "from-pink-500 to-rose-400",
  violet: "from-violet-500 to-indigo-400",
  amber: "from-amber-400 to-orange-400",
  emerald: "from-emerald-500 to-teal-400",
  sky: "from-sky-500 to-cyan-400",
} as const;
export type Tone = keyof typeof TONE;

export function PageHeader({ title, desc, children }: { title: string; desc?: string; children?: ReactNode }) {
  return (
    <header className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0d0c22]">{title}</h1>
        <span className="mt-2 block h-1 w-12 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
        {desc && <p className="mt-3 text-gray-600">{desc}</p>}
      </div>
      {children}
    </header>
  );
}

export function StatCard({ href, icon, value, label, tone, i }: {
  href: string; icon: IconName; value: number; label: string; tone: Tone; i: number;
}) {
  return (
    <Link href={href} style={stagger(i)}
      className={`${card} group animate-fade-up relative overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl`}>
      <span className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${TONE[tone]} opacity-20 blur-xl transition duration-500 group-hover:scale-125 group-hover:opacity-40`} />
      <span className={`relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${TONE[tone]} text-white shadow-lg transition group-hover:scale-110 group-hover:-rotate-6`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-[#0d0c22]">{value.toLocaleString("id-ID")}</p>
      <p className="relative text-sm font-medium text-gray-500">{label}</p>
    </Link>
  );
}