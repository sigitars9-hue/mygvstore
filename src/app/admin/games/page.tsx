import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { Icon } from "@/components/Icons";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit } from "@/components/admin/SaveForm";
import { PageHeader, stagger } from "@/components/admin/AdminKit";
import { addGame } from "@/app/actions/admin";
import { inp, card, lbl } from "@/components/admin/ui";

export default async function AdminGames() {
  await requireAdmin();
  const [{ data: games }, { data: jk }] = await Promise.all([
    db.from("games").select("id,slug,name,is_soon,icon_url,categories,cs_name").order("sort"),
    db.from("jokis").select("game_id").eq("is_active", true),
  ]);
  const jokiCount = new Map<string, number>();
  (jk ?? []).forEach((x) => jokiCount.set(x.game_id, (jokiCount.get(x.game_id) ?? 0) + 1));

  return (
    <AdminShell active="games">
      <PageHeader title="Game & Harga" desc="Pilih game untuk mengubah tampilan, joki, dan daftar harganya." />

      <div className={`${card} mt-6 divide-y divide-gray-100 overflow-hidden !p-0`}>
        {(games ?? []).map((g, i) => (
          <Link key={g.slug} href={`/admin/games/${g.slug}`} style={stagger(i)}
            className="group animate-fade-up flex items-center gap-4 p-4 transition hover:bg-gradient-to-r hover:from-pink-50/60 hover:to-transparent sm:px-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0d0c22] font-black text-white ring-2 ring-transparent transition group-hover:scale-105 group-hover:ring-pink-300">
              {g.icon_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={g.icon_url} alt="" className="h-full w-full object-cover" />
                : g.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-[#0d0c22]">{g.name}</p>
              <p className="text-xs text-gray-500">
                {(g.categories ?? []).length} kategori · {jokiCount.get(g.id) ?? 0} joki aktif · PIC/CS {g.cs_name || "Admin"}
              </p>
            </div>
            {g.is_soon && <span className="rounded-lg bg-pink-500 px-2.5 py-1 text-xs font-extrabold text-white">SEGERA</span>}
            <Icon name="right" className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#0d0c22]" />
          </Link>
        ))}
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