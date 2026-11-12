import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { loadCatalog } from "@/lib/catalog";
import { catOf, shortName, rp, subGroups, hasPromo, discountPct, badgeTone, bySort, minSort, type Service } from "@/lib/utils";
import { GAME_ICONS } from "@/lib/game-icons";
import { Icon } from "@/components/Icons";
import Terms from "@/components/Terms";
import GameAvatar from "@/components/GameAvatar";
import PageNav from "@/components/PageNav";
import ZoomImage from "@/components/ZoomImage";
import ServiceRow from "@/components/ServiceRow";
import { LinkSpinner, LinkFade } from "@/components/LinkPending";
import SearchBox from "@/components/SearchBox";
import { didYouMean } from "@/lib/suggest";

const nat = (a: string, b: string) => a.localeCompare(b, "id", { numeric: true });

export default async function GamePage({
  params, searchParams,
}: { params: Promise<{ slug: string }>; searchParams: Promise<{ k?: string; q?: string }> }) {
  const { slug } = await params;
  const { k, q } = await searchParams;
  const { games, jokis } = await loadCatalog();
  const g = games.find((x) => x.slug === slug);
  if (!g) notFound();

  const rows: Service[] = jokis.filter((j) => j.game_id === g.id).flatMap((j) => j.services);
  const maxDiscount = Math.max(0, ...rows.map(discountPct));
  // Pencarian: semua kata harus cocok di nama / nama pendek / kategori
const hayOf = (s: Service) => `${s.name} ${shortName(s)} ${catOf(s)} ${hasPromo(s) ? "promo diskon" : ""}`.toLowerCase();
  const terms = (q ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;
  
  const visible = searching
    ? rows.filter((s) => terms.every((t) => hayOf(s).includes(t)))
    : rows;

  const suggestion = searching && visible.length === 0 ? didYouMean(terms, rows, hayOf) : null;

  const groups = new Map<string, Service[]>();
  [...visible].sort((a, b) => bySort(a, b) || a.price - b.price).forEach((s) => {
    const c = catOf(s);
    groups.set(c, [...(groups.get(c) ?? []), s]);
  });
  const cats = [...groups.entries()].sort(([a, ia], [b, ib]) =>
    a === "Lainnya" ? 1 : b === "Lainnya" ? -1 : minSort(ia) - minSort(ib) || nat(a, b)
  );

  const active = searching ? null : k && groups.has(k) ? k : cats.length === 1 ? cats[0][0] : null;
  const items = active ? groups.get(active)! : [];
  const subList = subGroups(items);

  const gameIcon = g.icon ?? GAME_ICONS[g.slug] ?? null;
  const catImgs = g.service_cat_images ?? {};
  const csHref = `https://wa.me/${g.cs_wa || process.env.NEXT_PUBLIC_WA_NUMBER}?text=${encodeURIComponent(
    `Halo ${g.cs_name ? `kak ${g.cs_name}` : "admin"}, saya mau tanya soal joki ${g.name}`
  )}`;
  const chip = "flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:bg-gray-200";

  return (
    <div className="pb-10">
      <PageNav />

      <section className="animate-fade-up relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-pink-200/50 to-violet-200/40 blur-3xl dark:from-pink-500/25 dark:to-fuchsia-500/10" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <GameAvatar slug={g.slug} name={g.name} size={56} src={g.icon} />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-extrabold leading-tight tracking-tight text-[#0d0c22] sm:text-3xl">{g.name}</h1>
              {g.badges.length > 0 && (
<div className="mt-1.5 flex flex-wrap gap-1.5">
  {maxDiscount > 0 && (
    <span className="animate-pop-in rounded-md bg-gradient-to-b from-red-500 to-red-700 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm shadow-red-500/30">
      PROMO s/d {maxDiscount}%
    </span>
  )}
  {g.badges.map((b) => (
    <span key={b} className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white ${badgeTone(b)}`}>{b}</span>
  ))}
</div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={chip}><Icon name="star" className="h-3.5 w-3.5 text-amber-500" />{g.rating ? g.rating.toFixed(1) : "Baru"}</span>
            <span className={chip}><Icon name="check" className="h-3.5 w-3.5" />{g.projects.toLocaleString("id-ID")} proyek</span>
            <span className={chip}><Icon name="list" className="h-3.5 w-3.5" />{rows.length} layanan</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
            <a href={csHref} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#0d0c22] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-black hover:shadow-lg hover:shadow-black/20 active:scale-95">
              <Icon name="chat" className="h-4 w-4" />Chat CS {g.cs_name ?? "Admin"}
            </a>
            <Terms />
          </div>
        </div>
      </section>

      {rows.length > 0 && (
        <div className="mt-4">
          <SearchBox initial={q ?? ""} />
        </div>
      )}

      {/* Galeri (gambar dari admin) */}
      {!active && !searching && g.categories.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="image" className="h-5 w-5 text-[#0d0c22]" />
            <h2 className="text-lg font-bold text-[#0d0c22]">Galeri</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">{g.categories.length}</span>
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {g.categories.map((c, i) => {
              const img = g.categoryImages[c];
              const box =
                "animate-fade-up aspect-[4/3] w-56 shrink-0 snap-start overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-64";
              const style = { "--i": i } as React.CSSProperties;
              const label = (
                <>
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 text-xs font-bold text-white">
                    <span className="truncate">{c}</span>
                    <Icon name="sparkle" className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  </span>
                </>
              );
              return img ? (
                <ZoomImage key={c} src={img} alt={c} sizes="256px" className={box} style={style}>{label}</ZoomImage>
              ) : (
                <div key={c} className={`relative ${box}`} style={style}>{label}</div>
              );
            })}
          </div>
        </section>
      )}

      {g.is_soon && <p className="mt-8 rounded-2xl bg-gray-50 p-8 text-center text-gray-500">Game ini segera hadir. Pantau terus ya!</p>}
      {!g.is_soon && rows.length === 0 && <p className="mt-8 text-center text-gray-500">Belum ada layanan tersedia untuk game ini.</p>}

      {/* Daftar kategori */}
      {rows.length > 0 && !active && !searching && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-[#0d0c22]">Kategori layanan</h2>
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-200 bg-white">
            {cats.map(([name, list], i) => {
              const img = catImgs[name] || list.find((s) => s.image_url)?.image_url || gameIcon;
              const min = Math.min(...list.map((s) => s.price));
              return (
                <li key={name} className="animate-fade-up" style={{ "--i": i } as React.CSSProperties}>
                  <Link href={`/game/${g.slug}?k=${encodeURIComponent(name)}`} scroll
                    className="group flex items-center gap-4 p-3 transition hover:bg-gray-50 active:scale-[0.99] active:bg-gray-100 sm:p-4">
                    <LinkFade className="flex min-w-0 flex-1 items-center gap-4">
                      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200 transition group-hover:ring-[#0d0c22]/30 dark:group-hover:ring-white/30"> 
                        {img && <Image src={img} alt="" fill sizes="64px" className="object-cover transition duration-500 group-hover:scale-110" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-lg text-[#0d0c22]">{name}</b>
                        {list.some(hasPromo) && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:bg-red-500/15 dark:text-red-400">PROMO</span>}
                      </span>
                    </LinkFade>
                    <LinkSpinner>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition group-hover:translate-x-1 group-hover:bg-[#0d0c22]">
                        <Icon name="right" className="h-4 w-4 text-gray-400 transition group-hover:text-white" />
                      </span>
                    </LinkSpinner>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Hasil pencarian */}
      {searching && (
        <section className="mt-6">
          <p className="mb-3 text-sm text-gray-500">
            {visible.length} hasil untuk “{(q ?? "").trim()}”
          </p>
          {visible.length === 0 ? (
            <div className="animate-fade-up flex flex-col items-center gap-2 rounded-2xl bg-gray-50 p-10 text-center text-gray-500">
              <Icon name="search" className="h-8 w-8 text-gray-300" />
              <p>Tidak ada layanan yang cocok.</p>
              {suggestion ? (
                <p className="text-sm">
                  Apakah maksud kamu:{" "}
                  <Link
                    href={`/game/${g.slug}?q=${encodeURIComponent(suggestion)}`}
                    scroll={false}
                    className="font-bold text-pink-600 underline decoration-pink-300 underline-offset-4 transition hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
                  >
                    {suggestion}
                  </Link>
                  ?
                </p>
              ) : (
                <p className="text-sm">Coba kata kunci lain.</p>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {cats.map(([name, list]) => (
                <div key={name}>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0d0c22]">
                    {name} <span className="text-xs font-medium text-gray-400">({list.length})</span>
                  </h3>
                  <ul className="divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-200 bg-white">
                    {list.map((s) => (
                      <ServiceRow key={s.id} s={s} title={shortName(s)} game={g.name} gameSlug={g.slug}
                        gameIcon={catImgs[name] || gameIcon} cs={g.cs_wa} csName={g.cs_name} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Isi kategori (dikelompokkan per sub kategori) */}
      {active && (
        <section className="mt-6">
          {cats.length > 1 && (
            <Link href={`/game/${g.slug}`} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white">
              <LinkSpinner><Icon name="back" className="h-4 w-4" /></LinkSpinner>Semua kategori
            </Link>
          )}
          <h2 className="mb-3 text-xl font-bold text-[#0d0c22]">
            {active} <span className="text-sm font-medium text-gray-400">({items.length})</span>
          </h2>

          <div className="space-y-5">
            {subList.map(([sub, list]) => (
              <div key={sub || "_"}>
                {sub && (
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0d0c22]">
                    {sub} <span className="text-xs font-medium text-gray-400">({list.length})</span>
                  </h3>
                )}
                <ul className="divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-200 bg-white">
                  {list.map((s) => (
                    <ServiceRow key={s.id} s={s} title={shortName(s)} game={g.name} gameSlug={g.slug}
                      gameIcon={catImgs[active] || gameIcon} cs={g.cs_wa} csName={g.cs_name} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}