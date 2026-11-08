"use client";
import { useRef, useState } from "react";
import { presignUpload } from "@/app/actions/admin";
import { Icon } from "@/components/Icons";

const SHAPE = {
  wide: { box: "aspect-[1376/768] w-full max-w-sm rounded-2xl", max: 1600 },
  thumb: { box: "aspect-[4/3] w-full max-w-[220px] rounded-2xl", max: 800 },
  round: { box: "h-24 w-24 rounded-full", max: 256 },
} as const;

async function compress(file: File, max: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error("Gagal memproses gambar"))), "image/webp", 0.85)
  );
}

export default function ImageUpload({
  name, folder, defaultValue = "", shape = "wide",
}: {
  name: string; folder: string; defaultValue?: string; shape?: keyof typeof SHAPE;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const cfg = SHAPE[shape];

  const pick = async (f?: File) => {
    if (!f) return;
    setErr("");
    setBusy(true);
    try {
      if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) throw new Error("Gunakan PNG, JPG, atau WebP");
      const blob = await compress(f, cfg.max);
      const type = blob.type === "image/webp" ? "image/webp" : "image/png";
      const r = await presignUpload(folder, type);
      if ("error" in r) throw new Error(r.error);
      const put = await fetch(r.uploadUrl, { method: "PUT", headers: { "Content-Type": type }, body: blob });
      if (!put.ok) throw new Error("Upload ke R2 ditolak. Periksa CORS bucket.");
      setUrl(r.publicUrl);
    } catch (e) {
      setErr(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "Upload gagal. Periksa CORS bucket R2.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <div className={`relative flex items-center justify-center overflow-hidden border border-dashed border-gray-300 bg-gray-50 ${cfg.box}`}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon name="image" className="h-7 w-7 text-gray-300" />
        )}
        {busy && <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-bold">Mengunggah...</div>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" disabled={busy} onClick={() => ref.current?.click()}
          className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold hover:bg-gray-200 disabled:opacity-50">
          <Icon name="upload" className="h-3.5 w-3.5" />{url ? "Ganti" : "Pilih gambar"}
        </button>
        {url && (
          <button type="button" onClick={() => setUrl("")} className="text-xs font-semibold text-gray-500 hover:text-red-600">
            Hapus
          </button>
        )}
      </div>
      {err && <p className="mt-1.5 text-xs text-red-600">{err}</p>}
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} />
      <input type="hidden" name={name} value={url} />
    </div>
  );
}