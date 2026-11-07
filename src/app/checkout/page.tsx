"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { createOrder } from "@/app/actions/order";
import { rp } from "@/lib/utils";

export default function Checkout() {
  const { items, remove, clear } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const total = items.reduce((a, i) => a + i.price * i.qty, 0);
  const submit = (fd: FormData) =>
    start(async () => {
      const r = await createOrder({
        name: String(fd.get("name")), contact: String(fd.get("contact")),
        account: String(fd.get("account")), schedule: String(fd.get("schedule") || ""),
        items: items.map((i) => ({ service_id: i.id, qty: i.qty })),
      });
      if (r.error) return setErr(r.error);
      clear();
      router.push(`/lacak?kode=${r.code}`);
    });

  if (!items.length)
    return <p>Keranjang masih kosong. <Link href="/" className="font-bold text-pink-600">Lihat layanan</Link></p>;

  const inp = "mb-3 w-full rounded-lg border p-2";
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border bg-white p-5">
        <h1 className="mb-3 text-xl font-bold">Keranjang</h1>
        {items.map((i) => (
          <div key={i.id} className="mb-2 flex items-center justify-between rounded-lg border p-3">
            <div><b>{i.name}</b><p className="text-sm text-gray-500">{i.qty} × {rp(i.price)}</p></div>
            <button onClick={() => remove(i.id)} className="text-sm text-red-500">Hapus</button>
          </div>
        ))}
        <p className="mt-3 font-bold">Subtotal: {rp(total)}</p>
        <p className="text-sm text-gray-500">Nominal akhir ditambah kode unik 3 digit setelah booking.</p>
      </div>
      <form action={submit} className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 text-xl font-bold">Data Booking</h2>
        <input name="name" placeholder="Nama" required className={inp} />
        <input name="contact" placeholder="Nomor WhatsApp" required className={inp} />
        <input name="account" placeholder="ID / Server akun game" required className={inp} />
        <label className="text-sm font-semibold">Jadwal mulai (opsional)</label>
        <input name="schedule" type="datetime-local" className={inp} />
        {err && <p className="mb-2 text-sm text-red-600">{err}</p>}
        <button disabled={pending} className="w-full rounded-lg bg-black py-2.5 font-bold text-white disabled:opacity-50">
          {pending ? "Memproses..." : "Booking & Buat Pesanan"}
        </button>
      </form>
    </div>
  );
}