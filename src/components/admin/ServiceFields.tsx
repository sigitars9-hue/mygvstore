import ImageUpload from "@/components/admin/ImageUpload";
import { inp, lbl } from "@/components/admin/ui";
import PriceFields from "@/components/admin/PriceFields";

export default function ServiceFields({
  s, jokis, subs = [],
}: { s?: any; jokis: { id: string; name: string }[]; subs?: string[] }) {
  const rows: any[] = [...(s?.options ?? []), {}];
  const listId = `sub-cats-${s?.id ?? "new"}`;
  return (
    <>
      <div className="sm:col-span-2">
        <label className={lbl}>Gambar layanan (opsional, kosong = ikon game)</label>
        <ImageUpload name="image_url" folder="layanan" shape="thumb" defaultValue={s?.image_url ?? ""} />
      </div>
      <div>
        <label className={lbl}>Nama layanan</label>
        <input name="name" defaultValue={s?.name} required className={inp} />
      </div>
      <div>
        <label className={lbl}>Sub kategori (opsional)</label>
        <input name="sub_category" list={listId} defaultValue={s?.sub_category ?? ""}
          placeholder="mis. Rank Mythic" autoComplete="off" className={inp} />
        <datalist id={listId}>{subs.map((x) => <option key={x} value={x} />)}</datalist>
      </div>
      <div>
        <label className={lbl}>Grup (joki)</label>
        <select name="joki_id" defaultValue={s?.joki_id ?? ""} className={inp}>
          <option value="">Pilih grup</option>
          {jokis.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
        </select>
      </div>
<PriceFields s={s} />
      <div>
        <label className={lbl}>Urutan (angka kecil tampil duluan)</label>
        <input name="sort" type="number" defaultValue={s?.sort ?? 0} className={inp} />
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


      <div className="sm:col-span-2">
        <p className="text-sm font-bold text-[#0d0c22]">Pilihan tambahan untuk pelanggan</p>
        <p className="mb-3 mt-0.5 text-xs text-gray-500">
          Tipe <b>Pilihan</b>: isi opsi dipisah koma (mis. Rate on, Rate off). Tipe <b>Teks</b>: pelanggan mengetik sendiri, kolom ketiga jadi contoh isian. Kosongkan label untuk menghapus.
        </p>
        <div className="space-y-3">
          {rows.map((o, i) => (
            <div key={`${o.label ?? ""}-${i}`} className="grid gap-2 rounded-2xl border border-gray-200 p-3 sm:grid-cols-[1fr_120px_110px]">
              <input name="opt_label" defaultValue={o.label ?? ""} placeholder="Label, mis. Status akun" className={inp} />
              <select name="opt_type" defaultValue={o.type ?? "choice"} className={inp}>
                <option value="choice">Pilihan</option>
                <option value="text">Teks</option>
              </select>
              <select name="opt_req" defaultValue={o.required === false ? "0" : "1"} className={inp}>
                <option value="1">Wajib</option>
                <option value="0">Opsional</option>
              </select>
              <input
                name="opt_extra"
                defaultValue={o.type === "text" ? o.hint ?? "" : (o.choices ?? []).join(", ")}
                placeholder="Opsi dipisah koma / contoh isian"
                className={`${inp} sm:col-span-3`}
              />
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
        <input type="checkbox" name="is_active" defaultChecked={s ? s.is_active : true} className="h-4 w-4 accent-black" />
        Tampil di situs
      </label>
    </>
  );
}