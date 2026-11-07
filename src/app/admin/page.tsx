import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/app/actions/admin";
import { rp, STAGES } from "@/lib/utils";

const PAY = {
  unpaid: ["Belum bayar", "bg-gray-100 text-gray-600"],
  proof: ["Cek bukti", "bg-amber-100 text-amber-700"],
  paid: ["Lunas", "bg-emerald-100 text-emerald-700"],
  rejected: ["Bukti ditolak", "bg-red-100 text-red-700"],
} as const;

export default async function Admin() {
  const sb = await requireAdmin();
  const { data } = await sb
    .from("orders")
    .select("code,customer_name,total_pay,pay_status,pay_deadline,stage,progress,cancelled,created_at")
    .order("created_at", { ascending: false });
  const orders = data ?? [];
  const waiting = orders.filter((o) => o.pay_status === "proof").length;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Dashboard Admin</h1>
        <form action={signOut}><button className="text-sm text-gray-500">Keluar</button></form>
      </div>
      {waiting > 0 && (
        <p className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">⏳ {waiting} bukti pembayaran menunggu verifikasi.</p>
      )}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50"><tr>
            {["Kode", "Pelanggan", "Tagihan", "Bayar", "Tahap", ""].map((h) => <th key={h} className="p-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={6} className="p-4 text-gray-500">Belum ada pesanan.</td></tr>}
            {orders.map((o) => {
              const expired = o.cancelled || (o.pay_status !== "paid" && new Date(o.pay_deadline) < new Date());
              const [label, cls] = PAY[o.pay_status as keyof typeof PAY];
              return (
                <tr key={o.code} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{o.code}</td>
                  <td className="p-3">{o.customer_name}</td>
                  <td className="p-3">{rp(o.total_pay)}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}</span></td>
                  <td className="p-3">{expired ? "Dibatalkan" : `${STAGES[o.stage]} (${o.progress}%)`}</td>
                  <td className="p-3"><Link href={`/admin/${o.code}`} className="font-bold text-pink-600">Kelola</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}