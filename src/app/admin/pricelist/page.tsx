import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { rp } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit, DeleteButton } from "@/components/admin/SaveForm";
import ServiceFields from "@/components/admin/ServiceFields";
import { saveService, addService, deleteService } from "@/app/actions/admin";
import { card } from "@/components/admin/ui";

export default async function AdminPricelist({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const { game } = await searchParams;
  await requireAdmin();

  const { data: gs } = await db.from("games").select("id,slug,name").order("sort");
  const games = gs ?? [];
  const g = games.find((x) => x.slug === game) ?? games[0];

  if (!g) {
    return (
      <AdminShell active="pricelist">
        <p className="text-gray-600">Belum ada game. Tambahkan dulu di tab Game & Harga.</p>
      </AdminShell>
    );
  }

  const { data: jk } = await db.from("jokis").select("id,name").eq("game_id", g.id).order("name");
  const jokis = jk ?? [];
  const jokiName: Record<string, string> = Object.fromEntries(jokis.map((j) => [j.id, j.name]));
  const services: any[] = jokis.length
    ? (await db.from("services").select("*").in("joki_id", jokis.map((j) => j.id))).data ?? []
    : [];
  services.sort((a, b) => a.name.localeCompare(b.name, "id") || a.price - b.price);

  return (
    <AdminShell active="pricelist">
      <h1 className="text-3xl font-bold tracking-tight text-[#0d0c22]">Pricelist</h1>
      <p className="mt-2 text-gray-600">Atur harga, gambar, deskripsi, dan pilihan tambahan tiap layanan.</p>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((x) => (
          <Link
            key={x.slug} href={`/admin/pricelist?game=${x.slug}`}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
              x.slug === g.slug ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"
            }`}
          >
            {x.name}
          </Link>
        ))}
      </div>

      <div className={`${card} mt-4`}>
        <h2 className="text-lg font-bold">{g.name}</h2>
        {!jokis.length && (
          <p className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-50 p-3.5 text-sm text-amber-800">
            <Icon name="alert" className="h-4 w-4 shrink-0" />
            Tambahkan grup (joki) dulu di halaman game, baru layanan bisa dibuat.
          </p>
        )}

        <div className="mt-2">
          {services.map((s) => (
            <details key={s.id} className="group border-b border-gray-100">
              <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#0d0c22]">{s.name}</p>
                  <p className="text-xs text-gray-500">
                    {jokiName[s.joki_id] ?? "-"} · {s.duration || "-"} · {s.unit}
                    {(s.options ?? []).length > 0 && ` · ${s.options.length} pilihan`}
                  </p>
                </div>
                {!s.is_active && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">Nonaktif</span>}
                <span className="font-bold">{rp(s.price)}</span>
                <Icon name="chevron" className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="pb-5 pt-1">
                <SaveForm action={saveService} className="grid gap-4 sm:grid-cols-2">
                  <input type="hidden" name="id" value={s.id} />
                  <ServiceFields s={s} jokis={jokis} />
                  <div className="col-span-full"><Submit>Simpan layanan</Submit></div>
                </SaveForm>
                <SaveForm action={deleteService} className="mt-3">
                  <input type="hidden" name="id" value={s.id} />
                  <DeleteButton confirmText="Hapus layanan ini?">Hapus layanan</DeleteButton>
                </SaveForm>
              </div>
            </details>
          ))}
          {!services.length && jokis.length > 0 && <p className="py-4 text-sm text-gray-500">Belum ada layanan.</p>}
        </div>

        {jokis.length > 0 && (
          <details className="mt-4 rounded-2xl border border-dashed border-gray-300 p-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold [&::-webkit-details-marker]:hidden">
              <Icon name="plus" className="h-4 w-4" />Tambah layanan
            </summary>
            <SaveForm action={addService} resetOnOk className="mt-4 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="game_slug" value={g.slug} />
              <ServiceFields jokis={jokis} />
              <div className="col-span-full"><Submit>Tambah layanan</Submit></div>
            </SaveForm>
          </details>
        )}
      </div>
    </AdminShell>
  );
}