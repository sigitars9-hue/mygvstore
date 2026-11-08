import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  let notAdmin = false;
  if (user) {
    const { data: ok } = await sb.rpc("is_admin");
    if (ok) redirect("/admin"); // sesi masih aktif: langsung masuk
    notAdmin = true;
  }

  return <LoginForm notAdmin={notAdmin} />;
}