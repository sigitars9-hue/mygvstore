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
import {
  saveService, addService, deleteService, saveServiceCats, moveService,
  renameServiceCategory, deleteServiceCategory,
} from "@/app/actions/admin";
import { lbl } from "@/components/admin/ui";
import { PageHeader } from "@/components/admin/AdminKit";
import { ServicePreview } from "@/components/admin/FormPreview";
import { GAME_ICONS } from "@/lib/game-icons";

const nat = (a: string, b: string) => a.localeCompare(b, "id", { numeric: true });
const rangeOf = (n: number[]) => {
  const lo = Math.min(...n), hi = Math.max(...n);
  return lo === hi ? rp(lo) : `${rp(lo)} – ${rp(hi)}`;
};

// Satu gaya panel saja: garis tipis, sudut kecil, tanpa kotak di dalam kotak
const panel = "rounded-xl border border-gray-200 bg-white";
const summaryReset = "flex cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden";
const arrow =
  "flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-black disabled:pointer-events-none disabled:opacity-20";

export default async function AdminPricelist({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const { game } = await searchParams;
  await requireAdmin();

  const { data: gs } = await db.from("games").select("id,slug,name,icon_url,service_cat_images").order("sort");
  const games = gs ?? [];
  const g = games.find((x) => x.slug === game) ?? games[0];

  if (!g) {
    return (
      <AdminShell active="pricelist">
        <PageHeader title="Pricelist" desc="Kelola kategori, harga, dan pilihan tiap layanan." />
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
  const allSubs = [...new Set(services.map((s) => (s.sub_category ?? "").trim()).filter(Boolean))].sort(nat) as string[];

  const stats: { label: string; value: string; note?: string; red?: boolean }[] = [
    { label: "Layanan", value: String(services.length), note: `${activeCount} aktif` },
    { label: "Kategori", value: String(ordered.length) },
    { label: "Promo", value: String(promoTotal), red: promoTotal > 0 },
    { label: "Rentang harga", value: allRange },
  ];

  return (
    <AdminShell active="pricelist">
      <PageHeader title="Pricelist" desc="Kelola kategori, harga, dan pilihan tiap layanan." />

      {/* Pilih game */}
      <nav className="mt-4 flex gap-1 overflow-x-auto border-b border-gray-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((x) => (
          <Link
            key={x.slug}
            href={`/admin/pricelist?game=${x.slug}`}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              x.slug === g.slug
                ? "border-[#0d0c22] text-[#0d0c22]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {x.name}
          </Link>
        ))}
      </nav>

      {/* Ringkasan: satu strip, bukan empat kartu */}
      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0 bg-white px-4 py-3">
            <dt className="text-xs text-gray-500">{s.label}</dt>
            <dd className={`mt-0.5 truncate text-base font-semibold sm:text-lg ${s.red ? "text-red-600" : "text-[#0d0c22]"}`}>
              {s.value}
              {s.note && <span className="ml-1.5 text-xs font-normal text-gray-400">{s.note}</span>}
            </dd>
          </div>
        ))}
      </dl>

      {!jokis.length && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
          <Icon name="alert" className="h-4 w-4 shrink-0" />
          Tambahkan grup (joki) dulu di halaman game, baru layanan bisa dibuat.
        </p>
      )}

      {/* Tambah layanan */}
      {jokis.length > 0 && (
        <details className={`${panel} group mt-4`}>
          <summary className={`${summaryReset} gap-2 px-4 py-3 text-sm font-semibold`}>
            <Icon name="plus" className="h-4 w-4" />
            Tambah layanan
            <Icon name="chevron" className="ml-auto h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
          </summary>
          <SaveForm action={addService} resetOnOk className="grid gap-4 border-t border-gray-200 p-4 sm:grid-cols-2">
            <p className="col-span-full text-sm text-gray-500">
              Kategori baru dibuat dengan mengetik namanya di kolom Kategori. Kategori muncul setelah layanan pertamanya disimpan.
            </p>
            <input type="hidden" name="game_slug" value={g.slug} />
            <ServiceFields jokis={jokis} subs={allSubs} cats={catNames} />
            <ServicePreview />
            <div className="col-span-full"><Submit>Tambah layanan</Submit></div>
          </SaveForm>
        </details>
      )}

      {/* Gambar kategori */}
      {catNames.length > 0 && (
        <details className={`${panel} group mt-3`}>
          <summary className={`${summaryReset} gap-2 px-4 py-3 text-sm font-semibold`}>
            <Icon name="image" className="h-4 w-4" />
            Gambar kategori
            <span className="hidden text-xs font-normal text-gray-400 sm:inline">tampil di halaman game</span>
            <Icon name="chevron" className="ml-auto h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
          </summary>
          <SaveForm action={saveServiceCats} className="grid gap-x-4 gap-y-5 border-t border-gray-200 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <input type="hidden" name="slug" value={g.slug} />
            {catNames.map((c) => (
              <div key={c}>
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

      {/* Daftar kategori dan layanan */}
      <div id="svc-list" className={`${panel} mt-4 divide-y divide-gray-200 overflow-hidden`}>
        {ordered.map(([name, items]) => {
          const promoCount = items.filter(hasPromo).length;
          const eff = rangeOf(items.map((s) => s.price));
          const base = rangeOf(items.map((s) => (hasPromo(s) ? s.original_price! : s.price)));
          const img = catImgs[name] || items.find((s) => s.image_url)?.image_url || g.icon_url || GAME_ICONS[g.slug] || null;

          // Urutan tampil seluruh kategori, dipakai tombol naik/turun
          const subs = subGroups(items);
          const flatIds = subs.flatMap(([, l]) => l.map((s) => s.id)).join(",");
          const baseSort = minSort(items);

          return (
            <details key={name} data-group className="group/g">
              <summary className={`${summaryReset} gap-3 px-4 py-3 transition hover:bg-gray-50 sm:px-5`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 sm:h-12 sm:w-12">
                  {img
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={img} alt="" className="h-full w-full object-cover" />
                    : <Icon name="image" className="h-5 w-5 text-gray-300" />}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[15px] font-semibold text-[#0d0c22] sm:text-base">{name}</b>
                  <span className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                    <span>{items.length} layanan</span>
                    {!img && <span className="text-amber-600">Belum ada gambar</span>}
                    <span className="sm:hidden">{eff}</span>
                  </span>
                </span>
                <span className="hidden flex-col items-end text-right text-sm leading-tight sm:flex">
                  {promoCount > 0 && base !== eff && <span className="text-[11px] text-gray-400 line-through">{base}</span>}
                  <span className={promoCount ? "font-semibold text-red-600" : "text-gray-700"}>{eff}</span>
                </span>
                {promoCount > 0 && (
                  <span className="shrink-0 rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-600">
                    {promoCount} promo
                  </span>
                )}
                <Icon name="chevron" className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open/g:rotate-180" />
              </summary>

              {/* Pengaturan kategori */}
              <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-end sm:px-5">
                <SaveForm action={renameServiceCategory} className="flex min-w-0 flex-1 items-end gap-2">
                  <input type="hidden" name="game_slug" value={g.slug} />
                  <input type="hidden" name="old" value={name} />
                  <div className="min-w-0 flex-1">
                    <label className={lbl}>Ganti nama (nama yang sudah ada = digabung)</label>
                    <input
                      name="new"
                      defaultValue={name}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                    />
                  </div>
                  <Submit>Simpan</Submit>
                </SaveForm>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/game/${g.slug}?k=${encodeURIComponent(name)}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium transition hover:border-black"
                  >
                    Lihat di situs
                    <Icon name="external" className="h-3.5 w-3.5" />
                  </Link>
                  <SaveForm action={deleteServiceCategory}>
                    <input type="hidden" name="game_slug" value={g.slug} />
                    <input type="hidden" name="name" value={name} />
                    <DeleteButton confirmText={`Hapus kategori "${name}" beserta ${items.length} layanan di dalamnya?`}>
                      Hapus
                    </DeleteButton>
                  </SaveForm>
                </div>
              </div>

              {/* Layanan */}
              <div className="border-t border-gray-100">
                {subs.map(([sub, list]) => (
                  <div key={sub || "_"}>
                    {sub && (
                      <p className="border-b border-gray-100 bg-gray-50/60 px-4 py-2 text-xs font-semibold text-gray-500 sm:px-5">
                        {sub} <span className="font-normal text-gray-400">· {list.length}</span>
                      </p>
                    )}
                    <div className="divide-y divide-gray-100">
                      {list.map((s, idx) => (
                        <div
                          key={s.id}
                          data-svc={[s.name, s.sub_category, s.unit, s.price, s.description, hasPromo(s) ? "promo diskon" : ""].filter(Boolean).join(" ").toLowerCase()}
                          className="flex items-start gap-1 pl-2 pr-4 sm:pl-3 sm:pr-5 [&[hidden]]:hidden"
                        >
                          {/* Pindah urutan */}
                          <div className="flex shrink-0 flex-col pt-2.5">
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
                                  <Icon name="chevron" className={`h-4 w-4 ${dir === "up" ? "rotate-180" : ""}`} />
                                </button>
                              </SaveForm>
                            ))}
                          </div>

                          <details className="group min-w-0 flex-1">
                            <summary className={`${summaryReset} gap-3 py-3`}>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[#0d0c22]">{shortName(s)}</p>
                                <p className="truncate text-xs text-gray-500">
                                  {jokiName[s.joki_id] ?? "-"} · {s.duration || "-"} · {s.unit}
                                  {(s.options ?? []).length > 0 && ` · ${s.options.length} pilihan`}
                                </p>
                              </div>
                              {!s.is_active && (
                                <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-500">
                                  Nonaktif
                                </span>
                              )}
                              <span className="flex shrink-0 flex-col items-end leading-tight">
                                {hasPromo(s) && <span className="text-[11px] text-gray-400 line-through">{rp(s.original_price!)}</span>}
                                <span className={`text-sm font-semibold ${hasPromo(s) ? "text-red-600" : "text-[#0d0c22]"}`}>{rp(s.price)}</span>
                              </span>
                              {hasPromo(s) && (
                                <span className="hidden shrink-0 rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white sm:inline">
                                  -{discountPct(s)}%
                                </span>
                              )}
                              <Icon name="chevron" className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                            </summary>

                            <div className="-mr-4 border-t border-gray-100 py-4 pr-4 sm:-mr-5 sm:pr-5">
                              <SaveForm action={saveService} className="grid gap-4 sm:grid-cols-2">
                                <input type="hidden" name="id" value={s.id} />
                                <ServiceFields s={s} jokis={jokis} subs={allSubs} cats={catNames} />
                                <ServicePreview />
                                <div className="col-span-full"><Submit>Simpan layanan</Submit></div>
                              </SaveForm>
                              <SaveForm action={deleteService} className="mt-4 border-t border-gray-100 pt-4">
                                <input type="hidden" name="id" value={s.id} />
                                <DeleteButton confirmText="Hapus layanan ini?">Hapus layanan</DeleteButton>
                              </SaveForm>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          );
        })}

        {!services.length && jokis.length > 0 && (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            Belum ada layanan. Mulai dengan tombol Tambah layanan di atas.
          </p>
        )}
      </div>
    </AdminShell>
  );
}