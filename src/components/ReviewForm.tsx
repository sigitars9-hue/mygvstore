"use client";
import { useState, useTransition } from "react";
import { submitReview } from "@/app/actions/order";

export default function ReviewForm({ serviceId }: { serviceId: string }) {
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const send = (fd: FormData) =>
    start(async () => {
      const r = await submitReview(fd);
      setMsg(r.error ?? "Terima kasih, ulasanmu tampil sekarang!");
    });
  return (
    <form action={send} className="mt-4 grid gap-2 border-t pt-4">
      <b>Tulis ulasan (khusus pesanan yang sudah selesai)</b>
      <input type="hidden" name="service_id" value={serviceId} />
      <input name="code" placeholder="Kode pesanan, mis. JK-1001" required className="rounded-lg border p-2" />
      <select name="rating" defaultValue="5" className="rounded-lg border p-2">
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
      </select>
      <textarea name="comment" rows={2} placeholder="Pengalamanmu" className="rounded-lg border p-2" />
      <button disabled={pending} className="rounded-lg bg-violet-600 py-2 font-bold text-white disabled:opacity-50">Kirim Ulasan</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}