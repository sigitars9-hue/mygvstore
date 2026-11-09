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
};
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