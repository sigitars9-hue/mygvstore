"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { rp, type Service, type ServiceOption } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";
import { Icon } from "@/components/Icons";
import ZoomImage from "@/components/ZoomImage";

const DEFAULT_WA = process.env.NEXT_PUBLIC_WA_NUMBER;

export default function ServiceRow({
  s, title, game, gameSlug, gameIcon, cs, csName, index = 0,
}: {
  s: Service; title?: string; game: string; gameSlug: string;
  gameIcon?: string | null; cs?: string | null; csName?: string | null; index?: number;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const add = useCart((x) => x.add);
  const [qty, setQty] = useState(1);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const opts: ServiceOption[] = s.options ?? [];
  const img = s.image_url || gameIcon || null;
  const total = s.price * qty;
  const close = () => ref.current?.close();
  const set = (label: string, v: string) => { setSel((p) => ({ ...p, [label]: v })); setErr(""); };

  const picks = () => {
    const miss = opts.find((o) => o.required && !(sel[o.label] ?? "").trim());
    if (miss) { setErr(`${miss.type === "text" ? "Isi" : "Pilih"} "${miss.label}" dulu`); return null; }
    return opts.filter((o) => (sel[o.label] ?? "").trim()).map((o) => ({ label: o.label, value: sel[o.label].trim() }));
  };

  const addToCart = () => {
    if (added) return;
    const p = picks();
    if (!p) return;
    add({
      serviceId: s.id, name: s.name, unit: s.unit, price: s.price, qty,
      game, gameSlug, cs: cs ?? null, csName: csName ?? null, picks: p,
    });
    setAdded(true);
    timer.current = setTimeout(() => {
      setQty(1); setSel({}); setErr(""); setAdded(false);
      close();
    }, 700);
  };

  const orderNow = () => {
    const p = picks();
    if (!p) return;
    const text = [
      csName ? `Halo kak ${csName}, saya mau pesan:` : "Halo admin, saya mau pesan:",
      "", `Game: ${game}`, `Layanan: ${s.name}`, `Jumlah: ${qty} ${s.unit}`,
      ...p.map((x) => `${x.label}: ${x.value}`),
      `Total: ${rp(total)}`, "", "Nama:", "ID / Server akun:", "Jadwal mulai:",
    ].join("\n");
    window.open(`https://wa.me/${cs || DEFAULT_WA}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <li className="animate-fade-up" style={{ "--i": Math.min(index, 8) } as React.CSSProperties}>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="group flex w-full items-center gap-3 p-4 text-left transition hover:bg-gradient-to-r hover:from-pink-50/60 hover:to-transparent active:scale-[0.99] sm:p-5"
      >
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200 transition group-hover:ring-pink-300">
          {img && <Image src={img} alt="" fill sizes="56px" className="object-cover transition duration-500 group-hover:scale-110" />}
        </span>
        <span className="min-w-0 flex-1">
          <b className="line-clamp-2 block font-semibold leading-snug text-[#0d0c22]">{title ?? s.name}</b>
          <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            {s.duration && <Icon name="clock" className="h-3 w-3" />}
            {s.duration ? `${s.duration} · ` : ""}{s.unit}
          </span>
          {opts.length > 0 && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-600">
              <Icon name="sparkle" className="h-3 w-3" />Ada pilihan
            </span>
          )}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1.5">
          <b className="text-[15px] text-[#0d0c22] transition group-hover:text-pink-600">{rp(s.price)}</b>
          <span className="flex items-center gap-1 rounded-full bg-[#0d0c22] py-1.5 pl-3.5 pr-2.5 text-xs font-bold text-white transition group-hover:bg-pink-500 group-hover:shadow-lg group-hover:shadow-pink-500/30">
            Pilih
            <Icon name="right" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </span>
      </button>

      <dialog
        ref={ref}
        onClick={(e) => { if (e.target === ref.current) close(); }}
        className="sheet m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex gap-4 p-5">
            {img && <ZoomImage src={img} alt={s.name} sizes="112px" className="h-28 w-28 shrink-0 rounded-2xl bg-gray-100 shadow-md" />}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500">{game}</p>
              <h3 className="font-bold leading-snug text-[#0d0c22]">{s.name}</h3>
              <div className="mt-1 text-2xl font-extrabold tracking-tight text-pink-600">
                {rp(s.price)} <span className="text-xs font-medium text-gray-500">{s.unit}</span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <Icon name="chat" className="h-3 w-3" />CS {csName ?? "Admin"}
                {s.duration && <><span>·</span><Icon name="clock" className="h-3 w-3" />{s.duration}</>}
              </p>
            </div>
            <button type="button" onClick={close} aria-label="Tutup"
              className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-full transition hover:rotate-90 hover:bg-gray-100 active:scale-90">
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain border-t border-gray-100 px-5 py-4">
            {s.description && <p className="text-sm leading-relaxed text-gray-600">{s.description}</p>}
            {!!s.includes?.length && (
              <ul className="space-y-1.5 text-sm text-gray-700">
                {s.includes.map((x, i) => (
                  <li key={x} className="animate-fade-up flex items-start gap-2" style={{ "--i": i } as React.CSSProperties}>
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{x}
                  </li>
                ))}
              </ul>
            )}

            {opts.map((o) => (
              <div key={o.label}>
                <p className="mb-2 text-sm font-semibold text-[#0d0c22]">{o.label}{o.required && <span className="text-pink-500"> *</span>}</p>
                {o.type === "text" ? (
                  <textarea rows={3} value={sel[o.label] ?? ""} onChange={(e) => set(o.label, e.target.value)} placeholder={o.hint}
                    className="w-full rounded-2xl border border-gray-200 px-3.5 py-3 text-sm outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100" />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {o.choices?.map((c) => {
                      const on = sel[o.label] === c;
                      return (
                        <button key={c} type="button" aria-pressed={on} onClick={() => set(o.label, c)}
                          className={`flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${on ? "border-pink-500 bg-pink-50 text-pink-600 shadow-sm shadow-pink-200" : "border-transparent bg-gray-100 text-gray-700 hover:-translate-y-0.5 hover:bg-gray-200"}`}>
                          {on && <Icon name="check" className="animate-pop-in h-3.5 w-3.5" />}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="font-semibold text-[#0d0c22]">Jumlah</span>
              <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
                <button type="button" aria-label="Kurangi" disabled={qty <= 1} onClick={() => setQty(qty - 1)}
                  className="flex h-10 w-10 items-center justify-center transition hover:bg-gray-50 active:scale-90 disabled:text-gray-300">
                  <Icon name="minus" className="h-4 w-4" />
                </button>
                <span key={qty} className="animate-bump w-12 text-center font-bold text-pink-600">{qty}</span>
                <button type="button" aria-label="Tambah" disabled={qty >= 99} onClick={() => setQty(qty + 1)}
                  className="flex h-10 w-10 items-center justify-center transition hover:bg-gray-50 active:scale-90 disabled:text-gray-300">
                  <Icon name="plus" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {err && (
              <p key={err} className="animate-shake mb-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                <Icon name="alert" className="h-4 w-4 shrink-0" />{err}
              </p>
            )}
            <button type="button" onClick={addToCart} disabled={added}
              className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white shadow-lg transition active:scale-[0.98] ${added ? "bg-emerald-500 shadow-emerald-500/30" : "bg-pink-500 shadow-pink-500/30 hover:-translate-y-0.5 hover:bg-pink-600"}`}>
              {added ? (
                <><Icon name="check" className="animate-pop-in h-5 w-5" />Ditambahkan</>
              ) : (
                <><Icon name="cart" className="h-5 w-5" />Tambah ke keranjang · {rp(total)}</>
              )}
            </button>
            <button type="button" onClick={orderNow}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-[#0d0c22]">
              <Icon name="chat" className="h-4 w-4" />Langsung pesan via WhatsApp
            </button>
          </div>
        </div>
      </dialog>
    </li>
  );
}