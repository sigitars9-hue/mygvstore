import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit } from "@/components/admin/SaveForm";
import { saveTerms } from "@/app/actions/admin";
import { getTerms } from "@/lib/terms-db";
import { inp, card, lbl } from "@/components/admin/ui";

export default async function AdminTerms() {
  await requireAdmin();
  const rows = [...(await getTerms()), { title: "", body: "" }];

  return (
    <AdminShell active="terms">
      <h1 className="text-3xl font-bold tracking-tight text-[#0d0c22]">Syarat & Ketentuan</h1>
      <p className="mt-2 text-gray-600">Urutan di sini sama dengan yang tampil di situs. Kosongkan judul untuk menghapus poin.</p>

      <SaveForm action={saveTerms} resetOnOk className={`${card} mt-6 space-y-4`}>
        {rows.map((t, i) => (
          <div key={`${t.title}-${i}`} className="rounded-2xl border border-gray-200 p-3">
            <label className={lbl}>{t.title ? `Poin ${i + 1}` : "Poin baru"}</label>
            <input name="t_title" defaultValue={t.title} placeholder="Judul" className={inp} />
            <textarea name="t_body" rows={3} defaultValue={t.body} placeholder="Isi" className={`${inp} mt-2`} />
          </div>
        ))}
        <Submit>Simpan S&K</Submit>
      </SaveForm>
    </AdminShell>
  );
}