import { Icon } from "@/components/Icons";
import SaveForm, { Submit, DeleteButton } from "@/components/admin/SaveForm";
import { addJoki, saveJoki, deleteJoki } from "@/app/actions/admin";
import { inp, lbl } from "@/components/admin/ui";

const fields = (j?: any) => (
  <>
    <div>
      <label className={lbl}>Nama joki</label>
      <input name="name" defaultValue={j?.name} required className={inp} />
    </div>
    <div>
      <label className={lbl}>Badge (mis. PRO+, SELECT)</label>
      <input name="badge" defaultValue={j?.badge ?? ""} className={inp} />
    </div>
    <div>
      <label className={lbl}>Waktu respons (menit)</label>
      <input name="response_minutes" type="number" min={1} defaultValue={j?.response_minutes ?? 60} className={inp} />
    </div>
    <div>
      <label className={lbl}>Proyek selesai</label>
      <input name="projects_done" type="number" min={0} defaultValue={j?.projects_done ?? 0} className={inp} />
    </div>
    <div className="sm:col-span-2">
      <label className={lbl}>Bio</label>
      <textarea name="bio" rows={2} defaultValue={j?.bio ?? ""} className={inp} />
    </div>
    <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
      <input type="checkbox" name="is_active" defaultChecked={j ? j.is_active : true} className="h-4 w-4 accent-black" />
      Aktif (tampil di situs)
    </label>
  </>
);

export default function JokiSection({ gameSlug, jokis }: { gameSlug: string; jokis: any[] }) {
  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-baseline justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
        <h2 className="font-semibold">Joki</h2>
        <span className="text-xs text-gray-400">{jokis.length} joki</span>
      </div>

      <div className="divide-y divide-gray-100">
        {jokis.map((j) => (
          <details key={j.id} className="group">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 transition hover:bg-gray-50 sm:px-5 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#0d0c22]">{j.name}</p>
                <p className="truncate text-xs text-gray-500">Respon {j.response_minutes} menit · {j.projects_done} proyek</p>
              </div>
              {j.badge && <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white">{j.badge}</span>}
              {!j.is_active && <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-500">Nonaktif</span>}
              <Icon name="chevron" className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 sm:px-5">
              <SaveForm action={saveJoki} className="grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={j.id} />
                {fields(j)}
                <div className="col-span-full"><Submit>Simpan joki</Submit></div>
              </SaveForm>
              <SaveForm action={deleteJoki} className="mt-4 border-t border-gray-200 pt-4">
                <input type="hidden" name="id" value={j.id} />
                <DeleteButton confirmText="Hapus joki ini?">Hapus joki</DeleteButton>
              </SaveForm>
            </div>
          </details>
        ))}
        {!jokis.length && <p className="px-5 py-8 text-center text-sm text-gray-500">Belum ada joki.</p>}
      </div>

      <details className="group border-t border-gray-200">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold transition hover:bg-gray-50 sm:px-5 [&::-webkit-details-marker]:hidden">
          <Icon name="plus" className="h-4 w-4" />Tambah joki
          <Icon name="chevron" className="ml-auto h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>
        <SaveForm action={addJoki} resetOnOk className="grid gap-4 border-t border-gray-100 bg-gray-50 px-4 py-4 sm:grid-cols-2 sm:px-5">
          <input type="hidden" name="game_slug" value={gameSlug} />
          {fields()}
          <div className="col-span-full"><Submit>Tambah joki</Submit></div>
        </SaveForm>
      </details>
    </section>
  );
}