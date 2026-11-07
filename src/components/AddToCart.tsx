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
    return (
      <button onClick={put} className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold shadow-md hover:bg-gray-100">
        {ok ? "✓ Masuk" : "+ Keranjang"}
      </button>
    );
  return (
    <div>
      <label className="text-sm font-semibold">Jumlah ({s.unit})</label>
      <input
        type="number" min={1} max={100} value={q}
        onChange={(e) => setQ(Math.max(1, Number(e.target.value) || 1))}
        className="mb-3 mt-1.5 w-full rounded-xl bg-gray-100 p-3 outline-none focus:ring-2 focus:ring-black"
      />
      <button
        onClick={() => { add(item, q); router.push("/checkout"); }}
        className="w-full rounded-full bg-black py-3 font-bold text-white hover:bg-gray-800"
      >
        Booking Sekarang
      </button>
      <button
        onClick={put}
        className="mt-2 w-full rounded-full border border-gray-300 py-3 font-bold hover:border-black"
      >
        {ok ? "✓ Masuk keranjang" : "+ Tambah ke keranjang"}
      </button>
    </div>
  );
}