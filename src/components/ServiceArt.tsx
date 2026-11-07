import type { ReactNode } from "react";

export type ArtKey = "trophy" | "crosshair" | "star" | "shield" | "flame" | "planet" | "gamepad";
export const KEYS: ArtKey[] = ["trophy", "crosshair", "star", "shield", "flame", "planet"];

const BG: Record<ArtKey, string> = {
  trophy: "bg-sky-200", crosshair: "bg-neutral-900", star: "bg-indigo-600",
  shield: "bg-teal-700", flame: "bg-orange-500", planet: "bg-violet-500", gamepad: "bg-gray-200",
};
const LEGACY: Record<string, ArtKey> = {
  "ml-mythic-glory": "trophy", "valorant-immortal": "crosshair", "genshin-abyss": "star",
  "pubg-conqueror": "shield", "ff-grandmaster": "flame", "hsr-farming": "planet",
};

export function artKey(seed: string): ArtKey {
  if (LEGACY[seed]) return LEGACY[seed];
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return KEYS[h % KEYS.length];
}
export const bgOf = (k: ArtKey) => BG[k];
// Kompatibel dengan kode lama: ART_BG[slug] selalu mengembalikan kelas warna.
export const ART_BG = new Proxy({} as Record<string, string>, { get: (_, k) => BG[artKey(String(k))] });

const ART: Record<ArtKey, ReactNode> = {
  trophy: (<>
    <path d="M70 36h60v32a30 30 0 0 1-60 0V36Z" fill="#fbbf24" />
    <path d="M70 46H48c0 20 10 32 28 34M130 46h22c0 20-10 32-28 34" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
    <rect x="92" y="96" width="16" height="16" fill="#f59e0b" /><rect x="72" y="112" width="56" height="12" rx="4" fill="#92400e" />
    <path d="m100 44 5 10 11 1.5-8 7.5 2 11-10-5.5-10 5.5 2-11-8-7.5 11-1.5 5-10Z" fill="#fff" />
  </>),
  crosshair: (<>
    <circle cx="100" cy="75" r="38" fill="none" stroke="#fff" strokeWidth="8" />
    <path d="M100 18v30M100 102v30M42 75h30M128 75h30" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
    <circle cx="100" cy="75" r="8" fill="#ef4444" />
  </>),
  star: (<>
    <path d="M100 20 114 62 156 75 114 88 100 130 86 88 44 75 86 62Z" fill="#fde68a" />
    <path d="m158 30 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10ZM48 100l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" fill="#fff" />
  </>),
  shield: (<>
    <path d="M100 22 156 42v36c0 28-22 46-56 58-34-12-56-30-56-58V42l56-20Z" fill="#fff" />
    <path d="m74 66 26 16 26-16M74 90l26 16 26-16" fill="none" stroke="#0f766e" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  flame: (<>
    <path d="M100 20c6 22 36 34 36 68a36 36 0 0 1-72 0c0-14 6-24 14-32 2 12 8 16 12 16-4-22-2-38 10-52Z" fill="#fff" />
    <path d="M100 76c3 12 18 18 18 34a18 18 0 0 1-36 0c0-8 5-14 9-18 1 6 4 8 6 8-2-10-1-18 3-24Z" fill="#f97316" />
  </>),
  planet: (<>
    <circle cx="100" cy="75" r="32" fill="#ddd6fe" />
    <ellipse cx="100" cy="75" rx="62" ry="16" fill="none" stroke="#fff" strokeWidth="7" transform="rotate(-20 100 75)" />
    <circle cx="152" cy="42" r="6" fill="#fff" />
  </>),
  gamepad: (<>
    <rect x="40" y="48" width="120" height="62" rx="28" fill="#111827" />
    <path d="M72 66v26M59 79h26" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
    <circle cx="124" cy="70" r="6" fill="#ec4899" /><circle cx="140" cy="86" r="6" fill="#38bdf8" />
  </>),
};

export default function ServiceArt({ slug, k, className }: { slug?: string; k?: ArtKey; className?: string }) {
  return (
    <svg viewBox="0 0 200 150" className={className} role="img" aria-label="Ilustrasi">
      {ART[k ?? artKey(slug ?? "")]}
    </svg>
  );
}