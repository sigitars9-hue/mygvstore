"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { rp, type Track } from "@/lib/utils";
import { PAY } from "@/lib/pay-config";
import { waLink } from "@/lib/wa-report";
import { Icon } from "@/components/Icons";

function useCountdown(deadline: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date(deadline).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [deadline]);
  if (left === null) return "";
  if (left === 0) return "Waktu habis";
  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  return `Sisa ${h} jam ${m} menit`;
}

export default function PayBox({ t }: { t: Track }) {
  const [copied, setCopied] = useState(false);
  const left = useCountdown(t.deadline);

  const deadline = new Date(t.deadline).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const copyAmount = async () => {
    try {
      await navigator.clipboard.writeText(String(t.total_pay));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Nominal */}
      <div className="rounded-3xl bg-[#0d0c22] p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-white/60">Total yang harus dibayar</p>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
            <Icon name="check" className="h-3.5 w-3.5" />Tanpa biaya admin
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-3xl font-extrabold tracking-tight">{rp(t.total_pay)}</span>
          <button
            type="button"
            onClick={copyAmount}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-bold hover:bg-white/25"
          >
            <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
            {copied ? "Tersalin" : "Salin nominal"}
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-white/60">
          Bayar tepat sesuai nominal. 3 digit terakhir adalah kode unik untuk memudahkan verifikasi.
        </p>
        <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-white/80">
          <Icon name="clock" className="h-4 w-4 shrink-0" />
          <span>Batas bayar {deadline} WIB{left && <> · <b className="text-pink-300">{left}</b></>}</span>
        </div>
      </div>

      {t.pay_status === "proof" && (
        <p className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3.5 text-sm text-amber-700">
          <Icon name="clock" className="h-4 w-4 shrink-0" />Pembayaran sedang diverifikasi admin.
        </p>
      )}
      {t.pay_status === "rejected" && (
        <p className="flex items-center gap-2 rounded-2xl bg-red-50 p-3.5 text-sm text-red-700">
          <Icon name="alert" className="h-4 w-4 shrink-0" />Pembayaran belum bisa diverifikasi. Hubungi admin lewat WhatsApp.
        </p>
      )}

      {/* QRIS */}
      <div className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0d0c22]">
          <Icon name="qr" className="h-5 w-5" />Bayar dengan QRIS
        </div>

        <div className="mx-auto mt-4 w-full max-w-[320px] overflow-hidden rounded-2xl border border-gray-200">
          <Image src="/qris.jpg" alt="QRIS Gachaverse Store" width={1135} height={1600} sizes="320px" className="h-auto w-full" />
        </div>

        <a
          href="/qris.jpg"
          download="qris-gachaverse-store.jpg"
          className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-sm font-bold hover:bg-gray-200"
        >
          <Icon name="download" className="h-4 w-4" />Simpan gambar QRIS
        </a>

        <ol className="mt-5 space-y-2 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-600">1</span>
            Scan QRIS dengan aplikasi e-wallet atau mobile banking apa saja.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-600">2</span>
            <span>Masukkan nominal <b className="text-[#0d0c22]">{rp(t.total_pay)}</b> persis, termasuk kode unik.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-600">3</span>
            Selesaikan pembayaran, lalu konfirmasi lewat tombol di bawah.
          </li>
        </ol>
      </div>

      <a
        href={waLink(PAY.wa, t, "bayar")}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-full bg-pink-500 py-4 text-base font-bold text-white hover:bg-pink-600"
      >
        <Icon name="send" className="h-5 w-5" />Saya sudah bayar, konfirmasi
      </a>
      <p className="text-center text-xs text-gray-500">
        WhatsApp terbuka dengan pesan yang sudah terisi. Lampirkan bukti bayar lalu tekan kirim.
      </p>
    </div>
  );
}