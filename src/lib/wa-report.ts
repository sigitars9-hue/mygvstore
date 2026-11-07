import { rp, merge, type Track } from "@/lib/utils";

const fmt = (d: string) =>
  new Date(d).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });

export function waLink(number: string | undefined, t: Track, kind: "bayar" | "progres") {
  const lines = [
    kind === "bayar"
      ? "Halo admin, saya sudah melakukan pembayaran."
      : "Halo admin, saya ingin menanyakan progres pesanan saya.",
    "",
    `Kode pesanan: ${t.code}`,
    t.customer_name && `Nama: ${t.customer_name}`,
    t.account && `ID / Server: ${t.account}`,
    t.items?.length ? `Layanan: ${merge(t.items).map((i) => `${i.name} x${i.qty}`).join(", ")}` : false,
    t.schedule && `Jadwal mulai: ${fmt(t.schedule)} WIB`,
    kind === "bayar" && `Nominal: ${rp(t.total_pay)}`,
    "",
    kind === "bayar" ? "Bukti transfer saya lampirkan di chat ini." : "Mohon update progresnya ya. Terima kasih.",
  ];
  const text = lines.filter((l): l is string => typeof l === "string").join("\n");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}