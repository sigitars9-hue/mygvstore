import { createClient } from "@/lib/supabase/server";

export type CsEntry = { name: string; wa: string; games: string[] };
export type NavGame = { slug: string; name: string };

type GameRow = {
  slug: string;
  name: string;
  cs_name: string | null;
  cs_wa: string | null;
};

export async function getHeaderData(): Promise<{ games: NavGame[]; cs: CsEntry[] }> {
  const sb = await createClient();
  
  const { data, error } = await sb
    .from("games")
    .select("slug, name, cs_name, cs_wa")
    .order("sort", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil header data:", error.message);
    throw new Error("Gagal memuat data header.");
  }

  const rows = (data ?? []) as GameRow[];

  const map = new Map<string, CsEntry>();
  rows.forEach((g) => {
    if (!g.cs_wa) return;
    
    const existing = map.get(g.cs_wa);
    if (existing) {
      existing.games.push(g.name);
    } else {
      map.set(g.cs_wa, {
        name: g.cs_name || "CS",
        wa: g.cs_wa,
        games: [g.name],
      });
    }
  });

  return {
    games: rows.map((g) => ({ slug: g.slug, name: g.name })),
    cs: [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "id")),
  };
}