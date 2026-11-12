import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { Icon } from "@/components/Icons";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit, DeleteButton } from "@/components/admin/SaveForm";
import { TestiPreview } from "@/components/admin/FormPreview";
import { PageHeader } from "@/components/admin/AdminKit";
import { addTestimonial, saveTestimonial, deleteTestimonial } from "@/app/actions/admin";
import { inp, lbl } from "@/components/admin/ui";

const panel = "rounded-xl border border-gray-200 bg-white";

const fields = (t?: any) => (
  <>
    <div>
      <label className={lbl}>Username (tanpa @)</label>
      <input name="username" defaultValue={t?.username} required className={inp} />
    </div>
    <div>
      <label className={lbl}>Urutan (kecil tampil dulu)</label>
      <input name="sort" type="number" defaultValue={t?.sort ?? 0} className={inp} />
    </div>
    <div className="sm:col-span-2">
      <label className={lbl}>Isi komentar</label>
      <textarea name="body" rows={3} defaultValue={t?.body} required className={inp} />
    </div>
    <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
      <input type="checkbox" name="is_active" defaultChecked={t ? t.is_active : true} className="h-4 w-4 accent-black" />Tampil
    </label>
  </>
);

export default async function AdminTestimoni() {
  await requireAdmin();
  const { data } = await db.from("testimonials").select("*").order("sort").order("created_at");
  const list = data ?? [];

  return (
    <AdminShell active="testimoni">
      <PageHeader title="Testimoni" desc="Tampil di halaman /testimoni. Minta izin pemilik komentar sebelum memuatnya." />

      <details className={`${panel} group mt-4`}>
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <Icon name="plus" className="h-4 w-4" />Tambah testimoni
          <Icon name="chevron" className="ml-auto h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>
        <SaveForm action={addTestimonial} resetOnOk className="grid gap-4 border-t border-gray-200 p-4 sm:grid-cols-2">
          {fields()}
          <TestiPreview />
          <div className="col-span-full"><Submit>Tambah</Submit></div>
        </SaveForm>
      </details>

      <div className="mt-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-gray-500">Daftar testimoni</h2>
        <span className="text-xs text-gray-400">{list.length} komentar</span>
      </div>

      {list.length > 0 ? (
        <div className={`${panel} mt-2 divide-y divide-gray-100 overflow-hidden`}>
          {list.map((t) => (
            <div key={t.id} className="p-4 sm:p-5">
              <SaveForm action={saveTestimonial} className="grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={t.id} />
                {fields(t)}
                <TestiPreview />
                <div className="col-span-full"><Submit>Simpan</Submit></div>
              </SaveForm>
              <SaveForm action={deleteTestimonial} className="mt-4 border-t border-gray-100 pt-4">
                <input type="hidden" name="id" value={t.id} />
                <DeleteButton confirmText="Hapus testimoni ini?">Hapus</DeleteButton>
              </SaveForm>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">Belum ada data. Selama kosong, halaman memakai 5 komentar bawaan dari kode.</p>
      )}
    </AdminShell>
  );
}