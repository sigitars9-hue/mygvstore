import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit, DeleteButton } from "@/components/admin/SaveForm";
import { addTestimonial, saveTestimonial, deleteTestimonial } from "@/app/actions/admin";
import { inp, card, lbl } from "@/components/admin/ui";

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

  return (
    <AdminShell active="testimoni">
      <h1 className="text-3xl font-bold tracking-tight text-[#0d0c22]">Testimoni</h1>
      <p className="mt-2 text-gray-600">Tampil di halaman /testimoni. Minta izin pemilik komentar sebelum memuatnya.</p>

      <SaveForm action={addTestimonial} resetOnOk className={`${card} mt-6 grid gap-4 sm:grid-cols-2`}>
        <h2 className="col-span-full text-lg font-bold">Tambah testimoni</h2>
        {fields()}
        <div className="col-span-full"><Submit>Tambah</Submit></div>
      </SaveForm>

      <div className="mt-4 space-y-4">
        {(data ?? []).map((t) => (
          <div key={t.id} className={card}>
            <SaveForm action={saveTestimonial} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={t.id} />
              {fields(t)}
              <div className="col-span-full"><Submit>Simpan</Submit></div>
            </SaveForm>
            <SaveForm action={deleteTestimonial} className="mt-3">
              <input type="hidden" name="id" value={t.id} />
              <DeleteButton confirmText="Hapus testimoni ini?">Hapus</DeleteButton>
            </SaveForm>
          </div>
        ))}
        {!data?.length && <p className="text-sm text-gray-500">Belum ada data. Selama kosong, halaman memakai 5 komentar bawaan dari kode.</p>}
      </div>
    </AdminShell>
  );
}