"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { presignUpload, addOffer, saveOffer, deleteOffer } from "@/app/actions/admin";
import type { Offer } from "@/lib/offers";

const input = "w-full rounded-xl bg-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-300";

// ISO (UTC) -> format input datetime-local (zona waktu browser)
const toLocal = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function OfferForm({ offer }: { offer?: Offer }) {
  const [url, setUrl] = useState(offer?.image_url ?? "");
  const [end, setEnd] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // diisi di client supaya tidak bentrok zona waktu server vs browser
  useEffect(() => setEnd(toLocal(offer?.ends_at)), [offer?.ends_at]);

  async function onFile(file?: File) {
    if (!file) return;
    setUploading(true);
    setMsg(null);
    const r = await presignUpload("offers", file.type);
    if ("error" in r) {
      setMsg({ ok: false, text: r.error });
    } else {
      const res = await fetch(r.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (res.ok) setUrl(r.publicUrl);
      else setMsg({ ok: false, text: "Upload gagal" });
    }
    setUploading(false);
  }

  function submit(fd: FormData) {
    start(async () => {
      const r = await (offer ? saveOffer : addOffer)(fd);
      if (r.error) return setMsg({ ok: false, text: r.error });
      setMsg({ ok: true, text: "Tersimpan" });
      if (!offer) {
        formRef.current?.reset();
        setUrl("");
        setEnd("");
      }
    });
  }

  function remove() {
    if (!offer || !confirm("Hapus offer ini?")) return;
    const fd = new FormData();
    fd.set("id", offer.id);
    start(async () => {
      const r = await deleteOffer(fd);
      if (r.error) setMsg({ ok: false, text: r.error });
    });
  }

  return (
    <form ref={formRef} action={submit} className="flex gap-4">
      {offer && <input type="hidden" name="id" value={offer.id} />}
      <input type="hidden" name="image_url" value={url} />
      <input type="hidden" name="ends_at" value={end ? new Date(end).toISOString() : ""} />

      {/* Upload gambar 4:5 */}
      <label className="relative flex aspect-[4/5] w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-center text-xs text-gray-500 hover:border-pink-400 sm:w-32">
        {url ? (
          <Image src={url} alt="" fill sizes="128px" className="object-cover" />
        ) : (
          <span className="px-2">{uploading ? "Mengunggah…" : "Pilih gambar 4:5"}</span>
        )}
        {url && uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">…</span>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </label>

      <div className="grid min-w-0 flex-1 gap-2">
        <input
          name="label"
          defaultValue={offer?.label ?? ""}
          placeholder="Label promo, mis. Up to 50%"
          maxLength={24}
          className={input}
        />
        <input
          name="alt"
          defaultValue={offer?.alt}
          placeholder="Deskripsi singkat (alt)"
          className={input}
        />
        <input
          name="href"
          defaultValue={offer?.href ?? ""}
          placeholder="Link tujuan (opsional), mis. /?q=genshin"
          className={input}
        />

        {/* Batas waktu */}
        <label className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          Berakhir
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={`${input} !w-auto`}
          />
          {end && (
            <button
              type="button"
              onClick={() => setEnd("")}
              className="text-xs text-pink-600 hover:underline"
            >
              Hapus batas waktu
            </button>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Urutan
            <input
              name="sort"
              type="number"
              defaultValue={offer?.sort ?? 0}
              className={`${input} !w-20`}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={offer?.is_active ?? true} />
            Aktif
          </label>

          <div className="ml-auto flex gap-2">
            {offer && (
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className="rounded-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Hapus
              </button>
            )}
            <button
              disabled={pending || uploading}
              className="rounded-full bg-[#0d0c22] px-5 py-2 text-sm font-bold text-white hover:bg-pink-500 disabled:opacity-50"
            >
              {pending ? "Menyimpan…" : offer ? "Simpan" : "Tambah"}
            </button>
          </div>
        </div>

        {msg && <p className={`text-sm ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>}
      </div>
    </form>
  );
}