import { Icon } from "@/components/Icons";
import SaveForm, { Submit, DeleteButton } from "@/components/admin/SaveForm";
import { addJoki, saveJoki, deleteJoki } from "@/app/actions/admin";
import { inp, card, lbl } from "@/components/admin/ui";

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
    <div className={`${card} mt-4`}>
      <h2 className="text-lg font-bold">Joki</h2>
      <div className="mt-2">
        {jokis.map((j) => (
          <details key={j.id} className="group border-b border-gray-100">
            <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#0d0c22]">{j.name}</p>
                <p className="text-xs text-gray-500">Respon {j.response_minutes} menit · {j.projects_done} proyek</p>
              </div>
              {j.badge && <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-extrabold text-white">{j.badge}</span>}
              {!j.is_active && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">Nonaktif</span>}
              <Icon name="chevron" className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="pb-5 pt-1">
              <SaveForm action={saveJoki} className="grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={j.id} />
                {fields(j)}
                <div className="col-span-full"><Submit>Simpan joki</Submit></div>
              </SaveForm>
              <SaveForm action={deleteJoki} className="mt-3">
                <input type="hidden" name="id" value={j.id} />
                <DeleteButton confirmText="Hapus joki ini?">Hapus joki</DeleteButton>
              </SaveForm>
            </div>
          </details>
        ))}
        {!jokis.length && <p className="py-4 text-sm text-gray-500">Belum ada joki.</p>}
      </div>

      <details className="mt-4 rounded-2xl border border-dashed border-gray-300 p-4">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold [&::-webkit-details-marker]:hidden">
          <Icon name="plus" className="h-4 w-4" />Tambah joki
        </summary>
        <SaveForm action={addJoki} resetOnOk className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="game_slug" value={gameSlug} />
          {fields()}
          <div className="col-span-full"><Submit>Tambah joki</Submit></div>
        </SaveForm>
      </details>
    </div>
  );
}