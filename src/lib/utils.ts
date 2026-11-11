import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export type ServiceOption = {
  label: string;
  type: "choice" | "text";
  required: boolean;
  choices?: string[];
  hint?: string;
};

export type Service = {
  id: string; slug: string; game: string; name: string; description: string;
  price: number; unit: string; duration: string; emoji: string; includes: string[];
  image_url?: string | null;
  options?: ServiceOption[] | null;
  category?: string | null;
  sub_category?: string | null;
  original_price?: number | null;
};
export const hasPromo = (s: { price: number; original_price?: number | null }) =>
  !!s.original_price && s.original_price > s.price;

export const discountPct = (s: { price: number; original_price?: number | null }) =>
  hasPromo(s) ? Math.round((1 - s.price / s.original_price!) * 100) : 0;

// Badge yang mengandung kata promo/diskon/sale otomatis merah
const PROMO_WORDS = /promo|diskon|sale|hemat|flash|%/i;
export const badgeTone = (b: string) =>
  PROMO_WORDS.test(b)
    ? "bg-gradient-to-b from-red-500 to-red-700 shadow-sm shadow-red-500/30"
    : "bg-slate-800";
export const catOf = (s: { category?: string | null; name: string }) =>
  s.category?.trim() || (s.name.includes(" - ") ? s.name.split(" - ")[0].trim() : "Lainnya");
export const shortName = (s: { category?: string | null; name: string }) => {
  const c = catOf(s);
  return s.name.startsWith(c + " - ") ? s.name.slice(c.length + 3) : s.name;
};

// Kelompokkan layanan per sub kategori. Tanpa sub kategori (kosong) selalu di atas.
export function subGroups<T extends { sub_category?: string | null }>(
  arr: T[]
): [string, T[]][] {
  const m = new Map<string, T[]>();
  arr.forEach((s) => {
    const k = s.sub_category?.trim() ?? "";
    m.set(k, [...(m.get(k) ?? []), s]);
  });
  return [...m.entries()].sort(([a], [b]) =>
    a === "" ? -1 : b === "" ? 1 : a.localeCompare(b, "id", { numeric: true })
  );
}

export type Track = {
  code: string; name: string; stage: number; progress: number; cancelled: boolean;
  pay_status: "unpaid" | "proof" | "paid" | "rejected"; total_pay: number; deadline: string;
  logs: { title: string; detail: string | null; at: string }[];
  customer_name?: string;
  account?: string | null;
  schedule?: string | null;
  items?: { name: string; qty: number }[];
};
export const STAGES = ["Menunggu pembayaran", "Dikonfirmasi", "Sedang dikerjakan", "Review akhir", "Selesai"];
export const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");

// Gabungkan layanan bernama sama menjadi satu baris (qty dijumlahkan)
export function merge(items: { name: string; qty: number }[]) {
  const m = new Map<string, number>();
  items.forEach((i) => m.set(i.name, (m.get(i.name) ?? 0) + i.qty));
  return [...m].map(([name, qty]) => ({ name, qty }));
}