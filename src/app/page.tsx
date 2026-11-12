import Link from "next/link";
import { loadCatalog, type GameView } from "@/lib/catalog";
import { rp } from "@/lib/utils";
import GameCard from "@/components/GameCard";
import Reveal from "@/components/Reveal";
import { Icon } from "@/components/Icons";
import HeroSlider from "@/components/HeroSlider";
import Terms from "@/components/Terms";
import { getSlides } from "@/lib/slides";
import GameCardGrid from "@/components/GameCardGrid";
import Image from "next/image";
import ViewToggle from "@/components/ViewToggle";

type SP = { q?: string; cat?: string; sort?: string; view?: string };
const BY: Record<string, (a: GameView, b: GameView) => number> = {
  populer: (a, b) => b.projects - a.projects,
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  termurah: (a, b) => (a.minPrice ?? 1e9) - (b.minPrice ?? 1e9),
  nama: (a, b) => a.name.localeCompare(b.name),
};

type Svc = Awaited<ReturnType<typeof loadCatalog>>["jokis"][number]["services"][number];

// ---- Pencarian: harga seperti 25000, 25.000, 25k, 25rb, <30k, >=50rb ----
const PRICE = /^(<=|>=|<|>)?(\d+(?:[.,]\d+)?)(k|rb|ribu)?$/;
const parsePrice = (t: string) => {
  const m = t.match(PRICE);
  if (!m) return null;
  const n = m[3] ? parseFloat(m[2].replace(",", ".")) * 1000 : Number(m[2].replace(/[.,]/g, ""));
  return { op: m[1] ?? "", n };
};
const cmp = (price: number, op: string, n: number) =>
  op === "<" ? price < n : op === "<=" ? price <= n : op === ">" ? price > n : op === ">=" ? price >= n : price === n;
const svcText = (s: Svc) =>
  [s.name, s.description, s.unit, s.duration, ...(s.includes ?? [])].filter(Boolean).join(" ").toLowerCase();
