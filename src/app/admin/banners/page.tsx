import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit, DeleteButton } from "@/components/admin/SaveForm";
import ImageUpload from "@/components/admin/ImageUpload";
import { addBanner, saveBanner, deleteBanner } from "@/app/actions/admin";
import { inp, card, lbl } from "@/components/admin/ui";

const fields = (b?: any) => (
  <div className="grid content-start gap-4">
    <div>
      <label className={lbl}>Teks alternatif (untuk aksesibilitas)</label>
      <input name="alt" defaultValue={b?.alt ?? ""} placeholder="mis. Promo joki Genshin Impact" className={inp} />
    </div>
    <div>
      <label className={lbl}>Link tujuan</label>
      <input name="href" defaultValue={b?.href ?? "/"} placeholder="/game/genshin-impact" className={inp} />
    </div>
    <div className="grid grid-cols-2 items-end gap-4">
      <div>
        <label className={lbl}>Urutan (kecil tampil dulu)</label>
        <input name="sort" type="number" defaultValue={b?.sort ?? 0} className={inp} />
      </div>
      <label className="flex items-center gap-2 pb-2.5 text-sm font-medium">
        <input type="checkbox" name="is_active" defaultChecked={b ? b.is_active : true} className="h-4 w-4 accent-black" />Aktif
      </label>
    </div>
  </div>
);

export default async function AdminBanners() {
  await requireAdmin();
  const { data: banners } = await db.from("banners").select("*").order("sort").order("created_at");

  return (
    <AdminShell active="banners">
      <h1 className="text-3xl font-bold tracking-tight text-[#0d0c22]">Banner</h1>
      <p className="mt-2 text-gray-600">Gunakan rasio 1376×768 supaya tidak terpotong. Gambar dikompres otomatis ke WebP.</p>

      <SaveForm action={addBanner} resetOnOk className={`${card} mt-6 grid gap-6 md:grid-cols-2`}>
        <div>
          <h2 className="mb-3 text-lg font-bold">Tambah banner</h2>
          <ImageUpload name="image_url" folder="banner" shape="wide" />
        </div>
        {fields()}
        <div className="col-span-full"><Submit>Tambah banner</Submit></div>
      </SaveForm>

      <div className="mt-4 space-y-4">
        {(banners ?? []).map((b) => (
          <div key={b.id} className={card}>
            <SaveForm action={saveBanner} className="grid gap-6 md:grid-cols-2">
              <input type="hidden" name="id" value={b.id} />
              <ImageUpload name="image_url" folder="banner" shape="wide" defaultValue={b.image_url} />
              {fields(b)}
              <div className="col-span-full"><Submit>Simpan</Submit></div>
            </SaveForm>
            <SaveForm action={deleteBanner} className="mt-3">
              <input type="hidden" name="id" value={b.id} />
              <DeleteButton confirmText="Hapus banner ini?">Hapus banner</DeleteButton>
            </SaveForm>
          </div>
        ))}
        {!banners?.length && <p className="text-sm text-gray-500">Belum ada banner. Selama kosong, situs memakai banner bawaan dari kode.</p>}
      </div>
    </AdminShell>
  );
}