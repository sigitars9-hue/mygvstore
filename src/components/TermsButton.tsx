"use client";
import { useRef } from "react";
import { Icon } from "@/components/Icons";
import { TERMS } from "@/lib/terms";
import type { Term } from "@/lib/terms-db";

export default function TermsButton({ className = "", terms = TERMS }: { className?: string; terms?: Term[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 md:gap-2 md:px-5 md:py-3 md:text-base ${className}`}
       > <Icon name="receipt" className="h-5 w-5" />
S &amp; K
      </button>

      <dialog
        ref={ref}
        onClick={(e) => { if (e.target === ref.current) close(); }}
        className="m-auto max-h-[85vh] w-[min(92vw,640px)] rounded-3xl p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-extrabold">Syarat &amp; Ketentuan</h2>
            <button type="button" aria-label="Tutup" onClick={close} className="rounded-full p-2 hover:bg-gray-100">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <ol className="space-y-4 overflow-y-auto px-6 py-5">
            {TERMS.map((t, i) => (
              <li key={t.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-600">{i + 1}</span>
                <div>
                  <b className="block">{t.title}</b>
                  <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="border-t border-gray-100 px-6 py-4">
            <button type="button" onClick={close} className="w-full rounded-full bg-[#0d0c22] py-3 font-bold text-white hover:bg-black">
              Saya mengerti
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}