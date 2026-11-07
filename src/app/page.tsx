import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/utils";
import ServiceCard from "@/components/ServiceCard";
import { Icon } from "@/components/Icons";
import Reveal from "@/components/Reveal";

type SP = { game?: string; q?: string; sort?: string };
const SORTS: Record<string, string> = {
  populer: "Terpopuler", termurah: "Harga terendah", termahal: "Harga tertinggi", terbaru: "Terbaru",
};

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const { game, q, sort = "populer" } = await searchParams;
  const sb = await createClient();
  const [{ data }, { data: rv }] = await Promise.all([
    sb.from("services").select("*").eq("is_active", true).order("created_at"),
    sb.from("reviews").select("service_id,rating"),
  ]);
  const all = (data ?? []) as Service[];

  const stats = new Map<string, { n: number; sum: number }>();
  (rv ?? []).forEach((r) => {
    const x = stats.get(r.service_id) ?? { n: 0, sum: 0 };
    x.n++; x.sum += r.rating;
    stats.set(r.service_id, x);
  });

  const games = [...new Set(all.map((s) => s.game))];
  const term = q?.trim().toLowerCase();
  let list = all.filter((s) => (!game || s.game === game) && (!term || `${s.name} ${s.game}`.toLowerCase().includes(term)));
  if (sort === "termurah") list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === "termahal") list = [...list].sort((a, b) => b.price - a.price);
  else if (sort === "terbaru") list = [...list].reverse();
  else list = [...list].sort((a, b) => (stats.get(b.id)?.n ?? 0) - (stats.get(a.id)?.n ?? 0));

  const href = (o: Partial<SP>) => {
    const p = new URLSearchParams();
    Object.entries({ game, q, sort, ...o }).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `/?${s}` : "/";
  };
  const wa = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}`;
  const tab = "flex items-center gap-2 rounded-full px-5 py-3 font-semibold";

  return (
    <>
          <section className="pb-8 pt-4">
        <h1 className="fade-up max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight text-[#0d0c22] sm:text-5xl lg:text-6xl">
          Joki game terpercaya untuk{" "}
          <span className="word-box text-pink-400">
            <span className="word-list">
              <span>naik rank</span>
              <span>farming harian</span>
              <span>event &amp; abyss</span>
              <span>push tier</span>
              <span>naik rank</span>
            </span>
          </span>
        </h1>
        <ul className="mt-6 space-y-3">
          {["Pilih layanan, booking, dan bayar dengan mudah", "Pantau progres joki langsung lewat kode pesanan", "Booster berpengalaman, akun dikerjakan aman"].map((t, i) => (
            <li key={t} style={{ "--d": `${0.15 + i * 0.1}s` } as React.CSSProperties} className="fade-up flex items-center gap-3 text-[17px]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                <Icon name="check" className="h-4 w-4" />
              </span>
              {t}
            </li>
          ))}
        </ul>
        <a
          href="#layanan"
          style={{ "--d": "0.5s" } as React.CSSProperties}
          className="fade-up mt-7 inline-flex items-center gap-2 rounded-full bg-[#0d0c22] px-6 py-4 font-bold text-white hover:bg-black"
        >
          <Icon name="sparkle" />
          Mulai Booking
        </a>
      </section>
      <div id="layanan" className="flex flex-wrap gap-2 scroll-mt-20 pt-2">
        <Link href="/" className={`${tab} bg-gray-100`}><Icon name="grid" />Layanan</Link>
        <Link href="/lacak" className={`${tab} text-gray-600 hover:bg-gray-50`}><Icon name="chart" />Lacak Progres</Link>
        <a href={wa} target="_blank" className={`${tab} text-gray-600 hover:bg-gray-50`}><Icon name="chat" />Hubungi Admin</a>
      </div>

      <form action="/" className="mt-5 flex items-center rounded-full bg-gray-100 py-2.5 pl-8 pr-2.5">
        {game && <input type="hidden" name="game" value={game} />}
        <input
          name="q" defaultValue={q} placeholder="Layanan joki apa yang kamu cari?"
          className="h-11 flex-1 bg-transparent text-lg outline-none placeholder:text-gray-500"
        />
        <button aria-label="Cari" className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600">
          <Icon name="search" />
        </button>
      </form>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto pb-1">
          <b className="shrink-0 text-sm">Populer:</b>
          {games.map((g) => (
            <Link
              key={g} href={href({ game: game === g ? undefined : g })}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm ${game === g ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}
            >
              {g}
            </Link>
          ))}
        </div>
        <details className="relative shrink-0">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
            {SORTS[sort] ?? SORTS.populer}<Icon name="chevron" className="h-4 w-4" />
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border bg-white p-1 shadow-lg">
            {Object.entries(SORTS).map(([k, v]) => (
              <Link key={k} href={href({ sort: k })} className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100">{v}</Link>
            ))}
          </div>
        </details>
      </div>

      {list.length === 0 && <p className="py-16 text-center text-gray-500">Layanan tidak ditemukan.</p>}
      <div className="mt-8 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((s, i) => {
          const st = stats.get(s.id);
          return (
            <Reveal key={s.id} delay={(i % 4) * 0.08}>
              <ServiceCard s={s} rating={st ? st.sum / st.n : undefined} count={st?.n} />
            </Reveal>
          );
        })}
      </div>
    </>
  );
}