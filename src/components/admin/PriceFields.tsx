"use client";
import { useState } from "react";
import { rp } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import { inp, lbl } from "@/components/admin/ui";

const num = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const pctOf = (o: number, p: number) => (o > p && p > 0 ? String(Math.round((1 - p / o) * 100)) : "");

export default function PriceFields({ s }: { s?: { price?: number; original_price?: number | null } }) {
  const [orig, setOrig] = useState(s?.original_price ? String(s.original_price) : "");
  const [price, setPrice] = useState(s?.price != null ? String(s.price) : "");
  const [pct, setPct] = useState(pctOf(num(orig), num(price)));

  const onOrig = (v: string) => { setOrig(v); setPct(pctOf(num(v), num(price))); };
  const onPrice = (v: string) => { setPrice(v); setPct(pctOf(num(orig), num(v))); };
  const onPct = (v: string) => {
    setPct(v);
    const o = num(orig), d = num(v);
    if (o > 0 && d > 0 && d < 100) setPrice(String(Math.round((o * (1 - d / 100)) / 500) * 500));
  };

  const promo = num(orig) > num(price) && num(price) > 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3 sm:col-span-2">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={lbl}>Harga normal (Rp, opsional)</label>
          <input name="original_price" type="number" min={0} step={500} value={orig}
            onChange={(e) => onOrig(e.target.value)} placeholder="kosong = tanpa promo" className={inp} />
        </div>
        <div>
          <label className={lbl}>Potongan (%)</label>
          <input type="number" min={1} max={99} value={pct} onChange={(e) => onPct(e.target.value)}
            disabled={!num(orig)} placeholder="mis. 20" className={`${inp} disabled:opacity-50`} />
        </div>
        <div>
          <label className={lbl}>Harga jual / promo (Rp)</label>
          <input name="price" type="number" min={0} step={500} value={price} required
            onChange={(e) => onPrice(e.target.value)} className={inp} />
        </div>
      </div>
      {promo ? (
        <p className="animate-fade-up mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-extrabold text-white">-{pct}%</span>
          <span className="text-gray-400 line-through">{rp(num(orig))}</span>
          <b className="text-red-600">{rp(num(price))}</b>
          <span className="text-xs text-gray-500">hemat {rp(num(orig) - num(price))}</span>
        </p>
      ) : num(orig) > 0 ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-600">
          <Icon name="alert" className="h-4 w-4" />Harga normal harus lebih besar dari harga jual.
        </p>
      ) : null}
    </div>
  );
}