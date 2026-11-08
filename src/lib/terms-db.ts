import { createClient } from "@/lib/supabase/server";
import { TERMS } from "@/lib/terms";

export type Term = { title: string; body: string };

export async function getTerms(): Promise<Term[]> {
  const sb = await createClient();
  const { data } = await sb.from("site_settings").select("value").eq("key", "terms").maybeSingle();
  const v = data?.value;
  return Array.isArray(v) && v.length ? (v as Term[]) : (TERMS as Term[]);
}