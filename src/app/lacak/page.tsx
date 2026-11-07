import { createClient } from "@/lib/supabase/server";
import type { Track } from "@/lib/utils";
import Timeline from "@/components/Timeline";
import PayBox from "@/components/PayBox";

export default async function Lacak({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const { kode } = await searchParams;
  let t: Track | null = null;
  if (kode) {
    const sb = await createClient();
    const { data } = await sb.rpc("track_order", { p_code: kode.trim() });
    t = data;
  }
  return (
    <div className="mx-auto max-w-xl">
      <form action="/lacak" className="mb-4 flex gap-2 rounded-xl border bg-white p-4">
        <input name="kode" defaultValue={kode} placeholder="Kode pesanan, mis. JK-1001" className="flex-1 rounded-lg border p-2" />
        <button className="rounded-lg bg-violet-600 px-4 font-bold text-white">Cek</button>
      </form>
      {kode && !t && <p className="text-gray-500">Kode tidak ditemukan.</p>}
      {t && (
        <div className="rounded-xl border bg-white p-5">
          <h1 className="mb-3 text-xl font-bold">{t.code} · {t.name}</h1>
          {t.cancelled ? (
            <p className="rounded-lg border border-pink-400 p-3">Pesanan dibatalkan karena batas waktu pembayaran terlewat. Silakan buat pesanan baru.</p>
          ) : (
            <>
              {t.pay_status !== "paid" && <PayBox t={t} />}
              {t.pay_status === "paid" && <p className="mb-2 text-sm text-emerald-600">✅ Pembayaran terkonfirmasi</p>}
              <Timeline t={t} />
            </>
          )}
        </div>
      )}
    </div>
  );
}