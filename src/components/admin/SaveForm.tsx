"use client";
import { Fragment, useState } from "react";
import { useFormStatus } from "react-dom";
import { btn } from "@/components/admin/ui";

type R = { ok?: boolean; error?: string };

export function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className={btn}>{pending ? "Menyimpan..." : children}</button>;
}

export function DeleteButton({ children, confirmText }: { children: React.ReactNode; confirmText: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      onClick={(e) => { if (!confirm(confirmText)) e.preventDefault(); }}
      className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Menghapus..." : children}
    </button>
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
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [n, setN] = useState(0);

  return (
    <form
      className={className}
      action={async (fd) => {
        const r = await action(fd);
        if (r?.error) return setMsg({ ok: false, text: r.error });
        setMsg({ ok: true, text: "Tersimpan" });
        if (resetOnOk) setN((x) => x + 1);
        setTimeout(() => setMsg(null), 3000);
      }}
    >
      <Fragment key={n}>{children}</Fragment>
      {msg && (
        <p className={`col-span-full text-sm font-semibold ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}
    </form>
  );
}