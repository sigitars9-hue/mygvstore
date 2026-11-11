import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { rp, hasPromo, discountPct } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit } from "@/components/admin/SaveForm";
import { PageHeader, stagger } from "@/components/admin/AdminKit";
import { LinkSpinner, LinkFade } from "@/components/LinkPending";
import { addGame } from "@/app/actions/admin";
import { inp, card, lbl } from "@/components/admin/ui";

type Stat = { jokis: number; services: number; min: number; max: number; promo: number; maxPct: number };

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
  const totalPromo = [...stats.values()].reduce((a, s) => a + s.promo, 0);

  return (
    <AdminShell active="games">
      <PageHeader title="Game & Harga" desc="Pilih game untuk mengubah tampilan, joki, dan daftar harganya.">
        {totalPromo > 0 && (
          <span className="animate-pop-in flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-2 text-sm font-bold text-red-600">
            <Icon name="coin" className="h-4 w-4" />{totalPromo} layanan promo aktif
          </span>
        )}
      </PageHeader>

      <div className={`${card} mt-6 divide-y divide-gray-100 overflow-hidden !p-0`}>
        {list.map((g, i) => {
          const s = stats.get(g.id);
          const hasPrice = !!s && s.services > 0;
          const range = hasPrice ? (s.min === s.max ? rp(s.min) : `${rp(s.min)} – ${rp(s.max)}`) : null;

          return (
            <Link key={g.slug} href={`/admin/games/${g.slug}`} style={stagger(i)}
              className="group animate-fade-up flex items-center gap-4 p-4 transition hover:bg-gradient-to-r hover:from-pink-50/60 hover:to-transparent active:scale-[0.995] sm:px-6">
              <LinkFade className="flex min-w-0 flex-1 items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0d0c22] font-black text-white ring-2 ring-transparent transition group-hover:scale-105 group-hover:ring-pink-300">
                  {g.icon_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={g.icon_url} alt="" className="h-full w-full object-cover" />
                    : g.name.charAt(0)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-[#0d0c22]">{g.name}</p>
                  <p className="text-xs text-gray-500">
                    {(g.categories ?? []).length} kategori · {s?.jokis ?? 0} joki aktif · {s?.services ?? 0} layanan · CS {g.cs_name || "Admin"}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <Icon name="coin" className="h-3.5 w-3.5 text-gray-400" />
                    {range ? (
                      <span className={`font-semibold ${s!.promo > 0 ? "text-red-600" : "text-[#0d0c22]"}`}>{range}</span>
                    ) : (
                      <span className="text-gray-400">Belum ada harga</span>
                    )}
                    {s && s.promo > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                        {s.promo} PROMO · s/d {s.maxPct}%
                      </span>
                    )}
                  </p>
                </div>
              </LinkFade>

              {g.is_soon && <span className="rounded-lg bg-pink-500 px-2.5 py-1 text-xs font-extrabold text-white">SEGERA</span>}
              <LinkSpinner>
                <Icon name="right" className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#0d0c22]" />
              </LinkSpinner>
            </Link>
          );
        })}
        {list.length === 0 && <p className="p-6 text-sm text-gray-500">Belum ada game. Tambahkan lewat form di bawah.</p>}
      </div>

      <SaveForm action={addGame} resetOnOk className={`${card} animate-fade-up mt-4 grid gap-4 sm:grid-cols-2`}>
        <h2 className="col-span-full text-lg font-bold">Tambah game</h2>
        <div>
          <label className={lbl}>Nama game</label>
          <input name="name" required placeholder="mis. Arknights" className={inp} />
        </div>
        <div>
          <label className={lbl}>Slug URL (kosongkan untuk otomatis)</label>
          <input name="slug" placeholder="arknights" className={inp} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="is_soon" className="h-4 w-4 accent-black" />Segera hadir
        </label>
        <div className="col-span-full"><Submit>Tambah game</Submit></div>
      </SaveForm>
    </AdminShell>
  );
}