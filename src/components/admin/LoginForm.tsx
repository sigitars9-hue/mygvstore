"use client";
import { useState, useTransition } from "react";
import { signIn } from "@/app/actions/admin";
import { Icon } from "@/components/Icons";

export default function LoginForm({ notAdmin = false }: { notAdmin?: boolean }) {
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  const [pending, start] = useTransition();
  const inp =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] outline-none focus:border-black";

  return (
    <div className="mx-auto max-w-md pb-10 pt-10">
      <form
        action={(fd) =>
          start(async () => {
            setErr("");
            const r = await signIn(fd);
            if (r?.error) setErr(r.error);
          })
        }
        className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Icon name="shield" className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0d0c22]">Login admin</h1>
        <p className="mt-1 text-sm text-gray-600">Masuk untuk mengelola isi situs.</p>

        {notAdmin && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3.5 text-sm text-amber-800">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
            Akun yang sedang login bukan admin. Masuk dengan akun admin.
          </p>
        )}

        <div className="mt-6 space-y-3">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-gray-500">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" required className={inp} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-gray-500">Password</label>
            <div className="relative">
              <input
                id="password" name="password" type={show ? "text" : "password"}
                autoComplete="current-password" required className={`${inp} pr-24`}
              />
              <button
                type="button" onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100"
              >
                {show ? "Sembunyikan" : "Lihat"}
              </button>
            </div>
          </div>
        </div>

        {err && (
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-red-600">
            <Icon name="alert" className="h-4 w-4 shrink-0" />{err}
          </p>
        )}

        <button
          disabled={pending}
          className="mt-6 flex w-full items-center justify-center rounded-full bg-[#0d0c22] py-3.5 font-bold text-white hover:bg-black disabled:opacity-50"
        >
          {pending ? "Masuk..." : "Masuk"}
        </button>
        <p className="mt-3 text-center text-xs text-gray-500">
          Sesi tetap aktif sampai kamu menekan Keluar.
        </p>
      </form>
    </div>
  );
}