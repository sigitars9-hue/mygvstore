import { createClient } from "@/lib/supabase/server";
import { SLIDES, type Slide } from "@/lib/banners";

export async function getSlides(): Promise<Slide[]> {
  const sb = await createClient();
  const { data } = await sb.from("banners").select("image_url,alt,href").eq("is_active", true).order("sort");
  return data?.length ? data.map((b) => ({ src: b.image_url, alt: b.alt, href: b.href })) : SLIDES;
}