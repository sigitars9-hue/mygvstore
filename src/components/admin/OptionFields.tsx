"use client";

import { useEffect, useRef, useState } from "react";
import { inp } from "@/components/admin/ui";
import { Icon } from "@/components/Icons";

type Opt = {
  label?: string;
  type?: "choice" | "text";
  required?: boolean;
  hint?: string;
  choices?: string[];
};

type Row = { id: number; o: Opt };

export default function OptionFields({ options = [] }: { options?: Opt[] }) {
  const nextId = useRef(options.length);
  const initial = (): Row[] => options.map((o, i) => ({ id: i, o }));
  const [rows, setRows] = useState<Row[]>(initial);
  const box = useRef<HTMLDivElement>(null);

  // Setelah form di-reset (mis. habis "Tambah layanan"), kembalikan ke kondisi awal
  useEffect(() => {
    const form = box.current?.closest("form");
    if (!form) return;
    const onReset = () => {
      nextId.current = options.length;
      setRows(initial());
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = () => setRows((r) => [...r, { id: nextId.current++, o: {} }]);
  const remove = (id: number) => setRows((r) => r.filter((x) => x.id !== id));

  return (
    <div ref={box} className="border-t border-gray-100 pt-4 sm:col-span-2">
      <p className="text-sm font-semibold text-[#0d0c22]">Pilihan tambahan untuk pelanggan</p>
      <p className="mt-0.5 text-xs text-gray-500">
        Tipe <b>Pilihan</b>: isi opsi dipisah koma (mis. Rate on, Rate off). Tipe <b>Teks</b>: pelanggan mengetik sendiri, kolom terakhir jadi contoh isian.
      </p>

      {rows.length === 0 && (
        <p className="mt-3 text-sm text-gray-400">Belum ada pilihan tambahan.</p>
      )}

      <div className="mt-2 divide-y divide-gray-100">
        {rows.map(({ id, o }) => (
          <div key={id} className="grid grid-cols-2 gap-2 py-3 sm:grid-cols-[1fr_8rem_7rem_2.25rem]">
            <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
              <input
                name="opt_label"
                defaultValue={o.label ?? ""}
                placeholder="Label, mis. Status akun"
                className={`${inp} min-w-0 flex-1`}
              />
              <button
                type="button"
                onClick={() => remove(id)}
                title="Hapus pilihan ini"
                aria-label="Hapus pilihan ini"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 sm:hidden"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <select name="opt_type" defaultValue={o.type ?? "choice"} className={inp}>
              <option value="choice">Pilihan</option>
              <option value="text">Teks</option>
            </select>
            <select name="opt_req" defaultValue={o.required === false ? "0" : "1"} className={inp}>
              <option value="1">Wajib</option>
              <option value="0">Opsional</option>
            </select>
            <button
                type="button"
                onClick={() => remove(id)}
                title="Hapus pilihan ini"
                aria-label="Hapus pilihan ini"
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 sm:flex"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            <input
              name="opt_extra"
              defaultValue={o.type === "text" ? o.hint ?? "" : (o.choices ?? []).join(", ")}
              placeholder="Opsi dipisah koma / contoh isian"
              className={`${inp} col-span-2 sm:col-span-4`}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        data-add-option
        onClick={add}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-[#0d0c22] transition hover:border-black"
      >
        <Icon name="plus" className="h-4 w-4" />
        Tambah pilihan
      </button>
    </div>
  );
}