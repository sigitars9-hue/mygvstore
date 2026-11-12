import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit } from "@/components/admin/SaveForm";
import { TermsPreview } from "@/components/admin/FormPreview";
import { PageHeader } from "@/components/admin/AdminKit";
import { saveTerms } from "@/app/actions/admin";
import { getTerms } from "@/lib/terms-db";
import { inp, lbl } from "@/components/admin/ui";

export default async function AdminTerms() {
  await requireAdmin();
  const rows = [...(await getTerms()), { title: "", body: "" }];

  return (
    <AdminShell active="terms">
      <PageHeader title="Syarat & Ketentuan" desc="Urutan di sini sama dengan yang tampil di situs. Kosongkan judul untuk menghapus poin." />

      <SaveForm action={saveTerms} resetOnOk className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="divide-y divide-gray-100">
          {rows.map((t, i) => (
            <div key={`${t.title}-${i}`} className="grid gap-2 px-4 py-4 sm:px-5">
              <label className={lbl}>{t.title ? `Poin ${i + 1}` : "Poin baru"}</label>
              <input name="t_title" defaultValue={t.title} placeholder="Judul" className={inp} />
              <textarea name="t_body" rows={3} defaultValue={t.body} placeholder="Isi" className={inp} />
            </div>
          ))}
        </div>
        <div className="space-y-4 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-5">
          <TermsPreview />
          <Submit>Simpan S&K</Submit>
        </div>
      </SaveForm>
    </AdminShell>
  );
}