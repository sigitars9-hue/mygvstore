import ImageUpload from "@/components/admin/ImageUpload";
import { inp, lbl } from "@/components/admin/ui";
import PriceFields from "@/components/admin/PriceFields";
import OptionFields from "@/components/admin/OptionFields";
import FormDraft from "@/components/admin/FormDraft";

export default function ServiceFields({
  s, jokis, subs = [], cats = [],
}: { s?: any; jokis: { id: string; name: string }[]; subs?: string[]; cats?: string[] }) {
  const listId = `sub-cats-${s?.id ?? "new"}`;
  const catListId = `svc-cats-${s?.id ?? "new"}`;

  return (
    <>
      {/* Autosave draft ke localStorage; hilang otomatis setelah berhasil disimpan */}
      <FormDraft serverSig={JSON.stringify(s ?? null)} />

      <div className="sm:col-span-2">
        <label className={lbl}>Gambar layanan (opsional, kosong = ikon game)</label>
        <ImageUpload name="image_url" folder="layanan" shape="thumb" defaultValue={s?.image_url ?? ""} />
      </div>

      <div>
        <label className={lbl}>Nama layanan</label>
        <input name="name" defaultValue={s?.name} required className={inp} />
      </div>
      <div>
        <label className={lbl}>Kategori (pilih yang ada, atau ketik nama baru)</label>
        <input name="category" list={catListId} defaultValue={s?.category ?? ""}
          placeholder="mis. Build Char" autoComplete="off" className={inp} />
        <datalist id={catListId}>{cats.map((x) => <option key={x} value={x} />)}</datalist>
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
      <div>
        <label className={lbl}>Batas pembelian maksimal (kosong = tanpa batas)</label>
        <input name="max_qty" type="number" min={1} max={99} step={1} inputMode="numeric"
          defaultValue={s?.max_qty ?? ""} placeholder="mis. 5" className={inp} />
      </div>
      <div>
        <label className={lbl}>Satuan</label>
        <input name="unit" defaultValue={s?.unit ?? "per paket"} className={inp} />
      </div>
      <div>
        <label className={lbl}>Estimasi</label>
        <input name="duration" defaultValue={s?.duration ?? ""} placeholder="1 hari" className={inp} />
      </div>

      <div className="sm:col-span-2">
        <label className={lbl}>Deskripsi</label>
        <textarea name="description" rows={3} defaultValue={s?.description ?? ""} className={inp} />
      </div>
      <div className="sm:col-span-2">
        <label className={lbl}>Yang termasuk (satu poin per baris)</label>
        <textarea name="includes" rows={3} defaultValue={(s?.includes ?? []).join("\n")} className={inp} />
      </div>

      {/* Pilihan tambahan: baris baru hanya muncul lewat tombol "Tambah pilihan".
          key ikut isi opsi tersimpan, jadi komponen dimuat ulang setelah disimpan. */}
      <OptionFields key={JSON.stringify(s?.options ?? [])} options={s?.options ?? []} />

      <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
        <input type="checkbox" name="is_active" defaultChecked={s ? s.is_active : true} className="h-4 w-4 accent-black" />
        Tampil di situs
      </label>
    </>
  );
}