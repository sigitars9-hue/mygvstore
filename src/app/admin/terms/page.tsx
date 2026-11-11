import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import SaveForm, { Submit } from "@/components/admin/SaveForm";
import { TermsPreview } from "@/components/admin/FormPreview";
import { PageHeader, stagger } from "@/components/admin/AdminKit";
import { saveTerms } from "@/app/actions/admin";
import { getTerms } from "@/lib/terms-db";
import { inp, card, lbl } from "@/components/admin/ui";

export default async function AdminTerms() {
  await requireAdmin();
  const rows = [...(await getTerms()), { title: "", body: "" }];

  return (
    <AdminShell active="terms">
      <PageHeader title="Syarat & Ketentuan" desc="Urutan di sini sama dengan yang tampil di situs. Kosongkan judul untuk menghapus poin." />

      <SaveForm action={saveTerms} resetOnOk className={`${card} animate-fade-up mt-6 space-y-4`}>
        {rows.map((t, i) => (
          <div key={`${t.title}-${i}`} style={stagger(i)}
            className="animate-fade-up rounded-2xl border border-gray-200 p-3 transition focus-within:border-pink-300 focus-within:shadow-md">
            <label className={lbl}>{t.title ? `Poin ${i + 1}` : "Poin baru"}</label>
            <input name="t_title" defaultValue={t.title} placeholder="Judul" className={inp} />
            <textarea name="t_body" rows={3} defaultValue={t.body} placeholder="Isi" className={`${inp} mt-2`} />
          </div>
        ))}
        <TermsPreview />
        <Submit>Simpan S&K</Submit>
      </SaveForm>
    </AdminShell>
  );
}