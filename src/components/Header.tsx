"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";

export default function Header() {
  const n = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-white px-5 py-3">
      <Link href="/" className="mr-auto text-xl font-extrabold text-violet-600">🎮 JokiKu</Link>
      <Link href="/lacak" className="font-semibold text-gray-600">Lacak Progres</Link>
      <Link href="/checkout" className="rounded-lg border border-violet-600 px-3 py-1.5 font-semibold text-violet-600">
        🛒 Keranjang
        {mounted && n > 0 && <span className="ml-1 rounded-full bg-pink-500 px-2 text-xs text-white">{n}</span>}
      </Link>
    </header>
  );
}