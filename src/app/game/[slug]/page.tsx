import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { rp, hasPromo, discountPct } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit } from "@/components/admin/SaveForm";
import { PageHeader } from "@/components/admin/AdminKit";
import { LinkSpinner, LinkFade } from "@/components/LinkPending";
import { addGame } from "@/app/actions/admin";
import { inp, lbl } from "@/components/admin/ui";

type Stat = { jokis: number; services: number; min: number; max: number; promo: number; maxPct: number };
const panel = "rounded-xl border border-gray-200 bg-white";

export default async function AdminGames() {
  await requireAdmin();
  const [{ data: games }, { data: jk }, { data: sv }] = await Promise.all([
    db.from("games").select("id,slug,name,is_soon,icon_url,categories,cs_name").order("sort"),
    db.from("jokis").select("id,game_id,is_active"),
    db.from("services").select("joki_id,price,original_price,is_active").limit(5000),
  ]);

  const jokiGame = new Map<string, string>();
  const stats = new Map<string, Stat>();
  const stat = (gid: string) => {
    let s = stats.get(gid);
    if (!s) { s = { jokis: 0, services: 0, min: Infinity, max: 0, promo: 0, maxPct: 0 }; stats.set(gid, s); }
    return s;
  };
  (jk ?? []).forEach((j) => {
    jokiGame.set(j.id, j.game_id);
    if (j.is_active) stat(j.game_id).jokis++;
  });
  (sv ?? []).forEach((x) => {
    const gid = x.joki_id ? jokiGame.get(x.joki_id) : undefined;
    if (!gid || !x.is_active) return;
    const s = stat(gid);
    s.services++;
    s.min = Math.min(s.min, x.price);
    s.max = Math.max(s.max, x.price);
    if (hasPromo(x)) { s.promo++; s.maxPct = Math.max(s.maxPct, discountPct(x)); }
  });

  const list = games ?? [];
  const all = [...stats.values()];
  const totals = {
    jokis: all.reduce((a, s) => a + s.jokis, 0),
    services: all.reduce((a, s) => a + s.services, 0),
    promo: all.reduce((a, s) => a + s.promo, 0),
  };
  const summary = [
    { label: "Game", value: list.length },
    { label: "Joki aktif", value: totals.jokis },
    { label: "Layanan aktif", value: totals.services },
    { label: "Promo", value: totals.promo, red: totals.promo > 0 },
  ];

  return (
    <AdminShell active="games">
      <PageHeader title="Game & Harga" desc="Pilih game untuk mengubah tampilan, joki, dan daftar harganya." />

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-4">
        {summary.map((x) => (
          <div key={x.label} className="bg-white px-4 py-3">
            <dt className="text-xs text-gray-500">{x.label}</dt>
            <dd className={`mt-0.5 text-lg font-semibold ${x.red ? "text-red-600" : "text-[#0d0c22]"}`}>{x.value}</dd>
          </div>
        ))}
      </dl>

      <details className={`${panel} group mt-4`}>
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <Icon name="plus" className="h-4 w-4" />Tambah game
          <Icon name="chevron" className="ml-auto h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>
        <SaveForm action={addGame} resetOnOk className="grid gap-4 border-t border-gray-200 p-4 sm:grid-cols-2">
          <div>
            <label className={lbl}>Nama game</label>
            <input name="name" required placeholder="mis. Arknights" className={inp} />
          </div>
          <div>
            <label className={lbl}>Slug URL (kosongkan untuk otomatis)</label>
            <input name="slug" placeholder="arknights" className={inp} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input type="checkbox" name="is_soon" className="h-4 w-4 accent-black" />Segera hadir
          </label>
          <div className="col-span-full"><Submit>Tambah game</Submit></div>
        </SaveForm>
      </details>

      <div className={`${panel} mt-4 divide-y divide-gray-100 overflow-hidden`}>
        {list.map((g) => {
          const s = stats.get(g.id);
          const range = s && s.services > 0 ? (s.min === s.max ? rp(s.min) : `${rp(s.min)} – ${rp(s.max)}`) : null;
          return (
            <Link key={g.slug} href={`/admin/games/${g.slug}`} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50 sm:px-5">
              <LinkFade className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#0d0c22] font-bold text-white sm:h-12 sm:w-12">
                  {g.icon_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={g.icon_url} alt="" className="h-full w-full object-cover" />
                    : g.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <b className="truncate text-[15px] font-semibold text-[#0d0c22]">{g.name}</b>
                    {g.is_soon && <span className="shrink-0 rounded-md bg-pink-500 px-1.5 py-0.5 text-[11px] font-bold text-white">Segera</span>}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    {(g.categories ?? []).length} kategori · {s?.jokis ?? 0} joki · {s?.services ?? 0} layanan · CS {g.cs_name || "Admin"}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs sm:hidden">
                    {range
                      ? <span className={`font-semibold ${s!.promo > 0 ? "text-red-600" : "text-gray-700"}`}>{range}</span>
                      : <span className="text-gray-400">Belum ada harga</span>}
                  </span>
                </span>
                <span className="hidden flex-col items-end text-right text-sm leading-tight sm:flex">
                  {range
                    ? <span className={`font-semibold ${s!.promo > 0 ? "text-red-600" : "text-gray-700"}`}>{range}</span>
                    : <span className="text-gray-400">Belum ada harga</span>}
                </span>
                {s && s.promo > 0 && (
                  <span className="shrink-0 rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-600">
                    {s.promo} promo · {s.maxPct}%
                  </span>
                )}
              </LinkFade>
              <LinkSpinner>
                <Icon name="right" className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#0d0c22]" />
              </LinkSpinner>
            </Link>
          );
        })}
        {list.length === 0 && <p className="px-5 py-10 text-center text-sm text-gray-500">Belum ada game. Tambahkan lewat tombol di atas.</p>}
      </div>
    </AdminShell>
  );
}