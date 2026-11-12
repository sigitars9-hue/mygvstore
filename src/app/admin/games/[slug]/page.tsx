import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { Icon } from "@/components/Icons";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit, DeleteButton } from "@/components/admin/SaveForm";
import ImageUpload from "@/components/admin/ImageUpload";
import JokiSection from "@/components/admin/JokiSection";
import { GamePreview } from "@/components/admin/FormPreview";
import { saveGame, saveCategories, deleteGame } from "@/app/actions/admin";
import { inp, lbl } from "@/components/admin/ui";

const panel = "rounded-xl border border-gray-200 bg-white";

export default async function AdminGame({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireAdmin();

  const { data: g } = await db.from("games").select("*").eq("slug", slug).maybeSingle();
  if (!g) notFound();

  const { data: jokisRaw } = await db.from("jokis").select("*").eq("game_id", g.id).order("name");
  const jokis = jokisRaw ?? [];
  const ids = jokis.map((j) => j.id);

  const { count: serviceCount } = ids.length
    ? await db.from("services").select("*", { count: "exact", head: true }).in("joki_id", ids)
    : { count: 0 };

  const cats: string[] = g.categories ?? [];
  const imgs: Record<string, string> = g.category_images ?? {};
  const rows = [...cats, ""];

  return (
    <AdminShell active="games">
      <Link href="/admin/games" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-black">
        <Icon name="back" className="h-4 w-4" />Semua game
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-[#0d0c22] sm:text-3xl">{g.name}</h1>
        <Link href={`/game/${g.slug}`} target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition hover:border-black">
          Lihat di situs
          <Icon name="external" className="h-4 w-4" />
        </Link>
      </div>

      {/* Info game */}
      <SaveForm action={saveGame} className={`${panel} mt-5 grid gap-4 p-4 sm:grid-cols-2 sm:p-5`}>
        <div className="col-span-full border-b border-gray-100 pb-3">
          <h2 className="font-semibold">Info game</h2>
        </div>
        <input type="hidden" name="slug" value={g.slug} />
        <div className="sm:col-span-2">
          <label className={lbl}>Ikon game</label>
          <ImageUpload name="icon_url" folder="games" shape="round" defaultValue={g.icon_url ?? ""} />
        </div>
        <div>
          <label className={lbl}>Nama</label>
          <input name="name" defaultValue={g.name} required className={inp} />
        </div>
        <div>
          <label className={lbl}>Badge (pisahkan koma; kata promo/diskon/sale otomatis merah)</label>
          <input name="badges" defaultValue={(g.badges ?? []).join(", ")} placeholder="FLASH SALE, DISKON 20%" className={inp} />
        </div>
        <div>
          <label className={lbl}>Nama PIC/CS (tampil di kartu game)</label>
          <input name="cs_name" defaultValue={g.cs_name ?? ""} placeholder="mis. Imy" className={inp} />
        </div>
        <div>
          <label className={lbl}>WhatsApp CS (kosong = nomor default)</label>
          <input name="cs_wa" defaultValue={g.cs_wa ?? ""} placeholder="6281234567890" className={inp} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
          <input type="checkbox" name="is_soon" defaultChecked={g.is_soon} className="h-4 w-4 accent-black" />Segera hadir
        </label>
        <GamePreview />
        <div className="col-span-full"><Submit>Simpan info game</Submit></div>
      </SaveForm>

      {/* Kategori & gambar kartu */}
      <SaveForm action={saveCategories} resetOnOk className={`${panel} mt-4 grid gap-x-4 gap-y-5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3`}>
        <div className="col-span-full border-b border-gray-100 pb-3">
          <h2 className="font-semibold">Gambar kartu di beranda</h2>
          <p className="mt-1 text-sm text-gray-500">
            Kategori pertama tampil sebagai pill gelap. Kosongkan nama untuk menghapus. Tanpa gambar, situs memakai ilustrasi bawaan.
          </p>
        </div>
        <input type="hidden" name="slug" value={g.slug} />
        {rows.map((c, i) => (
          <div key={`${c}-${i}`}>
            <label className={lbl}>{c ? `Kategori ${i + 1}` : "Kategori baru"}</label>
            <input name="cat_name" defaultValue={c} placeholder="mis. Spiral Abyss" className={inp} />
            <div className="mt-2">
              <ImageUpload name="cat_img" folder="kategori" shape="thumb" defaultValue={imgs[c] ?? ""} />
            </div>
          </div>
        ))}
        <div className="col-span-full"><Submit>Simpan gambar kartu</Submit></div>
      </SaveForm>

      {/* Joki */}
      <JokiSection gameSlug={g.slug} jokis={jokis} />

      {/* Daftar harga */}
      <Link href={`/admin/pricelist?game=${g.slug}`}
        className={`${panel} group mt-4 flex items-center gap-3 px-4 py-3.5 transition hover:bg-gray-50 sm:px-5`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition group-hover:bg-[#0d0c22] group-hover:text-white">
          <Icon name="coin" className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block text-[15px] font-semibold">Daftar harga</b>
          <span className="block truncate text-sm text-gray-500">{serviceCount ?? 0} layanan. Ubah harga, gambar, dan pilihan di Pricelist.</span>
        </span>
        <Icon name="right" className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#0d0c22]" />
      </Link>

      {/* Hapus game */}
      <SaveForm action={deleteGame} className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center">
        <input type="hidden" name="id" value={g.id} />
        <DeleteButton confirmText={`Hapus game ${g.name}?`}>Hapus game ini</DeleteButton>
        <span className="text-xs text-gray-500">Hanya bisa jika semua jokinya sudah dihapus.</span>
      </SaveForm>
    </AdminShell>
  );
}