"use client";
import { useState, useTransition } from "react";
import { uploadProof } from "@/app/actions/order";
import { rp, type Track } from "@/lib/utils";
import { PAY } from "@/lib/pay-config";

export default function PayBox({ t }: { t: Track }) {
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const wa = `https://wa.me/${PAY.wa}?text=${encodeURIComponent(`Halo, saya sudah bayar pesanan ${t.code} sebesar ${rp(t.total_pay)}`)}`;
  const send = (fd: FormData) =>
  start(async () => {
    setMsg("");
    const f = fd.get("file") as File | null;
    if (!f || f.size === 0) return setMsg("Pilih file bukti dulu.");
    if (f.size > 3_000_000) return setMsg("Ukuran gambar maksimal 3 MB.");
    try {
      const r = await uploadProof(fd);
      setMsg(r.error ?? "Bukti terkirim, menunggu verifikasi admin.");
    } catch {
      setMsg("Gagal mengirim. Coba lagi atau kirim lewat WhatsApp.");
    }
  });

  return (
    <div className="mb-4 rounded-xl bg-gray-50 p-4">
      <b>Instruksi pembayaran</b>
      <div className="my-1 text-2xl font-extrabold text-violet-600">{rp(t.total_pay)}</div>
      <p className="text-sm text-gray-500">
        Transfer tepat sesuai nominal (3 digit terakhir adalah kode unik). Bayar sebelum {new Date(t.deadline).toLocaleString("id-ID")}.
      </p>
      <p className="my-2 text-sm">🏦 {PAY.bank}<br />📱 {PAY.ewallet}<br />🔳 QRIS tersedia lewat WhatsApp</p>
      {t.pay_status === "proof" && <p className="text-sm text-amber-600">⏳ Bukti sudah diterima, menunggu verifikasi admin.</p>}
      {t.pay_status === "rejected" && <p className="text-sm text-red-600">Bukti ditolak admin. Silakan upload ulang.</p>}
      <form action={send} className="mt-2">
        <input type="hidden" name="code" value={t.code} />
        <input type="file" name="file" accept="image/*" className="mb-2 block w-full text-sm" />
        <div className="flex flex-wrap gap-2">
          <button disabled={pending} className="rounded-lg bg-violet-600 px-4 py-2 font-bold text-white disabled:opacity-50">
            {pending ? "Mengirim..." : "Kirim Bukti"}
          </button>
          <a href={wa} target="_blank" className="rounded-lg border border-violet-600 px-4 py-2 font-bold text-violet-600">Kirim via WhatsApp</a>
        </div>
      </form>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
    </div>
  );
}