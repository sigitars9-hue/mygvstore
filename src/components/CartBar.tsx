"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart, type Line } from "@/lib/cart-store";
import { rp } from "@/lib/utils";
import { Icon } from "@/components/Icons";

const DEFAULT_WA = process.env.NEXT_PUBLIC_WA_NUMBER;

export default function CartBar() {
  const path = usePathname();
  const ref = useRef<HTMLDialogElement>(null);
  const { lines, profile, setQty, remove, clearGame, setProfile } = useCart();
  const [mounted, setMounted] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => setMounted(true), []);

  if (!mounted || path.startsWith("/admin")) return null;

  const count = lines.reduce((a, l) => a + l.qty, 0);
  const total = lines.reduce((a, l) => a + l.qty * l.price, 0);
  if (!count) return null;

  const groups = new Map<string, Line[]>();
  lines.forEach((l) => groups.set(l.gameSlug, [...(groups.get(l.gameSlug) ?? []), l]));

  const send = (items: Line[]) => {
    if (!profile.name.trim() || !profile.account.trim()) {
      setErr("Isi nama dan ID / Server akun dulu");
      return;
    }
    setErr("");
    const f = items[0];
    const sum = items.reduce((a, l) => a + l.qty * l.price, 0);
    const text = [
      f.csName ? `Halo kak ${f.csName}, saya mau pesan:` : "Halo admin, saya mau pesan:",
      "",
      `Game: ${f.game}`,
      "",
      ...items.flatMap((l, i) => [
        `${i + 1}. ${l.name}`,
        `   Jumlah: ${l.qty} ${l.unit}`,
        ...l.picks.map((p) => `   ${p.label}: ${p.value}`),
        `   Subtotal: ${rp(l.qty * l.price)}`,
      ]),
      "",
      `Total: ${rp(sum)}`,
      "",
      `Nama: ${profile.name.trim()}`,
      `ID / Server akun: ${profile.account.trim()}`,
      `Jadwal mulai: ${profile.schedule.trim() || "-"}`,
    ].join("\n");
    window.open(`https://wa.me/${f.cs || DEFAULT_WA}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const inp = "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black";

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => ref.current?.showModal()}
          className="pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-3 rounded-full bg-[#0d0c22] py-3 pl-4 pr-3 text-white shadow-2xl"
        >
          <span className="relative">
            <Icon name="cart" className="h-6 w-6" />
            <span className="absolute -right-2 -top-2 rounded-full bg-pink-500 px-1.5 text-[10px] font-bold">{count}</span>
          </span>
          <span className="flex-1 text-left text-sm font-semibold">Keranjang · {rp(total)}</span>
          <span className="rounded-full bg-pink-500 px-4 py-2 text-sm font-bold">Lihat</span>
        </button>
      </div>

      <dialog
        ref={ref}
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
        className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl p-0 shadow-2xl backdrop:bg-black/50 sm:m-auto sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-lg font-extrabold">Keranjang</h2>
            <button type="button" aria-label="Tutup" onClick={() => ref.current?.close()} className="rounded-full p-2 hover:bg-gray-100">
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4">
            <div className="grid gap-3 rounded-2xl bg-gray-50 p-4">
              <p className="text-sm font-bold">Data pemesan</p>
              <input value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} placeholder="Nama *" autoComplete="name" className={inp} />
              <input value={profile.account} onChange={(e) => setProfile({ account: e.target.value })} placeholder="ID / Server akun game *" className={inp} />
              <input value={profile.schedule} onChange={(e) => setProfile({ schedule: e.target.value })} placeholder="Jadwal mulai (opsional, mis. besok 19.00)" className={inp} />
            </div>

            {[...groups.entries()].map(([slug, items]) => {
              const sum = items.reduce((a, l) => a + l.qty * l.price, 0);
              const f = items[0];
              return (
                <section key={slug} className="rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div>
                      <b>{f.game}</b>
                      <p className="text-xs text-gray-500">CS {f.csName ?? "Admin"}</p>
                    </div>
                    <button type="button" onClick={() => confirm(`Kosongkan pesanan ${f.game}?`) && clearGame(slug)} className="text-xs font-semibold text-gray-500 hover:text-red-600">
                      Kosongkan
                    </button>
                  </div>

                  <ul className="divide-y divide-gray-100">
                    {items.map((l) => (
                      <li key={l.key} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-snug">{l.name}</p>
                            {l.picks.map((p) => (
                              <p key={p.label} className="mt-0.5 break-words text-xs text-gray-500">{p.label}: {p.value}</p>
                            ))}
                            <p className="mt-1 text-xs text-gray-500">{rp(l.price)} {l.unit}</p>
                          </div>
                          <button type="button" aria-label="Hapus" onClick={() => remove(l.key)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600">
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
                            <button type="button" aria-label="Kurangi" disabled={l.qty <= 1} onClick={() => setQty(l.key, l.qty - 1)} className="flex h-9 w-9 items-center justify-center hover:bg-gray-50 disabled:text-gray-300">
                              <Icon name="minus" className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-pink-600">{l.qty}</span>
                            <button type="button" aria-label="Tambah" onClick={() => setQty(l.key, l.qty + 1)} className="flex h-9 w-9 items-center justify-center hover:bg-gray-50">
                              <Icon name="plus" className="h-4 w-4" />
                            </button>
                          </div>
                          <b>{rp(l.qty * l.price)}</b>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gray-100 p-4">
                    <button
                      type="button" onClick={() => send(items)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 py-3.5 font-bold text-white hover:bg-pink-600"
                    >
                      <Icon name="chat" className="h-5 w-5" />Kirim ke CS {f.csName ?? "Admin"} · {rp(sum)}
                    </button>
                  </div>
                </section>
              );
            })}

            {err && (
              <p className="flex items-center gap-2 text-sm font-semibold text-red-600">
                <Icon name="alert" className="h-4 w-4 shrink-0" />{err}
              </p>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}