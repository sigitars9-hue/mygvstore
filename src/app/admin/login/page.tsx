"use client";
import { useState, useTransition } from "react";
import { signIn } from "@/app/actions/admin";

export default function AdminLogin() {
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const inp = "mb-3 w-full rounded-lg border p-2";
  return (
    <form
      action={(fd) => start(async () => { const r = await signIn(fd); if (r?.error) setErr(r.error); })}
      className="mx-auto mt-10 max-w-sm rounded-xl border bg-white p-6"
    >
      <h1 className="mb-4 text-xl font-bold">Login Admin</h1>
      <input name="email" type="email" placeholder="Email" required className={inp} />
      <input name="password" type="password" placeholder="Password" required className={inp} />
      {err && <p className="mb-2 text-sm text-red-600">{err}</p>}
      <button disabled={pending} className="w-full rounded-lg bg-violet-600 py-2 font-bold text-white disabled:opacity-50">
        {pending ? "Masuk..." : "Masuk"}
      </button>
    </form>
  );
}