"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import type { Service } from "@/lib/utils";

export default function AddToCart({ s, compact }: { s: Service; compact?: boolean }) {
  const add = useCart((x) => x.add);
  const router = useRouter();
  const [q, setQ] = useState(1);
  const [ok, setOk] = useState(false);
  const item = { id: s.id, slug: s.slug, name: s.name, price: s.price, unit: s.unit };
  const put = () => { add(item, q); setOk(true); setTimeout(() => setOk(false), 1500); };

  if (compact)
    return <button onClick={put} className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-bold text-white">{ok ? "✓ Masuk" : "+ Keranjang"}</button>;

  return (
    <div>
      <label className="text-sm font-semibold">Jumlah ({s.unit})</label>
      <input type="number" min={1} max={100} value={q}
        onChange={(e) => setQ(Math.max(1, Number(e.target.value) || 1))}
        className="my-2 w-full rounded-lg border p-2" />
      <div className="flex gap-2">
        <button onClick={put} className="flex-1 rounded-lg border border-violet-600 py-2 font-bold text-violet-600">{ok ? "✓ Masuk" : "+ Keranjang"}</button>
        <button onClick={() => { add(item, q); router.push("/checkout"); }} className="flex-1 rounded-lg bg-violet-600 py-2 font-bold text-white">Booking Sekarang</button>
      </div>
    </div>
  );
}