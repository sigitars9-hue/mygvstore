import Link from "next/link";
import { loadCatalog, type GameView } from "@/lib/catalog";
import GameCard from "@/components/GameCard";
import Reveal from "@/components/Reveal";
import { Icon } from "@/components/Icons";
import HeroSlider from "@/components/HeroSlider";
import { SLIDES } from "@/lib/banners";

type SP = { q?: string; cat?: string; sort?: string };
const SORTS: Record<string, string> = {
  populer: "Terpopuler", rating: "Rating tertinggi", termurah: "Harga terendah", nama: "Nama A–Z",
};
const BY: Record<string, (a: GameView, b: GameView) => number> = {
  populer: (a, b) => b.projects - a.projects,
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  termurah: (a, b) => (a.minPrice ?? 1e9) - (b.minPrice ?? 1e9),
  nama: (a, b) => a.name.localeCompare(b.name),
};

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const { q, cat, sort = "populer" } = await searchParams;
  const { games } = await loadCatalog();

  const freq = new Map<string, number>();
  games.forEach((g) => g.categories.forEach((c) => freq.set(c, (freq.get(c) ?? 0) + 1)));
  const cats = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c]) => c);

  const term = q?.trim().toLowerCase();
  const list = games
    .filter((g) => (!cat || g.categories.includes(cat)) && (!term || g.name.toLowerCase().includes(term)))
    .sort((a, b) => Number(a.is_soon) - Number(b.is_soon) || (BY[sort] ?? BY.populer)(a, b));

  const href = (o: Partial<SP>) => {
    const p = new URLSearchParams();
    Object.entries({ q, cat, sort, ...o }).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `/?${s}` : "/";
  };
  const wa = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}`;
  const tab = "flex items-center gap-2 rounded-full px-5 py-3 font-semibold";

  return (
    <>
        <section className="flex flex-col gap-6 pb-8 pt-4 lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-12 lg:gap-y-6">
        <h1 className="fade-up max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight text-[#0d0c22] sm:text-5xl lg:col-start-1 lg:row-start-1 lg:self-end xl:text-6xl">
          Joki game terpercaya untuk{" "}
          <span className="word-box text-pink-400">
            <span className="word-list">
              <span>daily &amp; event</span>
              <span>spiral abyss</span>
              <span>farming material</span>
              <span>story clear</span>
              <span>daily &amp; event</span>
            </span>
          </span>
        </h1>

        <div style={{ "--d": "0.2s" } as React.CSSProperties} className="fade-up lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <HeroSlider slides={SLIDES} />
        </div>

        <a
          href="#game"
          style={{ "--d": "0.35s" } as React.CSSProperties}
          className="fade-up inline-flex items-center gap-2 self-start rounded-full bg-[#0d0c22] px-6 py-4 font-bold text-white hover:bg-black lg:col-start-1 lg:row-start-2"
        >
          <Icon name="sparkle" />Mulai Booking
        </a>
      </section>

      <div id="game" className="flex flex-wrap gap-2 scroll-mt-20 pt-2">
        <Link href="/" className={`${tab} bg-gray-100`}><Icon name="grid" />Game</Link>
        <a href={wa} target="_blank" className={`${tab} text-gray-600 hover:bg-gray-50`}><Icon name="chat" />Hubungi Admin</a>
      </div>

      <form action="/" className="mt-5 flex items-center rounded-full bg-gray-100 py-2.5 pl-8 pr-2.5">
        {cat && <input type="hidden" name="cat" value={cat} />}
        <input name="q" defaultValue={q} placeholder="Game apa yang kamu cari?" className="h-11 flex-1 bg-transparent text-lg outline-none placeholder:text-gray-500" />
        <button aria-label="Cari" className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600"><Icon name="search" /></button>
      </form>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto pb-1">
          <b className="shrink-0 text-sm">Populer:</b>
          {cats.map((c) => (
            <Link key={c} href={href({ cat: cat === c ? undefined : c })}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm ${cat === c ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}>
              {c}
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

      {list.length === 0 && <p className="py-16 text-center text-gray-500">Game tidak ditemukan.</p>}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {list.map((g, i) => (
          <Reveal key={g.id} delay={(i % 2) * 0.08} className="min-w-0"><GameCard g={g} i={i} /></Reveal>
        ))}
      </div>
    </>
  );
}