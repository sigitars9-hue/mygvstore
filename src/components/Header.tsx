"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icons";
import type { CsEntry, NavGame } from "@/lib/cs";

type Item = [label: string, href: string];
const DEFAULT_WA = process.env.NEXT_PUBLIC_WA_NUMBER;
const WA = `https://wa.me/${DEFAULT_WA}`;

function NavLink({ item, className, onClick }: { item: Item; className: string; onClick?: () => void }) {
  const [label, href] = item;
  return href.startsWith("http") ? (
    <a href={href} target="_blank" rel="noreferrer" className={className} onClick={onClick}>{label}</a>
  ) : (
    <Link href={href} className={className} onClick={onClick}>{label}</Link>
  );
}

export default function Header({ games, cs }: { games: NavGame[]; cs: CsEntry[] }) {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const NAV: { label: string; items: Item[] }[] = [
    { label: "Layanan", items: [["Semua game", "/"], ...games.map((g): Item => [g.name, `/game/${g.slug}`])] },
    { label: "Cara Order", items: [["Pilih layanan", "/"], ["Chat admin (WhatsApp)", WA]] },
    { label: "Bantuan", items: [["Hubungi admin (WhatsApp)", WA], ["Login admin", "/admin/login"]] },
  ];

  useEffect(() => {
    if (!chat) return;
    const onDown = (e: PointerEvent) => {
      if (!chatRef.current?.contains(e.target as Node)) setChat(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setChat(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [chat]);

  const wa = (n: string, name: string) =>
    `https://wa.me/${n}?text=${encodeURIComponent(`Halo kak ${name}, saya mau tanya soal joki`)}`;

  return (
    <header className="relative z-30 bg-white">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-4 sm:px-5 md:gap-8">
        <button
          aria-label="Menu"
          onClick={() => { setOpen(!open); setChat(false); }}
          className="-ml-1 p-1 md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#0d0c22" strokeWidth="2.2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M3 7h18M3 12h12M3 17h18" />}
          </svg>
        </button>

        <Link href="/" aria-label="Mygvstore, ke beranda" className="flex shrink-0 items-center">
          <Image
            src="https://comicversedata.my.id/1794223740775.png"
            alt="Mygvstore"
            width={160}
            height={40}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((g) => (
            <div key={g.label} className="group relative">
              <button className="flex items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-[#0d0c22] hover:bg-gray-100">
                {g.label}
                <Icon name="chevron" className="h-4 w-4 transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full w-64 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  {g.items.map((it) => (
                    <NavLink key={it[0]} item={it} className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-gray-100" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* Chat CS */}
        <div ref={chatRef} className="relative ml-auto">
<button
  type="button"
  aria-label="Chat CS"
  aria-expanded={chat}
  onClick={() => { setChat(!chat); setOpen(false); }}
  className="flex h-10 w-10 items-center justify-center transition hover:scale-110"
>
  <Image
    src="/icon/wa.png"
    alt=""
    width={32}
    height={32}
    className="h-8 w-8"
  />
</button>

          <div
            className={`absolute right-0 top-full z-40 mt-2 w-[min(20rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-gray-100 bg-white shadow-2xl transition duration-200 ${
              chat ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
            }`}
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-bold text-[#0d0c22]">Chat CS</p>
              <p className="text-xs text-gray-500">Pilih CS sesuai game yang kamu mau.</p>
            </div>

            <ul className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
              {cs.map((c) => (
                <li key={c.wa}>
                  <a
                    href={wa(c.wa, c.name)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setChat(false)}
                    className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-gray-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-sm font-extrabold uppercase text-white">
                      {c.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-sm text-[#0d0c22]">{c.name}</b>
                      <span className="block truncate text-xs text-gray-500">{c.games.join(", ")}</span>
                    </span>
                    <Icon name="right" className="h-4 w-4 shrink-0 text-gray-300" />
                  </a>
                </li>
              ))}
              {!cs.length && <li className="p-3 text-sm text-gray-500">Belum ada CS terdaftar.</li>}
            </ul>

            <div className="border-t border-gray-100 p-2">
              <a
                href={WA}
                target="_blank"
                rel="noreferrer"
                onClick={() => setChat(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-[#0d0c22] hover:bg-gray-200"
              >
                <Icon name="chat" className="h-4 w-4" />Admin umum
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Menu HP */}
      <div
        inert={!open}
        className={`absolute inset-x-0 top-full grid border-b bg-white transition-[grid-template-rows] duration-300 md:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-transparent"}`}
      >
        <div className="overflow-hidden">
          <div className="max-h-[75vh] overflow-y-auto px-5 py-2">
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
          </div>
        </div>
      </div>
    </header>
  );
}