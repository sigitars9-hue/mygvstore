import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icons";
import { card } from "@/components/admin/ui";

/** Dipertahankan agar import lama tetap jalan (animasi bertahap sudah tidak dipakai di halaman admin). */
export const stagger = (i: number) => ({ "--i": Math.min(i, 8) }) as React.CSSProperties;

const TONE = {
  pink: "bg-pink-50 text-pink-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-sky-50 text-sky-600",
} as const;
export type Tone = keyof typeof TONE;

export function PageHeader({ title, desc, children }: { title: string; desc?: string; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-[#0d0c22] sm:text-3xl">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-sm text-gray-500">{desc}</p>}
      </div>
      {children}
    </header>
  );
}

export function StatCard({ href, icon, value, label, tone }: {
  href: string; icon: IconName; value: number; label: string; tone: Tone; i?: number;
}) {
  return (
    <Link href={href} className={`${card} flex items-center gap-3 transition hover:bg-gray-50`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TONE[tone]}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-semibold leading-none text-[#0d0c22]">{value.toLocaleString("id-ID")}</span>
        <span className="mt-1 block truncate text-sm text-gray-500">{label}</span>
      </span>
    </Link>
  );
}