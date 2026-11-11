"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";
import { Icon } from "@/components/Icons";
import { btn } from "@/components/admin/ui";

type R = { ok?: boolean; error?: string };

export function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={btn}>
      {pending ? (
        <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <Icon name="check" className="h-4 w-4" />
      )}
      {pending ? "Menyimpan..." : children}
    </button>
  );
}

export function DeleteButton({ children, confirmText }: { children: React.ReactNode; confirmText: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      onClick={(e) => { if (!confirm(confirmText)) e.preventDefault(); }}
      className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 hover:shadow-md hover:shadow-red-100 disabled:opacity-50"
    >
      <Icon name="trash" className="h-4 w-4" />
      {pending ? "Menghapus..." : children}
    </button>
  );
}

function Toast({ ok, text }: { ok: boolean; text: string }) {
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        role="status"
        aria-live="polite"
        className={`animate-fade-up pointer-events-auto flex max-w-md items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-2xl ${
          ok ? "bg-emerald-600 shadow-emerald-600/30" : "bg-red-600 shadow-red-600/30"
        }`}
      >
        <Icon name={ok ? "check" : "alert"} className="h-5 w-5 shrink-0" />
        {text}
      </div>
    </div>,
    document.body
  );
}

export default function SaveForm({
  action, children, className, resetOnOk = false,
}: {
  action: (fd: FormData) => Promise<R>;
  children: React.ReactNode;
  className?: string;
  resetOnOk?: boolean;
}) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string; id: number } | null>(null);
  const [n, setN] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = (ok: boolean, text: string) => {
    clearTimeout(timer.current);
    setMsg({ ok, text, id: Date.now() });
    timer.current = setTimeout(() => setMsg(null), ok ? 3000 : 5000);
  };

  return (
    <form
      ref={form}
      className={className}
      action={async (fd) => {
        const r = await action(fd);
        const ok = !r?.error;
        // Beri tahu pratinjau (FormPreview) hasilnya
        form.current?.dispatchEvent(new CustomEvent("saveform", { detail: { ok } }));
        if (!ok) return show(false, r.error!);
        show(true, "Tersimpan");
        if (resetOnOk) setN((x) => x + 1);
      }}
    >
      <Fragment key={n}>{children}</Fragment>
      {msg && <Toast key={msg.id} ok={msg.ok} text={msg.text} />}
    </form>
  );
}