const tokenHitsSvc = (s: Svc, t: string) => {
  const p = parsePrice(t);
  return svcText(s).includes(t) || (p !== null && cmp(s.price, p.op, p.n));
};

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const { q, cat, sort = "populer", view } = await searchParams;
const isGrid = view === "grid";
  const { games, jokis } = await loadCatalog();
  const slides = await getSlides();

  const freq = new Map<string, number>();
  games.forEach((g) => g.categories.forEach((c) => freq.set(c, (freq.get(c) ?? 0) + 1)));
  const cats = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c]) => c);

  const tokens = (q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const svcOf = (gameId: string) => jokis.filter((j) => j.game_id === gameId).flatMap((j) => j.services);

  const matched = new Map<string, string[]>(); // game.id -> layanan yang cocok (petunjuk di bawah kartu)
  const list = games
    .filter((g) => {
      if (cat && !g.categories.includes(cat)) return false;
      if (!tokens.length) return true;
      const svc = svcOf(g.id);
      const hay = [g.name, g.cs_name && `cs ${g.cs_name}`, ...g.categories, ...g.badges]
        .filter(Boolean).join(" ").toLowerCase();
      const ok = tokens.every((t) => hay.includes(t) || svc.some((s) => tokenHitsSvc(s, t)));
      if (ok) {
        const hits = svc.filter((s) => tokens.some((t) => !hay.includes(t) && tokenHitsSvc(s, t)));
        if (hits.length) matched.set(g.id, hits.slice(0, 3).map((s) => `${s.name} · ${rp(s.price)}`));
      }
      return ok;
    })
    .sort((a, b) => Number(a.is_soon) - Number(b.is_soon) || (BY[sort] ?? BY.populer)(a, b));

const href = (o: Partial<SP>) => {
  const p = new URLSearchParams();
  Object.entries({ q, cat, sort, view, ...o }).forEach(([k, v]) => v && p.set(k, v));
  const s = p.toString();
  return s ? `/?${s}` : "/";
};
  const wa = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}`;
  const waiting = "https://chat.whatsapp.com/LK2sFu9ThYCIsNTD1RoF2R";
  const tab = "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2.5 text-sm font-semibold md:gap-2 md:px-5 md:py-3 md:text-base";

  return (
    <>
      <section className="flex flex-col gap-6 pb-8 pt-4 lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-12 lg:gap-y-6">
        <h1 className="fade-up max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight text-[#0d0c22] sm:text-4xl lg:col-start-1 lg:row-start-1 lg:self-end xl:text-5xl">
          Joki Game Gacha Dengan Harga Terbaik dan Terjangkau Untuk{" "}
          <span className="word-box text-pink-400">
            <span className="word-list">
              <span>Daily &amp; Event</span>
              <span>Spiral Abyss</span>
              <span>Farming Material</span>
              <span>Story Clear</span>
              <span>Daily &amp; Event</span>
            </span>
          </span>
        </h1>

        <div style={{ "--d": "0.2s" } as React.CSSProperties} className="fade-up lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <HeroSlider slides={slides} />
        </div>

<div className="flex flex-col items-center gap-3 lg:col-start-1 lg:row-start-2 lg:items-start lg:self-start">
  <Link
    href="/testimoni"
    style={{ "--d": "0.35s" } as React.CSSProperties}
    className="fade-up group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100 lg:gap-3 lg:py-2 lg:pl-2 lg:pr-5"
  >
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-white lg:h-10 lg:w-10">
      <span className="absolute inset-0 animate-ping rounded-full bg-pink-400/40 [animation-duration:2.5s] motion-reduce:animate-none" />
      <Icon name="star" className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-[72deg] group-hover:scale-110 lg:h-5 lg:w-5" />
    </span>
    <span className="flex flex-col text-left leading-tight">
      <b className="text-sm text-[#0d0c22] lg:text-[15px]">Testimoni</b>
      <span className="hidden text-xs text-gray-500 sm:block">Kata pelanggan kami</span>
    </span>
    <Icon name="right" className="h-3.5 w-3.5 text-gray-400 transition duration-300 group-hover:translate-x-1 group-hover:text-pink-500 lg:h-4 lg:w-4" />
  </Link>

  <a
    href={waiting}
    target="_blank"
    rel="noreferrer"
    style={{ "--d": "0.45s" } as React.CSSProperties}
    className="fade-up group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 lg:gap-3 lg:py-2 lg:pl-2 lg:pr-5"
  >
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center lg:h-10 lg:w-10">
      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40 [animation-duration:2.5s] motion-reduce:animate-none" />
      <Image
        src="/icon/wa.png"
        alt=""
        width={40}
        height={40}
        className="relative h-8 w-8 transition-transform duration-300 group-hover:scale-110 lg:h-10 lg:w-10"
      />
    </span>
    <span className="flex flex-col text-left leading-tight">
      <b className="text-sm text-[#0d0c22] lg:text-[15px]">Ruang Tunggu</b>
      <span className="hidden text-xs text-gray-500 sm:block">Gabung &amp; pantau antrian</span>
    </span>
    <Icon name="right" className="h-3.5 w-3.5 text-gray-400 transition duration-300 group-hover:translate-x-1 group-hover:text-emerald-500 lg:h-4 lg:w-4" />
  </a>
</div>
      </section>

      <div id="game" className="flex items-center gap-1 overflow-x-auto scroll-mt-4 pt-2 [scrollbar-width:none] md:flex-wrap md:gap-2 md:overflow-visible [&::-webkit-scrollbar]:hidden">
        <Link href="/" className={`${tab} bg-gray-100`}><Icon name="grid" />Game</Link>
        <a href={wa} target="_blank" rel="noreferrer" className={`${tab} text-gray-600 hover:bg-gray-50`}><Icon name="chat" />Hubungi Admin</a>
        <Terms className="md:ml-auto" />
      </div>

      <form action="/" className="mt-5 flex items-center rounded-full bg-gray-100 py-2.5 pl-8 pr-2.5">
        {cat && <input type="hidden" name="cat" value={cat} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari semua disini"
          className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-gray-500 sm:text-lg"
        />
        <button aria-label="Cari" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600"><Icon name="search" /></button>
      </form>

<div className="mt-5 flex items-center gap-2 sm:gap-3">
  <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-6 [-ms-overflow-style:none] [scrollbar-width:none] [mask-image:linear-gradient(to_right,#000_88%,transparent)] sm:gap-3 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden">
    <b className="shrink-0 text-sm">Populer:</b>
    {cats.map((c) => (
      <Link
        key={c}
        href={href({ cat: cat === c ? undefined : c })}
        scroll={false}
        className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm sm:px-4 sm:py-2 ${
          cat === c ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"
        }`}
      >
        {c}
      </Link>
    ))}
  </div>

  <ViewToggle isGrid={isGrid} listHref={href({ view: undefined })} gridHref={href({ view: "grid" })} />
</div>

      {list.length === 0 && (
        <p className="py-16 text-center text-gray-500">
          {q ? <>Tidak ada hasil untuk “{q}”.</> : "Game tidak ditemukan."}
        </p>
      )}
<div
  className={`transition-opacity duration-200 [html[data-view-loading]_&]:pointer-events-none [html[data-view-loading]_&]:opacity-40 ${
    isGrid
      ? "mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4"
      : "mt-8 grid grid-cols-1 gap-5"
  }`}
>
  {list.map((g, i) => (
    <Reveal key={g.id} delay={(i % 2) * 0.08} className="min-w-0">
      {isGrid ? <GameCardGrid g={g} i={i} /> : <GameCard g={g} i={i} />}
      {matched.get(g.id) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 px-2 text-xs text-gray-500">
          <span className="font-semibold text-gray-700">Cocok:</span>
          {matched.get(g.id)!.map((m) => (
            <span key={m} className="rounded-full bg-pink-50 px-3 py-1 text-pink-700">{m}</span>
          ))}
        </div>
      )}
    </Reveal>
  ))}
</div>
    </>
  );
}