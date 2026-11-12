import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { rp, catOf, shortName, subGroups, hasPromo, discountPct, bySort, minSort } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit, DeleteButton } from "@/components/admin/SaveForm";
import ServiceFields from "@/components/admin/ServiceFields";
import ImageUpload from "@/components/admin/ImageUpload";
import ListFilter from "@/components/admin/ListFilter";
import { saveService, addService, deleteService, saveServiceCats, moveService, renameServiceCategory, deleteServiceCategory } from "@/app/actions/admin";
import { card, lbl } from "@/components/admin/ui";
import { PageHeader } from "@/components/admin/AdminKit";
import { ServicePreview } from "@/components/admin/FormPreview";
import { GAME_ICONS } from "@/lib/game-icons";

const nat = (a: string, b: string) => a.localeCompare(b, "id", { numeric: true });
const rangeOf = (n: number[]) => {
  const lo = Math.min(...n), hi = Math.max(...n);
  return lo === hi ? rp(lo) : `${rp(lo)} – ${rp(hi)}`;
};

export default async function AdminPricelist({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const { game } = await searchParams;
  await requireAdmin();

    const { data: gs } = await db.from("games").select("id,slug,name,icon_url,service_cat_images").order("sort");
  const games = gs ?? [];
  const g = games.find((x) => x.slug === game) ?? games[0];

  if (!g) {
    return (
      <AdminShell active="pricelist">
        <PageHeader title="Pricelist" desc="Atur kategori, sub kategori, harga, gambar, deskripsi, dan pilihan tambahan tiap layanan." />
        <p className="mt-6 text-gray-600">Belum ada game. Tambahkan dulu di tab Game & Harga.</p>
      </AdminShell>
    );
  }

  const { data: jk } = await db.from("jokis").select("id,name").eq("game_id", g.id).order("name");
  const jokis = jk ?? [];
  const jokiName: Record<string, string> = Object.fromEntries(jokis.map((j) => [j.id, j.name]));
  const services: any[] = jokis.length
    ? (await db.from("services").select("*").in("joki_id", jokis.map((j) => j.id))).data ?? []
    : [];

  // Urutan: sort (kecil dulu) -> abjad -> harga
  const groups = new Map<string, any[]>();
  [...services].sort((a, b) => bySort(a, b) || a.price - b.price).forEach((s) => {
    const k = catOf(s);
    groups.set(k, [...(groups.get(k) ?? []), s]);
  });
  const ordered = [...groups.entries()].sort(([a, ia], [b, ib]) =>
    a === "Lainnya" ? 1 : b === "Lainnya" ? -1 : minSort(ia) - minSort(ib) || nat(a, b)
  );
  const catNames = ordered.map(([k]) => k).filter((k) => k !== "Lainnya");
  const catImgs: Record<string, string> = g.service_cat_images ?? {};
  const activeCount = services.filter((s) => s.is_active).length;
  const promoTotal = services.filter(hasPromo).length;
  const allRange = services.length ? rangeOf(services.map((s) => s.price)) : "-";
  // Daftar sub kategori yang sudah ada (untuk saran otomatis di form)
  const allSubs = [...new Set(services.map((s) => (s.sub_category ?? "").trim()).filter(Boolean))].sort(nat) as string[];

  const arrow =
    "flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-black hover:bg-black hover:text-white disabled:pointer-events-none disabled:opacity-25";

  return (
    <AdminShell active="pricelist">
      <PageHeader title="Pricelist" desc="Atur kategori, sub kategori, harga, gambar, deskripsi, dan pilihan tambahan tiap layanan." />

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((x) => (
          <Link key={x.slug} href={`/admin/pricelist?game=${x.slug}`}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
              x.slug === g.slug ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"
            }`}>
            {x.name}
          </Link>
        ))}
      </div>

      <div className={`${card} mt-4`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold">{g.name}</h2>
          <span className="text-xs text-gray-500">
            {services.length} layanan · {activeCount} aktif · {ordered.length} kategori · {allRange}
            {promoTotal > 0 && <b className="ml-1 rounded-full bg-red-50 px-2 py-0.5 text-red-600">{promoTotal} promo</b>}
          </span>
        </div>

        {!jokis.length && (
          <p className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-50 p-3.5 text-sm text-amber-800">
            <Icon name="alert" className="h-4 w-4 shrink-0" />
            Tambahkan grup (joki) dulu di halaman game, baru layanan bisa dibuat.
          </p>
        )}

        {/* Gambar kategori */}
        {catNames.length > 0 && (
          <details className="mt-4 rounded-2xl border border-gray-200">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold [&::-webkit-details-marker]:hidden">
              <Icon name="image" className="h-4 w-4" />Gambar kategori (tampil di halaman game)
            </summary>
            <SaveForm action={saveServiceCats} className="grid gap-4 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
              <input type="hidden" name="slug" value={g.slug} />
              {catNames.map((c) => (
                <div key={c} className="rounded-2xl border border-gray-200 p-3">
                  <label className={lbl}>{c}</label>
                  <input type="hidden" name="sc_name" value={c} />
                  <ImageUpload name="sc_img" folder="kategori" shape="thumb" defaultValue={catImgs[c] ?? ""} />
                </div>
              ))}
              <div className="col-span-full"><Submit>Simpan gambar kategori</Submit></div>
            </SaveForm>
          </details>
        )}

        {services.length > 6 && <ListFilter targetId="svc-list" />}

        <div id="svc-list" className="mt-4 space-y-3">
          {ordered.map(([name, items]) => {

            const promoCount = items.filter(hasPromo).length;
            const eff = rangeOf(items.map((s) => s.price));
            const base = rangeOf(items.map((s) => (hasPromo(s) ? s.original_price! : s.price)));
            const img = catImgs[name] || items.find((s) => s.image_url)?.image_url || g.icon_url || GAME_ICONS[g.slug] || null;

            // Urutan tampil seluruh kategori (sub kategori berurutan), dipakai tombol naik/turun
            const subs = subGroups(items);
            const flatIds = subs.flatMap(([, l]) => l.map((s) => s.id)).join(",");
            const baseSort = minSort(items);

            return (
              <details key={name} data-group className="group/g overflow-hidden rounded-2xl border border-gray-200">
                                                <summary className="flex cursor-pointer list-none items-center gap-4 bg-white p-3 transition hover:bg-gray-50 sm:p-4 [&::-webkit-details-marker]:hidden">
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200">
                    {img
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={img} alt="" className="h-full w-full object-cover" />
                      : <Icon name="image" className="h-5 w-5 text-gray-300" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-lg text-[#0d0c22]">{name}</b>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                      {items.length} item
                      {promoCount > 0 && base !== eff && <span className="text-gray-400 line-through">{base}</span>}
                      <span className={promoCount ? "font-semibold text-red-600" : ""}>{eff}</span>
                      {promoCount > 0 && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">PROMO</span>}
                      {!img && <span className="text-amber-600">Belum ada gambar</span>}
                    </span>
                  </span>
                  <Icon name="chevron" className="h-4 w-4 transition-transform group-open/g:rotate-180" />
                </summary>

                <div className="px-4">
                                    <div className="flex justify-end pt-3">
                    <Link href={`/game/${g.slug}?k=${encodeURIComponent(name)}`} target="_blank"
                      className="group flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-semibold transition hover:border-pink-300 hover:text-pink-600">
                      Lihat kategori ini di situs
                      <Icon name="external" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <SaveForm action={renameServiceCategory} className="flex flex-wrap items-end gap-2 border-b border-gray-100 py-3">
                    <input type="hidden" name="game_slug" value={g.slug} />
                    <input type="hidden" name="old" value={name} />
                    <div className="min-w-0 flex-1">
                      <label className={lbl}>Ganti nama kategori (nama yang sudah ada = digabung)</label>
                      <input name="new" defaultValue={name} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
                    </div>
                    <Submit>Ganti nama</Submit>
                  </SaveForm>
                  <SaveForm action={deleteServiceCategory} className="border-b border-gray-100 pb-3">
                    <input type="hidden" name="game_slug" value={g.slug} />
                    <input type="hidden" name="name" value={name} />
                    <DeleteButton confirmText={`Hapus kategori "${name}" beserta ${items.length} layanan di dalamnya?`}>
                      Hapus kategori
                    </DeleteButton>
                  </SaveForm>
                  {subs.map(([sub, list]) => (
                    <div key={sub || "_"}>
                      {sub && (
                        <p className="mt-3 border-b border-gray-100 pb-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
                          {sub} · {list.length}
                        </p>
                      )}
                      {list.map((s, idx) => (
                                                <div
                          key={s.id}
                          data-svc={[s.name, s.sub_category, s.unit, s.price, s.description, hasPromo(s) ? "promo diskon" : ""].filter(Boolean).join(" ").toLowerCase()}
                          className="flex items-start gap-2 border-b border-gray-100 last:border-b-0 [&[hidden]]:hidden"
                        >
                          {/* Tombol pindah urutan */}
                          <div className="flex flex-col gap-1 pt-3">
                            {(["up", "down"] as const).map((dir) => (
                              <SaveForm key={dir} action={moveService}>
                                <input type="hidden" name="id" value={s.id} />
                                <input type="hidden" name="dir" value={dir} />
                                <input type="hidden" name="ids" value={flatIds} />
                                <input type="hidden" name="base" value={baseSort} />
                                <button
                                  type="submit"
                                  title={dir === "up" ? "Naikkan urutan" : "Turunkan urutan"}
                                  aria-label={dir === "up" ? "Naikkan urutan" : "Turunkan urutan"}
                                  disabled={dir === "up" ? idx === 0 : idx === list.length - 1}
                                  className={arrow}
                                >
                                  <Icon name="chevron" className={`h-3.5 w-3.5 ${dir === "up" ? "rotate-180" : ""}`} />
                                </button>
                              </SaveForm>
                              
                            ))}
                          </div>

                                                    <details className="group min-w-0 flex-1">
                            <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5 [&::-webkit-details-marker]:hidden">
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-[#0d0c22]">{shortName(s)}</p>
                                <p className="text-xs text-gray-500">
                                  {jokiName[s.joki_id] ?? "-"} · {s.duration || "-"} · {s.unit}
                                  {(s.options ?? []).length > 0 && ` · ${s.options.length} pilihan`}
                                </p>
                              </div>
                              {!s.is_active && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">Nonaktif</span>}
                              <span className="flex flex-col items-end leading-tight">
                                {hasPromo(s) && <span className="text-[11px] text-gray-400 line-through">{rp(s.original_price!)}</span>}
                                <span className={`font-bold ${hasPromo(s) ? "text-red-600" : ""}`}>{rp(s.price)}</span>
                              </span>
                              {hasPromo(s) && <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-extrabold text-white">-{discountPct(s)}%</span>}
                              <Icon name="chevron" className="h-4 w-4 transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="pb-5 pt-1">
                              <SaveForm action={saveService} className="grid gap-4 sm:grid-cols-2">
                                <input type="hidden" name="id" value={s.id} />
                                <ServiceFields s={s} jokis={jokis} subs={allSubs} cats={catNames} />
                                <ServicePreview />
                                <div className="col-span-full"><Submit>Simpan layanan</Submit></div>
                              </SaveForm>
                              <SaveForm action={deleteService} className="mt-3">
                                <input type="hidden" name="id" value={s.id} />
                                <DeleteButton confirmText="Hapus layanan ini?">Hapus layanan</DeleteButton>
                              </SaveForm>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
          {!services.length && jokis.length > 0 && <p className="py-4 text-sm text-gray-500">Belum ada layanan.</p>}
        </div>

        {jokis.length > 0 && (
          <details className="mt-4 rounded-2xl border border-dashed border-gray-300 p-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold [&::-webkit-details-marker]:hidden">
              <Icon name="plus" className="h-4 w-4" />Tambah layanan
            </summary>
            <SaveForm action={addService} resetOnOk className="mt-4 grid gap-4 sm:grid-cols-2">
                            <p className="col-span-full text-sm text-gray-600">
                Kategori baru dibuat dengan mengetik namanya di kolom Kategori. Kategori muncul di daftar setelah layanan pertamanya disimpan.
              </p>
              <input type="hidden" name="game_slug" value={g.slug} />
              <ServiceFields jokis={jokis} subs={allSubs} cats={catNames} />
              <ServicePreview />
              <div className="col-span-full"><Submit>Tambah layanan</Submit></div>
            </SaveForm>
          </details>
        )}
      </div>
    </AdminShell>
  );
}