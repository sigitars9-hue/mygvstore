"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { rp, type Service, type ServiceOption } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";
import { Icon } from "@/components/Icons";
import ZoomImage from "@/components/ZoomImage";

const DEFAULT_WA = process.env.NEXT_PUBLIC_WA_NUMBER;

export default function ServiceRow({
  s, title, game, gameSlug, gameIcon, cs, csName,
}: { s: Service; title?: string; game: string; gameSlug: string; gameIcon?: string | null; cs?: string | null; csName?: string | null }) {
  const ref = useRef<HTMLDialogElement>(null);
  const add = useCart((x) => x.add);
  const [qty, setQty] = useState(1);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");

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
    const p = picks();
    if (!p) return;
    add({
      serviceId: s.id, name: s.name, unit: s.unit, price: s.price, qty,
      game, gameSlug, cs: cs ?? null, csName: csName ?? null, picks: p,
    });
    setQty(1); setSel({}); setErr("");
    close();
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
    <li>
      <button type="button" onClick={() => ref.current?.showModal()} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-gray-50 sm:p-5">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
          {img && <Image src={img} alt="" fill sizes="56px" className="object-cover" />}
        </span>
        <span className="min-w-0 flex-1">
          <b className="line-clamp-2 block font-semibold leading-snug text-[#0d0c22]">{title ?? s.name}</b>
          <span className="mt-0.5 block text-xs text-gray-500">{s.duration ? `Estimasi ${s.duration} · ` : ""}{s.unit}</span>
          {opts.length > 0 && (
            <span className="mt-1 inline-block rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-600">Ada pilihan</span>
          )}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1.5">
          <b className="text-[15px]">{rp(s.price)}</b>
          <span className="rounded-full bg-[#0d0c22] px-3.5 py-1.5 text-xs font-bold text-white">Pilih</span>
        </span>
      </button>

      <dialog
        ref={ref}
        onClick={(e) => { if (e.target === ref.current) close(); }}
        className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl p-0 shadow-2xl backdrop:bg-black/50 sm:m-auto sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex gap-4 p-5">
            {img && <ZoomImage src={img} alt={s.name} sizes="112px" className="h-28 w-28 shrink-0 rounded-2xl bg-gray-100" />}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">{game}</p>
              <h3 className="font-bold leading-snug text-[#0d0c22]">{s.name}</h3>
              <div className="mt-1 text-2xl font-extrabold tracking-tight text-pink-600">
                {rp(s.price)} <span className="text-xs font-medium text-gray-500">{s.unit}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">CS {csName ?? "Admin"}{s.duration ? ` · Estimasi ${s.duration}` : ""}</p>
            </div>
            <button type="button" onClick={close} aria-label="Tutup" className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-full hover:bg-gray-100">
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain border-t border-gray-100 px-5 py-4">
            {s.description && <p className="text-sm leading-relaxed text-gray-600">{s.description}</p>}
            {!!s.includes?.length && (
              <ul className="space-y-1.5 text-sm text-gray-700">
                {s.includes.map((x) => (
                  <li key={x} className="flex items-start gap-2">
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
                    className="w-full rounded-2xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-black" />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {o.choices?.map((c) => {
                      const on = sel[o.label] === c;
                      return (
                        <button key={c} type="button" aria-pressed={on} onClick={() => set(o.label, c)}
                          className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition ${on ? "border-pink-500 bg-pink-50 text-pink-600" : "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
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
                <button type="button" aria-label="Kurangi" disabled={qty <= 1} onClick={() => setQty(qty - 1)} className="flex h-10 w-10 items-center justify-center hover:bg-gray-50 disabled:text-gray-300">
                  <Icon name="minus" className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-bold text-pink-600">{qty}</span>
                <button type="button" aria-label="Tambah" disabled={qty >= 99} onClick={() => setQty(qty + 1)} className="flex h-10 w-10 items-center justify-center hover:bg-gray-50 disabled:text-gray-300">
                  <Icon name="plus" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {err && (
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-600">
                <Icon name="alert" className="h-4 w-4 shrink-0" />{err}
              </p>
            )}
            <button type="button" onClick={addToCart} className="flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 py-4 text-base font-bold text-white hover:bg-pink-600">
              <Icon name="cart" className="h-5 w-5" />Tambah ke keranjang · {rp(total)}
            </button>
            <button type="button" onClick={orderNow} className="mt-2 w-full rounded-full py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Langsung pesan via WhatsApp
            </button>
          </div>
        </div>
      </dialog>
    </li>
  );
}