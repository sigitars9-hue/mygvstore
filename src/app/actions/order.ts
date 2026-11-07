"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Res = { code?: string; ok?: boolean; error?: string };

export async function createOrder(input: {
  name: string; contact: string; account: string; schedule: string;
  items: { service_id: string; qty: number }[];
}): Promise<Res> {
  const sb = await createClient();
  const { data, error } = await sb.rpc("create_order", {
    p_name: input.name, p_contact: input.contact, p_account: input.account,
    p_schedule: input.schedule || null, p_items: input.items,
  });
  if (error) return { error: error.message };
  return { code: data.code };
}

export async function uploadProof(fd: FormData): Promise<Res> {
  const code = String(fd.get("code")).toUpperCase();
  const file = fd.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Pilih file bukti dulu" };
  if (!file.type.startsWith("image/") || file.size > 3_000_000) return { error: "Gunakan gambar maksimal 3 MB" };

  const sb = await createClient();
  const { data: o } = await sb.rpc("track_order", { p_code: code });
  if (!o || o.cancelled || o.pay_status === "paid") return { error: "Pesanan ini tidak bisa menerima bukti" };

  const path = `${code}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const up = await supabaseAdmin.storage.from("payment-proofs").upload(path, file, { contentType: file.type });
  if (up.error) return { error: up.error.message };
  await supabaseAdmin.from("orders").update({ proof_path: path, pay_status: "proof" }).eq("code", code);
  revalidatePath("/lacak");
  return { ok: true };
}

export async function submitReview(fd: FormData): Promise<Res> {
  const sb = await createClient();
  const { error } = await sb.rpc("submit_review", {
    p_code: String(fd.get("code")), p_service_id: String(fd.get("service_id")),
    p_rating: Number(fd.get("rating")), p_comment: String(fd.get("comment") || ""),
  });
  if (error) return { error: error.message };
  revalidatePath("/layanan/[slug]", "page");
  return { ok: true };
}