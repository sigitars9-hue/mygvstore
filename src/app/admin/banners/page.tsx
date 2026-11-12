import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { Icon } from "@/components/Icons";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit, DeleteButton } from "@/components/admin/SaveForm";
import ImageUpload from "@/components/admin/ImageUpload";
import { BannerPreview } from "@/components/admin/FormPreview";
import { PageHeader } from "@/components/admin/AdminKit";
import { addBanner, saveBanner, deleteBanner } from "@/app/actions/admin";
import { inp, lbl } from "@/components/admin/ui";

const panel = "rounded-xl border border-gray-200 bg-white";

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
  const list = banners ?? [];

  return (
    <AdminShell active="banners">
      <PageHeader title="Banner" desc="Gunakan rasio 1376×768 supaya tidak terpotong. Gambar dikompres otomatis ke WebP." />

      <details className={`${panel} group mt-4`}>
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <Icon name="plus" className="h-4 w-4" />Tambah banner
          <Icon name="chevron" className="ml-auto h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>
        <SaveForm action={addBanner} resetOnOk className="grid gap-5 border-t border-gray-200 p-4 md:grid-cols-2">
          <ImageUpload name="image_url" folder="banner" shape="wide" />
          {fields()}
          <BannerPreview />
          <div className="col-span-full"><Submit>Tambah banner</Submit></div>
        </SaveForm>
      </details>

      <div className="mt-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-gray-500">Banner terpasang</h2>
        <span className="text-xs text-gray-400">{list.length} banner</span>
      </div>

      {list.length > 0 ? (
        <div className={`${panel} mt-2 divide-y divide-gray-100 overflow-hidden`}>
          {list.map((b) => (
            <div key={b.id} className="p-4 sm:p-5">
              <SaveForm action={saveBanner} className="grid gap-5 md:grid-cols-2">
                <input type="hidden" name="id" value={b.id} />
                <ImageUpload name="image_url" folder="banner" shape="wide" defaultValue={b.image_url} />
                {fields(b)}
                <BannerPreview />
                <div className="col-span-full"><Submit>Simpan</Submit></div>
              </SaveForm>
              <SaveForm action={deleteBanner} className="mt-4 border-t border-gray-100 pt-4">
                <input type="hidden" name="id" value={b.id} />
                <DeleteButton confirmText="Hapus banner ini?">Hapus banner</DeleteButton>
              </SaveForm>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">Belum ada banner. Selama kosong, situs memakai banner bawaan dari kode.</p>
      )}
    </AdminShell>
  );
}