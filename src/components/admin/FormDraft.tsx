"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Simpan isian form ke localStorage otomatis dan pulihkan saat form dibuka lagi.
 * Taruh di dalam <form>. Draft dihapus saat form berhasil disimpan / di-reset.
 * Kunci draft: id layanan (edit) atau "new:<game_slug>" (tambah).
 */

type Entry = { n: string; v: string };

// field yang tidak ikut disimpan (penanda internal, bukan isian)
const SKIP = new Set(["id", "game_slug", "ids", "dir", "base"]);

function collect(form: HTMLFormElement): Entry[] {
  const out: Entry[] = [];
  Array.from(form.elements).forEach((el) => {
    const f = el as HTMLInputElement;
    if (!f.name || f.disabled || SKIP.has(f.name)) return;
    if (["hidden", "file", "submit", "button", "reset"].includes(f.type)) return;
    out.push({ n: f.name, v: f.type === "checkbox" ? (f.checked ? "1" : "0") : f.value });
  });
  return out;
}

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

// set nilai lewat setter native + dispatch event, supaya input yang dikontrol React ikut ter-update
function setField(el: Field, v: string) {
  if (el instanceof HTMLInputElement && el.type === "checkbox") {
    if (el.checked !== (v === "1")) el.click();
    return;
  }
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, v);
  el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? "change" : "input", { bubbles: true }));
}

function apply(form: HTMLFormElement, entries: Entry[]) {
  // baris "Pilihan tambahan" dibuat dulu lewat tombolnya sampai jumlahnya sama
  const need = entries.filter((e) => e.n === "opt_label").length;
  const add = form.querySelector<HTMLButtonElement>("[data-add-option]");
  for (let i = form.querySelectorAll('[name="opt_label"]').length; i < need; i++) add?.click();

  requestAnimationFrame(() => {
    const seen: Record<string, number> = {};
    entries.forEach(({ n, v }) => {
      const k = (seen[n] = (seen[n] ?? -1) + 1);
      const el = form.querySelectorAll<Field>(`[name="${n}"]`)[k];
      if (el) setField(el, v);
    });
  });
}

export default function FormDraft({ serverSig }: { serverSig: string }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const ctx = useRef<{ form: HTMLFormElement; key: string; initial: string } | null>(null);
  const first = useRef(true);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const form = anchor.current?.closest("form");
    if (!form) return;

    const val = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value;
    const key = `draft:svc:${val("id") || `new:${val("game_slug") ?? ""}`}`;
    const c = (ctx.current = { form, key, initial: JSON.stringify(collect(form)) });

    let restoring = false;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const entries = JSON.parse(raw) as Entry[];
        if (JSON.stringify(entries) !== c.initial) {
          restoring = true;
          apply(form, entries);
          setTimeout(() => (restoring = false), 150);
          setRestored(true);
        }
      }
    } catch {}

    let t: ReturnType<typeof setTimeout>;
    const save = () => {
      if (restoring) return;
      clearTimeout(t);
      t = setTimeout(() => {
        try {
          const cur = JSON.stringify(collect(form));
          if (cur === c.initial) localStorage.removeItem(key);
          else localStorage.setItem(key, cur);
        } catch {}
      }, 400);
    };
    const onReset = () => {
      clearTimeout(t);
      try { localStorage.removeItem(key); } catch {}
      setRestored(false);
    };

    form.addEventListener("input", save);
    form.addEventListener("change", save);
    form.addEventListener("reset", onReset);
    return () => {
      clearTimeout(t);
      form.removeEventListener("input", save);
      form.removeEventListener("change", save);
      form.removeEventListener("reset", onReset);
    };
  }, []);

  // data layanan di server berubah = berhasil disimpan -> hapus draft
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const c = ctx.current;
    if (!c) return;
    try { localStorage.removeItem(c.key); } catch {}
    setRestored(false);
    setTimeout(() => { c.initial = JSON.stringify(collect(c.form)); }, 0);
  }, [serverSig]);

  return (
    <>
      <span ref={anchor} className="hidden" />
      {restored && (
        <div className="col-span-full flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
          <span>Draft yang belum disimpan dipulihkan.</span>
          <button
            type="button"
            onClick={() => anchor.current?.closest("form")?.reset()}
            className="shrink-0 font-semibold underline underline-offset-2"
          >
            Buang draft
          </button>
        </div>
      )}
    </>
  );
}
