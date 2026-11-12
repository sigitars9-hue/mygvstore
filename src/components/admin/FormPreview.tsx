"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icons";
import { rp, badgeTone } from "@/lib/utils";

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

// Pratinjau tanpa kotak pembungkus: hanya garis pemisah, judul, dan status
function Shell({ anchor, dirty, children }: { anchor: React.RefObject<HTMLDivElement | null>; dirty: boolean; children: ReactNode }) {
  return (
    <div ref={anchor} className="col-span-full border-t border-gray-100 pt-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Icon name="sparkle" className="h-3.5 w-3.5" />Pratinjau
        </span>
        {dirty ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />Belum disimpan
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
            <Icon name="check" className="h-3.5 w-3.5" />Tersimpan
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

const card = "rounded-xl border border-gray-200 bg-white";

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
      <div className={`${card} p-3.5`}>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0d0c22] font-black text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {icon ? <img src={icon} alt="" className="h-full w-full object-cover" /> : name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <b className="text-base text-[#0d0c22]">{name}</b>
              {badges.map((b) => (
                <span key={b} className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white ${badgeTone(b)}`}>{b}</span>
              ))}
              {soon && <span className="rounded-md bg-pink-500 px-2 py-0.5 text-[10px] font-extrabold text-white">SEGERA</span>}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
              <Icon name="chat" className="h-4 w-4 text-gray-400" />Customer Service: <b className="text-[#0d0c22]">{pic}</b>
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
  const orig = Number(one(v, "original_price")) || 0;
  const promo = orig > price && price > 0;
  const pct = promo ? Math.round((1 - price / orig) * 100) : 0;

  return (
    <Shell anchor={anchor} dirty={dirty}>
      <div className={`${card} flex items-center gap-3 p-3.5`}>
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-14 sm:w-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img && <img src={img} alt="" className="h-full w-full object-cover" />}
        </span>
        <span className="min-w-0 flex-1">
          <b className="line-clamp-2 block text-sm font-semibold leading-snug text-[#0d0c22] sm:text-base">{one(v, "name") || "Nama layanan"}</b>
          <span className="mt-0.5 block truncate text-xs text-gray-500">{dur ? `Estimasi ${dur} · ` : ""}{unit}{sub ? ` · ${sub}` : ""}</span>
          {promo && <span className="mt-1 inline-block rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">PROMO -{pct}%</span>}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="flex flex-col items-end leading-tight">
            {promo && <span className="text-[11px] text-gray-400 line-through">{rp(orig)}</span>}
            <b className={`text-[15px] ${promo ? "text-red-600" : ""}`}>{rp(price)}</b>
          </span>
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
      <div className="relative aspect-[1376/768] w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img ? <img src={img} alt={one(v, "alt")} className={`h-full w-full object-cover transition ${active ? "" : "grayscale"}`} />
          : <span className="flex h-full items-center justify-center gap-2 text-sm font-medium text-gray-400"><Icon name="image" className="h-5 w-5" />Belum ada gambar</span>}
        <span className="absolute left-2.5 top-2.5 flex max-w-[70%] items-center gap-1 truncate rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
          <Icon name="external" className="h-3 w-3 shrink-0" /><span className="truncate">{one(v, "href") || "/"}</span>
        </span>
        {!active && (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-gray-900/80 px-2 py-1 text-[11px] font-semibold text-white">Nonaktif</span>
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
      <div className={`${card} flex gap-3 p-3.5 transition ${active ? "" : "opacity-50"}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 font-bold uppercase text-white">
          {user.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold text-[#0d0c22]">
            @{user}{!active && <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">Disembunyikan</span>}
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
        <ol className={`${card} divide-y divide-gray-100`}>
          {items.map((x, i) => (
            <li key={i} className="flex gap-3 p-3">
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