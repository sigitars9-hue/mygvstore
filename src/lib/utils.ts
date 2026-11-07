import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Service = {
  id: string; slug: string; game: string; name: string; description: string;
  price: number; unit: string; duration: string; emoji: string; includes: string[];
};
export type Track = {
  code: string; name: string; stage: number; progress: number; cancelled: boolean;
  pay_status: "unpaid" | "proof" | "paid" | "rejected"; total_pay: number; deadline: string;
  logs: { title: string; detail: string | null; at: string }[];
};
export const STAGES = ["Menunggu pembayaran", "Dikonfirmasi", "Sedang dikerjakan", "Review akhir", "Selesai"];
export const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");