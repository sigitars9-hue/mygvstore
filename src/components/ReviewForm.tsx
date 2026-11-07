"use client";
import { useState, useTransition } from "react";
import { submitReview } from "@/app/actions/order";

export default function ReviewForm({ serviceId }: { serviceId: string }) {
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const send = (fd: FormData) =>
    start(async () => {
      const r = await submitReview(fd);
      setMsg(r.error ?? "Terima kasih, ulasanmu sudah tampil!");
    });
  const inp = "rounded-xl bg-gray-100 p-3 outline-none focus:ring-2 focus:ring-black";
  return (
    <form action={send} className="mt-5 grid gap-3 rounded-2xl bg-gray-50 p-5">
      <div>
        <b>Tulis ulasan</b>
        <p className="text-sm text-gray-500">Khusus pesanan yang sudah berstatus selesai.</p>
      </div>
      <input type="hidden" name="service_id" value={serviceId} />
      <input name="code" placeholder="Kode pesanan, mis. JK-1001" required className={inp} />
      <select name="rating" defaultValue="5" className={inp}>
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
      </select>
      <textarea name="comment" rows={3} placeholder="Ceritakan pengalamanmu" className={inp} />
      <button disabled={pending} className="rounded-full bg-black py-3 font-bold text-white hover:bg-gray-800 disabled:opacity-50">
        {pending ? "Mengirim..." : "Kirim Ulasan"}
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}