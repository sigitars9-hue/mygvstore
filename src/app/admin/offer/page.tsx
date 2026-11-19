import { requireAdmin } from "@/lib/auth";
import { getOffers } from "@/lib/offers";
import AdminShell from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/admin/AdminKit";
import { card } from "@/components/admin/ui";
import OfferForm from "@/components/admin/OfferForm";

export default async function AdminOffers() {
  await requireAdmin();
  const offers = await getOffers(false);

  return (
    <AdminShell active="offers">
      <PageHeader title="Limited Offers" desc="Gambar rasio 4:5 (mis. 800×1000) yang bergulir di atas daftar game." />

      <div className={`${card} mt-6`}>
        <h2 className="mb-4 text-lg font-bold text-[#0d0c22]">Tambah offer</h2>
        <OfferForm />
      </div>

      <div className="mt-6 grid gap-4">
        {offers.map((o) => (
          <div key={o.id} className={card}>
            <OfferForm offer={o} />
          </div>
        ))}
        {!offers.length && <p className="py-8 text-center text-gray-500">Belum ada offer.</p>}
      </div>
    </AdminShell>
  );
}