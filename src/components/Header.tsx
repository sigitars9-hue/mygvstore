"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { Icon } from "@/components/Icons";

type Item = [label: string, href: string];
const WA = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}`;
const NAV: { label: string; items: Item[] }[] = [
  {
    label: "Layanan",
        items: [
      ["Semua game", "/"], ["Genshin Impact", "/game/genshin-impact"], ["Honkai: Star Rail", "/game/honkai-star-rail"],
      ["Zenless Zone Zero", "/game/zenless-zone-zero"], ["Wuthering Waves", "/game/wuthering-waves"], ["NIKKE", "/game/nikke"],
    ],
    
  },
  { label: "Cara Order", items: [["Pilih layanan", "/"], ["Keranjang & checkout", "/checkout"], ["Lacak progres", "/lacak"]] },
  { label: "Bantuan", items: [["Hubungi admin (WhatsApp)", WA], ["Lacak pesanan", "/lacak"], ["Login admin", "/admin/login"]] },
];

function NavLink({ item, className, onClick }: { item: Item; className: string; onClick?: () => void }) {
  const [label, href] = item;
  return href.startsWith("http") ? (
    <a href={href} target="_blank" rel="noreferrer" className={className} onClick={onClick}>{label}</a>
  ) : (
    <Link href={href} className={className} onClick={onClick}>{label}</Link>
  );
}

export default function Header() {
  const n = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const f = () => setScrolled(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <header className={`sticky top-0 z-30 bg-white/90 backdrop-blur transition-shadow ${scrolled ? "shadow-sm" : ""}`}>
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-4 px-5 md:gap-8">
        <button aria-label="Menu" onClick={() => setOpen(!open)} className="-ml-1 p-1 md:hidden">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#0d0c22" strokeWidth="2.2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M3 7h18M3 12h12M3 17h18" />}
          </svg>
        </button>

        <Link href="/" className="text-2xl font-black tracking-tight text-[#0d0c22]">
          joki<span className="text-pink-500">ku</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((g) => (
            <div key={g.label} className="group relative">
              <button className="flex items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-[#0d0c22] hover:bg-gray-100">
                {g.label}
                <Icon name="chevron" className="h-4 w-4 transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full w-64 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  {g.items.map((it) => (
                    <NavLink key={it[0]} item={it} className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-gray-100" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <Link href="/lacak" className="hidden text-[15px] font-semibold text-[#0d0c22] hover:text-pink-600 md:block">Lacak Progres</Link>
          <Link href="/checkout" className="flex items-center gap-2 rounded-full bg-[#0d0c22] px-5 py-3 text-sm font-bold text-white hover:bg-black">
            <Icon name="cart" className="h-4 w-4" />
            Keranjang
            {mounted && n > 0 && <span key={n} className="pop rounded-full bg-pink-500 px-1.5 py-0.5 text-xs">{n}</span>}
          </Link>
        </div>
      </div>

      {/* Menu HP */}
      <div
        inert={!open}
        className={`absolute inset-x-0 top-full grid border-b bg-white transition-[grid-template-rows] duration-300 md:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-transparent"}`}
      >
        <div className="overflow-hidden">
          <div className="px-5 py-2">
            {NAV.map((g) => (
              <details key={g.label} className="group border-b border-gray-100">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 font-semibold [&::-webkit-details-marker]:hidden">
                  {g.label}
                  <Icon name="chevron" className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="pb-2">
                  {g.items.map((it) => (
                    <NavLink key={it[0]} item={it} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 text-gray-600 hover:bg-gray-100" />
                  ))}
                </div>
              </details>
            ))}
            <Link href="/lacak" onClick={() => setOpen(false)} className="block py-3.5 font-semibold">Lacak Progres</Link>
          </div>
        </div>
      </div>
    </header>
  );
}