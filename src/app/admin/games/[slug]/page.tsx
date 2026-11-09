import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { rp } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit, DeleteButton } from "@/components/admin/SaveForm";
import ImageUpload from "@/components/admin/ImageUpload";
import JokiSection from "@/components/admin/JokiSection";
import { saveGame, saveCategories, saveService, addService, deleteService, deleteGame } from "@/app/actions/admin";
import { inp, card, lbl } from "@/components/admin/ui";

export default async function AdminGame({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireAdmin();

  const { data: g } = await db.from("games").select("*").eq("slug", slug).maybeSingle();
  if (!g) notFound();

  const { data: jokisRaw } = await db.from("jokis").select("*").eq("game_id", g.id).order("name");
  const jokis = jokisRaw ?? [];
  const ids = jokis.map((j) => j.id);
  const jokiName: Record<string, string> = Object.fromEntries(jokis.map((j) => [j.id, j.name]));

  const services: any[] = ids.length
    ? (await db.from("services").select("*").in("joki_id", ids)).data ?? []
    : [];
  services.sort((a, b) => (jokiName[a.joki_id] ?? "").localeCompare(jokiName[b.joki_id] ?? "") || a.price - b.price);

  const cats: string[] = g.categories ?? [];
  const imgs: Record<string, string> = g.category_images ?? {};
  const rows = [...cats, ""];

  const serviceFields = (s?: any) => (
    <>
      <div>
        <label className={lbl}>Nama layanan</label>
        <input name="name" defaultValue={s?.name} required className={inp} />
      </div>
      <div>
        <label className={lbl}>Joki</label>
        <select name="joki_id" defaultValue={s?.joki_id ?? ""} className={inp}>
          <option value="">Pilih joki</option>
          {jokis.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
        </select>
      </div>
      <div>
        <label className={lbl}>Harga (Rp)</label>
        <input name="price" type="number" min={0} step={500} defaultValue={s?.price} required className={inp} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Satuan</label>
          <input name="unit" defaultValue={s?.unit ?? "per paket"} className={inp} />
        </div>
        <div>
          <label className={lbl}>Estimasi</label>
          <input name="duration" defaultValue={s?.duration ?? ""} placeholder="1 hari" className={inp} />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label className={lbl}>Deskripsi</label>
        <textarea name="description" rows={3} defaultValue={s?.description ?? ""} className={inp} />
      </div>
      <div className="sm:col-span-2">
        <label className={lbl}>Yang termasuk (satu poin per baris)</label>
        <textarea name="includes" rows={3} defaultValue={(s?.includes ?? []).join("\n")} className={inp} />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
        <input type="checkbox" name="is_active" defaultChecked={s ? s.is_active : true} className="h-4 w-4 accent-black" />
        Tampil di situs
      </label>
    </>
  );

  return (
    <AdminShell active="games">
      <Link href="/admin/games" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-black">
        <Icon name="back" className="h-4 w-4" />Semua game
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0d0c22]">{g.name}</h1>

      {/* Info game */}
      <SaveForm action={saveGame} className={`${card} mt-6 grid gap-4 sm:grid-cols-2`}>
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
  <label className={lbl}>Nama CS</label>
  <input name="cs_name" defaultValue={g.cs_name ?? ""} placeholder="mis. Imy" className={inp} />
</div>
<div>
  <label className={lbl}>WhatsApp CS (kosong = nomor default)</label>
  <input name="cs_wa" defaultValue={g.cs_wa ?? ""} placeholder="6281234567890" className={inp} />
</div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="promoted" defaultChecked={g.promoted} className="h-4 w-4 accent-black" />Dipromosikan
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="is_soon" defaultChecked={g.is_soon} className="h-4 w-4 accent-black" />Segera hadir
        </label>
        <div className="col-span-full"><Submit>Simpan info game</Submit></div>
      </SaveForm>

      {/* Kategori */}
      <SaveForm action={saveCategories} resetOnOk className={`${card} mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        <div className="col-span-full">
          <h2 className="text-lg font-bold">Kategori & gambar kartu</h2>
          <p className="mt-1 text-sm text-gray-600">
            Kategori pertama tampil sebagai pill gelap. Kosongkan nama untuk menghapus. Tanpa gambar, situs memakai ilustrasi bawaan.
          </p>
        </div>
        <input type="hidden" name="slug" value={g.slug} />
        {rows.map((c, i) => (
          <div key={`${c}-${i}`} className="rounded-2xl border border-gray-200 p-3">
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

 <Link
  href={`/admin/pricelist?game=${g.slug}`}
  className={`${card} mt-4 flex items-center gap-4 transition hover:shadow-xl`}
>
  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100"><Icon name="coin" /></span>
  <span className="min-w-0 flex-1">
    <b className="block text-lg">Daftar harga</b>
    <span className="text-sm text-gray-600">{services.length} layanan. Ubah harga, gambar, dan pilihan di tab Pricelist.</span>
  </span>
  <Icon name="right" className="h-5 w-5 text-gray-400" />
</Link>

      <SaveForm action={deleteGame} className="mt-8 flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={g.id} />
        <DeleteButton confirmText={`Hapus game ${g.name}?`}>Hapus game ini</DeleteButton>
        <span className="text-xs text-gray-500">Hanya bisa jika semua jokinya sudah dihapus.</span>
      </SaveForm>
    </AdminShell>
  );
}