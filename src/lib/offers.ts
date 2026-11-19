import { supabaseAdmin as db } from "@/lib/supabase/admin";

export type Offer = {
  id: string;
  image_url: string;
  alt: string;
  label: string | null;
  href: string | null;
  ends_at: string | null;
  sort: number;
  is_active: boolean;
};

export async function getOffers(onlyActive = true): Promise<Offer[]> {
  let q = db.from("offers").select("*").order("sort").order("created_at", { ascending: false });
  if (onlyActive) {
    q = q.eq("is_active", true)
         .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`);
  }
  const { data } = await q;
  return (data ?? []) as Offer[];
}