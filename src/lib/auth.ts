import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Dipanggil di setiap halaman & action admin. Bukan admin = dilempar ke login.
export async function requireAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: ok } = await sb.rpc("is_admin");
  if (!ok) redirect("/admin/login");
  return sb;
}