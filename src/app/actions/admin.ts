"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

const refresh = (code: string) => {
  revalidatePath("/admin");
  revalidatePath(`/admin/${code}`);
  revalidatePath("/lacak");
};

export async function signIn(fd: FormData): Promise<{ error: string } | undefined> {
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({
    email: String(fd.get("email")), password: String(fd.get("password")),
  });
  if (error) return { error: "Email atau password salah" };
  redirect("/admin");
}

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}

export async function confirmPayment(fd: FormData) {
  const sb = await requireAdmin();
  const code = String(fd.get("code"));
  const { data: o } = await sb.from("orders").select("id,stage").eq("code", code).single();
  if (!o) return;
  await sb.from("orders").update({ pay_status: "paid", cancelled: false, stage: Math.max(o.stage, 1) }).eq("id", o.id);
  await sb.from("progress_logs").insert({ order_id: o.id, title: "Pembayaran dikonfirmasi", detail: "Terima kasih, pesananmu segera diproses." });
  refresh(code);
}

export async function rejectProof(fd: FormData) {
  const sb = await requireAdmin();
  const code = String(fd.get("code"));
  await sb.from("orders").update({ pay_status: "rejected" }).eq("code", code);
  refresh(code);
}

export async function updateProgress(fd: FormData) {
  const sb = await requireAdmin();
  const code = String(fd.get("code"));
  const stage = Math.min(4, Math.max(0, Number(fd.get("stage")) || 0));
  const progress = Math.min(100, Math.max(0, Number(fd.get("progress")) || 0));
  const title = String(fd.get("title") || "").trim();
  const detail = String(fd.get("detail") || "").trim();
  const { data: o } = await sb.from("orders").update({ stage, progress }).eq("code", code).select("id").single();
  if (o && title) await sb.from("progress_logs").insert({ order_id: o.id, title, detail });
  refresh(code);
}