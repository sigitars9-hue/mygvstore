import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/utils";

export type Game = {
  id: string; slug: string; name: string; is_soon: boolean; promoted: boolean;
  badges: string[]; categories: string[]; sort: number;
  icon_url: string | null; category_images: Record<string, string> | null;
  cs_name: string | null; cs_wa: string | null;
};
export type Joki = {
  id: string; slug: string; game_id: string; name: string; bio: string | null;
  badge: string | null; response_minutes: number; projects_done: number;
};
export type JokiView = Joki & { services: Service[]; rating: number | null; reviews: number; minPrice: number | null };
export type GameView = Game & {
  jokiCount: number; minPrice: number | null; rating: number | null;
  reviews: number; projects: number; response: number;
  icon: string | null; categoryImages: Record<string, string>;
};

export const respText = (m: number) => (m < 60 ? `${m} menit` : m === 60 ? "1 jam" : `${Math.round(m / 60)} jam`);

export async function loadCatalog() {
  const sb = await createClient();
  const [g, j, s, r] = await Promise.all([
    sb.from("games").select("*").order("sort").order("name"),
    sb.from("jokis").select("*").eq("is_active", true),
    sb.from("services").select("*").eq("is_active", true),
    sb.from("reviews").select("service_id,rating"),
  ]);
  const services = (s.data ?? []) as (Service & { joki_id: string | null })[];
  const rate = new Map<string, { n: number; sum: number }>();
  (r.data ?? []).forEach((x) => {
    const v = rate.get(x.service_id) ?? { n: 0, sum: 0 };
    v.n++; v.sum += x.rating;
    rate.set(x.service_id, v);
  });

  const jokis: JokiView[] = ((j.data ?? []) as Joki[]).map((jk) => {
    const sv = services.filter((x) => x.joki_id === jk.id);
    let n = 0, sum = 0;
    sv.forEach((x) => { const v = rate.get(x.id); if (v) { n += v.n; sum += v.sum; } });
    return { ...jk, services: sv, rating: n ? sum / n : null, reviews: n, minPrice: sv.length ? Math.min(...sv.map((x) => x.price)) : null };
  });

  const games: GameView[] = ((g.data ?? []) as Game[]).map((gm) => {
    const js = jokis.filter((x) => x.game_id === gm.id);
    const n = js.reduce((a, x) => a + x.reviews, 0);
    const sum = js.reduce((a, x) => a + (x.rating ?? 0) * x.reviews, 0);
    const prices = js.map((x) => x.minPrice).filter((p): p is number => p !== null);
    return {
      ...gm,
      jokiCount: js.length,
      minPrice: prices.length ? Math.min(...prices) : null,
      rating: n ? sum / n : null,
      reviews: n,
      projects: js.reduce((a, x) => a + x.projects_done, 0),
      response: js.length ? Math.round(js.reduce((a, x) => a + x.response_minutes, 0) / js.length) : 60,
      icon: gm.icon_url ?? null,
      categoryImages: gm.category_images ?? {},
    };
  });
  return { games, jokis };
}