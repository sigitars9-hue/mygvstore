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
import { stagger } from "@/components/admin/AdminKit";
import { saveGame, saveCategories, deleteGame } from "@/app/actions/admin";
import { inp, card, lbl } from "@/components/admin/ui";

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
      <Link href="/admin/games" className="group animate-fade-up inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition hover:text-black">
        <Icon name="back" className="h-4 w-4 transition group-hover:-translate-x-1" />Semua game
      </Link>
      <div className="animate-fade-up mt-3 flex flex-wrap items-center justify-between gap-3" style={stagger(1)}>
        <h1 className="text-3xl font-bold tracking-tight text-[#0d0c22]">{g.name}</h1>
        <Link href={`/game/${g.slug}`} target="_blank"
          className="group flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold transition hover:border-pink-300 hover:text-pink-600">
          Lihat di situs
          <Icon name="external" className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* Info game */}
      <SaveForm action={saveGame} className={`${card} animate-fade-up mt-6 grid gap-4 sm:grid-cols-2`} >
        <h2 className="col-span-full text-lg font-bold">Info game</h2>
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
          <label className={lbl}>Badge (pisahkan dengan koma)</label>
          <input name="badges" defaultValue={(g.badges ?? []).join(", ")} placeholder="POPULER, TERPERCAYA" className={inp} />
        </div>
        <div>
          <label className={lbl}>Nama PIC/CS (tampil di kartu game)</label>
          <input name="cs_name" defaultValue={g.cs_name ?? ""} placeholder="mis. Imy" className={inp} />
        </div>
        <div>
          <label className={lbl}>WhatsApp CS (kosong = nomor default)</label>
          <input name="cs_wa" defaultValue={g.cs_wa ?? ""} placeholder="6281234567890" className={inp} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="is_soon" defaultChecked={g.is_soon} className="h-4 w-4 accent-black" />Segera hadir
        </label>
        <GamePreview />
        <div className="col-span-full"><Submit>Simpan info game</Submit></div>
      </SaveForm>

      {/* Kategori */}
      <SaveForm action={saveCategories} resetOnOk className={`${card} animate-fade-up mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        <div className="col-span-full">
          <h2 className="text-lg font-bold">Kategori & gambar kartu</h2>
          <p className="mt-1 text-sm text-gray-600">
            Kategori pertama tampil sebagai pill gelap. Kosongkan nama untuk menghapus. Tanpa gambar, situs memakai ilustrasi bawaan.
          </p>
        </div>
        <input type="hidden" name="slug" value={g.slug} />
        {rows.map((c, i) => (
          <div key={`${c}-${i}`} style={stagger(i)}
            className="animate-fade-up rounded-2xl border border-gray-200 p-3 transition hover:border-pink-300 hover:shadow-md">
            <label className={lbl}>{c ? `Kategori ${i + 1}` : "Kategori baru"}</label>
            <input name="cat_name" defaultValue={c} placeholder="mis. Spiral Abyss" className={inp} />
            <div className="mt-3">
              <ImageUpload name="cat_img" folder="kategori" shape="thumb" defaultValue={imgs[c] ?? ""} />
            </div>
          </div>
        ))}
        <div className="col-span-full"><Submit>Simpan kategori</Submit></div>
      </SaveForm>

      {/* Joki */}
      <JokiSection gameSlug={g.slug} jokis={jokis} />

      <Link href={`/admin/pricelist?game=${g.slug}`}
        className={`${card} group animate-fade-up mt-4 flex items-center gap-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 transition group-hover:bg-[#0d0c22] group-hover:text-white">
          <Icon name="coin" />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block text-lg">Daftar harga</b>
          <span className="text-sm text-gray-600">{serviceCount ?? 0} layanan. Ubah harga, gambar, dan pilihan di tab Pricelist.</span>
        </span>
        <Icon name="right" className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#0d0c22]" />
      </Link>

      <SaveForm action={deleteGame} className="mt-8 flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={g.id} />
        <DeleteButton confirmText={`Hapus game ${g.name}?`}>Hapus game ini</DeleteButton>
        <span className="text-xs text-gray-500">Hanya bisa jika semua jokinya sudah dihapus.</span>
      </SaveForm>
    </AdminShell>
  );
}