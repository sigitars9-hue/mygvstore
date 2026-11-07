import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { confirmPayment, rejectProof, updateProgress } from "@/app/actions/admin";
import { rp, STAGES } from "@/lib/utils";

export default async function AdminOrder({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const sb = await requireAdmin();
  const { data: o } = await sb
    .from("orders")
    .select("*, order_items(qty, unit_price, services(name, unit))")
    .eq("code", code)
    .maybeSingle();
  if (!o) notFound();

  const { data: logs } = await sb.from("progress_logs").select("*").eq("order_id", o.id).order("created_at", { ascending: false });

  let proofUrl: string | null = null;
  if (o.proof_path) {
    const { data } = await supabaseAdmin.storage.from("payment-proofs").createSignedUrl(o.proof_path, 600);
    proofUrl = data?.signedUrl ?? null;
  }

  const inp = "mb-3 w-full rounded-lg border p-2";
  const card = "rounded-xl border bg-white p-5";
  return (
    <>
      <Link href="/admin" className="text-sm text-gray-500">← Semua pesanan</Link>
      <h1 className="mb-3 mt-2 text-2xl font-extrabold">{o.code}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className={card}>
          <h2 className="mb-2 font-bold">Pelanggan</h2>
          <p>{o.customer_name}</p>
          <p className="text-sm text-gray-500">WhatsApp: {o.contact}</p>
          <p className="text-sm text-gray-500">Akun game: {o.game_account || "-"}</p>
          {o.schedule && <p className="text-sm text-gray-500">Jadwal: {new Date(o.schedule).toLocaleString("id-ID")}</p>}
          <h2 className="mb-1 mt-4 font-bold">Item</h2>
          {o.order_items.map((i: any, k: number) => (
            <p key={k} className="text-sm">{i.services?.name}: {i.qty} × {rp(i.unit_price)}</p>
          ))}
          <p className="mt-2 font-bold">Tagihan: {rp(o.total_pay)}</p>
        </div>

        <div className={card}>
          <h2 className="mb-2 font-bold">Pembayaran: {o.pay_status}</h2>
          {proofUrl ? (
            <a href={proofUrl} target="_blank">
              <img src={proofUrl} alt="Bukti transfer" className="mb-3 max-h-72 rounded-lg border" />
            </a>
          ) : (
            <p className="mb-3 text-sm text-gray-500">Belum ada bukti diunggah.</p>
          )}
          {o.pay_status !== "paid" && (
            <div className="flex gap-2">
              <form action={confirmPayment}>
                <input type="hidden" name="code" value={o.code} />
                <button className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white">✔ Konfirmasi bayar</button>
              </form>
              {o.pay_status === "proof" && (
                <form action={rejectProof}>
                  <input type="hidden" name="code" value={o.code} />
                  <button className="rounded-lg border border-red-500 px-4 py-2 font-bold text-red-600">Tolak bukti</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <form action={updateProgress} className={`${card} mt-4`}>
        <h2 className="mb-3 font-bold">Update progres joki</h2>
        <input type="hidden" name="code" value={o.code} />
        <label className="text-sm font-semibold">Tahap</label>
        <select name="stage" defaultValue={o.stage} className={inp}>
          {STAGES.map((s, i) => <option key={s} value={i}>{s}</option>)}
        </select>
        <label className="text-sm font-semibold">Progres (%)</label>
        <input name="progress" type="number" min={0} max={100} defaultValue={o.progress} className={inp} />
        <label className="text-sm font-semibold">Judul catatan (opsional)</label>
        <input name="title" placeholder="mis. Naik ke Legend III" className={inp} />
        <label className="text-sm font-semibold">Detail</label>
        <textarea name="detail" rows={2} className={inp} />
        <button className="rounded-lg bg-black px-5 py-2 font-bold text-white">Simpan update</button>
      </form>

      <div className={`${card} mt-4`}>
        <h2 className="mb-2 font-bold">Riwayat catatan</h2>
        {!logs?.length && <p className="text-sm text-gray-500">Belum ada catatan.</p>}
        {logs?.map((l) => (
          <div key={l.id} className="mb-2 rounded-lg border p-3">
            <b>{l.title}</b>
            <p className="text-sm text-gray-500">{l.detail}</p>
            <p className="text-xs text-gray-400">{new Date(l.created_at).toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>
    </>
  );
}