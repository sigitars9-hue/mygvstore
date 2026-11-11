"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icons";
import { rp } from "@/lib/utils";

type Vals = Record<string, string[]>;

const readForm = (form: HTMLFormElement): Vals => {
  const out: Vals = {};
  new FormData(form).forEach((v, k) => {
    if (typeof v === "string") (out[k] ??= []).push(v);
  });
  return out;
};
const one = (v: Vals, k: string) => v[k]?.[0]?.trim() ?? "";
const safeSrc = (u: string) => (u.startsWith("/") || u.startsWith("http") ? u : "");

function useFormValues() {
  const anchor = useRef<HTMLDivElement>(null);
  const base = useRef("");
  const [v, setV] = useState<Vals>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const form = anchor.current?.closest("form");
    if (!form) return;
    base.current = JSON.stringify(readForm(form));

    const sync = () => {
      const next = readForm(form);
      const s = JSON.stringify(next);
      setV((p) => (JSON.stringify(p) === s ? p : next));
      setDirty(s !== base.current);
    };
    // Hanya anggap "tersimpan" kalau server menjawab berhasil
    const onSaved = (e: Event) => {
      if (!(e as CustomEvent<{ ok: boolean }>).detail?.ok) return;
      base.current = JSON.stringify(readForm(form));
      sync();
    };

    sync();
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    form.addEventListener("saveform", onSaved);
    // Upload gambar mengubah input hidden lewat kode (tidak memicu event), jadi dicek berkala
    const t = setInterval(sync, 500);
    return () => {
      clearInterval(t);
      form.removeEventListener("input", sync);
      form.removeEventListener("change", sync);
      form.removeEventListener("saveform", onSaved);
    };
  }, []);

  return { anchor, v, dirty };
}

function Shell({ anchor, dirty, children }: { anchor: React.RefObject<HTMLDivElement | null>; dirty: boolean; children: ReactNode }) {
  return (
    <div ref={anchor} className="col-span-full rounded-2xl border border-dashed border-pink-200 bg-gradient-to-br from-pink-50/60 to-violet-50/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-pink-600">
          <Icon name="sparkle" className="h-3.5 w-3.5" />Pratinjau langsung
        </span>
        {dirty ? (
          <span key="d" className="animate-pop-in flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />Belum disimpan
          </span>
        ) : (
          <span key="s" className="animate-pop-in flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <Icon name="check" className="h-3 w-3" />Tersimpan
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ---------- Game: mirip kartu di beranda ---------- */
export function GamePreview() {
  const { anchor, v, dirty } = useFormValues();
  const name = one(v, "name") || "Nama game";
  const icon = safeSrc(one(v, "icon_url"));
  const badges = one(v, "badges").split(",").map((s) => s.trim()).filter(Boolean);
  const pic = one(v, "cs_name") || "Admin";
  const soon = !!v.is_soon;

  return (
    <Shell anchor={anchor} dirty={dirty}>
      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0d0c22] font-black text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {icon ? <img src={icon} alt="" className="h-full w-full object-cover" /> : name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <b className="text-base text-[#0d0c22]">{name}</b>
              {badges.map((b) => (
                <span key={b} className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-extrabold text-white">{b}</span>
              ))}
              {soon && <span className="rounded-md bg-pink-500 px-2 py-0.5 text-[10px] font-extrabold text-white">SEGERA</span>}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
              <Icon name="chat" className="h-4 w-4 text-gray-400" />PIC/CS: <b className="text-[#0d0c22]">{pic}</b>
            </p>
          </div>
          <span className="hidden rounded-full bg-[#0d0c22] px-4 py-2 text-xs font-bold text-white sm:block">
            {soon ? "Segera hadir" : "Lihat Joki"}
          </span>
        </div>
      </div>
    </Shell>
  );
}

/* ---------- Layanan: mirip baris di halaman game ---------- */
export function ServicePreview() {
  const { anchor, v, dirty } = useFormValues();
  const img = safeSrc(one(v, "image_url"));
  const price = Number(one(v, "price")) || 0;
  const unit = one(v, "unit") || "per paket";
  const dur = one(v, "duration");
  const sub = one(v, "sub_category");

  return (
    <Shell anchor={anchor} dirty={dirty}>
      <div className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img && <img src={img} alt="" className="h-full w-full object-cover" />}
        </span>
        <span className="min-w-0 flex-1">
          <b className="line-clamp-2 block font-semibold leading-snug text-[#0d0c22]">{one(v, "name") || "Nama layanan"}</b>
          <span className="mt-0.5 block text-xs text-gray-500">{dur ? `Estimasi ${dur} · ` : ""}{unit}{sub ? ` · ${sub}` : ""}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1.5">
          <b className="text-[15px]">{rp(price)}</b>
          <span className="rounded-full bg-[#0d0c22] px-3.5 py-1.5 text-xs font-bold text-white">Pilih</span>
        </span>
      </div>
    </Shell>
  );
}

/* ---------- Banner ---------- */
export function BannerPreview() {
  const { anchor, v, dirty } = useFormValues();
  const img = safeSrc(one(v, "image_url"));
  const active = !!v.is_active;

  return (
    <Shell anchor={anchor} dirty={dirty}>
      <div className="relative mx-auto aspect-[1376/768] w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img ? <img src={img} alt={one(v, "alt")} className={`h-full w-full object-cover transition ${active ? "" : "grayscale"}`} />
          : <span className="flex h-full items-center justify-center gap-2 text-sm font-semibold text-gray-400"><Icon name="image" className="h-5 w-5" />Belum ada gambar</span>}
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          <Icon name="external" className="h-3 w-3" />{one(v, "href") || "/"}
        </span>
        {!active && (
          <span className="absolute right-3 top-3 rounded-full bg-gray-900/80 px-2.5 py-1 text-[11px] font-bold text-white">Nonaktif</span>
        )}
      </div>
    </Shell>
  );
}

/* ---------- Testimoni ---------- */
export function TestiPreview() {
  const { anchor, v, dirty } = useFormValues();
  const user = one(v, "username").replace(/^@/, "") || "username";
  const body = one(v, "body") || "Isi komentar akan tampil di sini.";
  const active = !!v.is_active;

  return (
    <Shell anchor={anchor} dirty={dirty}>
      <div className={`flex gap-3 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition ${active ? "" : "opacity-50"}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 font-bold uppercase text-white">
          {user.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold text-[#0d0c22]">
            @{user}{!active && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">Disembunyikan</span>}
          </p>
          <p className="mt-0.5 whitespace-pre-line break-words text-sm text-gray-600">{body}</p>
        </div>
      </div>
    </Shell>
  );
}

/* ---------- Syarat & Ketentuan ---------- */
export function TermsPreview() {
  const { anchor, v, dirty } = useFormValues();
  const titles = v.t_title ?? [];
  const bodies = v.t_body ?? [];
  const items = titles.map((t, i) => ({ t: t.trim(), b: (bodies[i] ?? "").trim() })).filter((x) => x.t);

  return (
    <Shell anchor={anchor} dirty={dirty}>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Belum ada poin.</p>
      ) : (
        <ol className="space-y-2">
          {items.map((x, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0d0c22] text-xs font-bold text-white">{i + 1}</span>
              <div className="min-w-0">
                <b className="block text-sm text-[#0d0c22]">{x.t}</b>
                {x.b && <p className="mt-0.5 whitespace-pre-line text-sm text-gray-600">{x.b}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Shell>
  );
}