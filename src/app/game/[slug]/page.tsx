import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCatalog } from "@/lib/catalog";
import { GAME_ICONS } from "@/lib/game-icons";
import { Icon } from "@/components/Icons";
import Terms from "@/components/Terms";
import GameAvatar from "@/components/GameAvatar";
import PageNav from "@/components/PageNav";
import ZoomImage from "@/components/ZoomImage";
import ServiceRow from "@/components/ServiceRow";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { games, jokis } = await loadCatalog();
  const g = games.find((x) => x.slug === slug);
  if (!g) notFound();

  const rows = jokis
    .filter((j) => j.game_id === g.id)
    .flatMap((j) => j.services)
    .sort((a, b) => a.name.localeCompare(b.name, "id") || a.price - b.price);

  const gameIcon = g.icon ?? GAME_ICONS[g.slug] ?? null;
  const csHref = `https://wa.me/${g.cs_wa || process.env.NEXT_PUBLIC_WA_NUMBER}?text=${encodeURIComponent(
    `Halo ${g.cs_name ? `kak ${g.cs_name}` : "admin"}, saya mau tanya soal joki ${g.name}`
  )}`;
  const chip = "flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700";

  return (
    <div className="pb-10">
      <PageNav />

      {/* Kartu game */}
      <section className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <GameAvatar slug={g.slug} name={g.name} size={56} src={g.icon} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold leading-tight tracking-tight text-[#0d0c22] sm:text-3xl">{g.name}</h1>
            {g.badges.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {g.badges.map((b) => (
                  <span key={b} className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-extrabold text-white">{b}</span>
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
          <a
            href={csHref} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#0d0c22] px-4 py-2.5 text-sm font-bold text-white hover:bg-black"
          >
            <Icon name="chat" className="h-4 w-4" />Chat CS {g.cs_name ?? "Admin"}
          </a>
          <Terms />
        </div>
      </section>

      {/* Kategori */}
      {g.categories.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-[#0d0c22]">Kategori</h2>
          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {g.categories.map((c) => {
              const img = g.categoryImages[c];
              const box = "aspect-[4/3] w-36 shrink-0 rounded-2xl bg-gray-100 sm:w-44";
              const label = (
                <span className="absolute bottom-0 left-0 max-w-full truncate rounded-tr-xl bg-white px-2.5 py-1 text-[10px] font-bold">
                  {c}
                </span>
              );
              return img ? (
                <ZoomImage key={c} src={img} alt={c} sizes="176px" className={box}>{label}</ZoomImage>
              ) : (
                <div key={c} className={`relative ${box}`}>{label}</div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500">Ketuk gambar untuk memperbesar.</p>
        </section>
      )}

      {/* Daftar harga */}
      {g.is_soon && <p className="mt-8 rounded-2xl bg-gray-50 p-8 text-center text-gray-500">Game ini segera hadir. Pantau terus ya!</p>}
      {!g.is_soon && rows.length === 0 && <p className="mt-8 text-center text-gray-500">Belum ada layanan tersedia untuk game ini.</p>}

      {rows.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-[#0d0c22]">Daftar harga</h2>
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-200 bg-white">
            {rows.map((s) => (
              <ServiceRow key={s.id} s={s} game={g.name} gameSlug={g.slug} gameIcon={gameIcon} cs={g.cs_wa} csName={g.cs_name} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}