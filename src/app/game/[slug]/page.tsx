import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { loadCatalog } from "@/lib/catalog";
import { rp } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import OrderButton from "@/components/OrderButton";
import Terms from "@/components/Terms";
import GameAvatar from "@/components/GameAvatar";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { games, jokis } = await loadCatalog();
  const g = games.find((x) => x.slug === slug);
  if (!g) notFound();

  // Semua layanan di game ini, urut abjad (nama layanan, lalu harga)
  const rows = jokis
    .filter((j) => j.game_id === g.id)
    .flatMap((j) => j.services.map((s) => ({ s, j })))
    .sort((a, b) => a.s.name.localeCompare(b.s.name, "id") || a.s.price - b.s.price);
  const chip = "flex items-center gap-1.5";

  return (
    <>
      <Link href="/" className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-black">
        <Icon name="back" className="h-4 w-4" />Semua game
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <GameAvatar slug={g.slug} name={g.name} size={56} src={g.icon} />
        <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">{g.name}</h1>
        {g.badges.map((b) => (
          <span key={b} className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-extrabold text-white">{b}</span>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
        <span className={chip}>
          <Icon name="star" className="h-4 w-4 text-amber-500" />
          {g.rating ? g.rating.toFixed(1) : "Baru"}{g.reviews > 0 && ` (${g.reviews})`}
        </span>
        <span className={chip}><Icon name="check" className="h-4 w-4" />{g.projects.toLocaleString("id-ID")} proyek</span>
        <span className={chip}><Icon name="list" className="h-4 w-4" />{rows.length} layanan</span>
        <span className={chip}><Icon name="chat" className="h-4 w-4" />CS {g.cs_name ?? "Admin"}</span>
      </div>

      <div className="mt-4"><Terms /></div>

      {g.categories.length > 0 && (
        <div className="mt-6 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {g.categories.map((c) => {
            const img = g.categoryImages[c];
            return (
              <div key={c} className="relative aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:w-44">
                {img && <Image src={img} alt={c} fill sizes="176px" className="object-cover" />}
                <span className="absolute bottom-0 left-0 max-w-full truncate rounded-tr-xl bg-white px-2.5 py-1 text-[10px] font-bold">{c}</span>
              </div>
            );
          })}
        </div>
      )}

      {g.is_soon && <p className="mt-10 rounded-2xl bg-gray-50 p-8 text-center text-gray-500">Game ini segera hadir. Pantau terus ya!</p>}
      {!g.is_soon && rows.length === 0 && <p className="mt-10 text-center text-gray-500">Belum ada layanan tersedia untuk game ini.</p>}

      {rows.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-xl font-bold">Layanan tersedia</h2>
          <ul className="divide-y divide-gray-100 rounded-3xl border border-gray-200 bg-white">
            {rows.map(({ s }) => (
              <li key={s.id} className="flex items-center gap-3 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <Link href={`/layanan/${s.slug}`} className="block font-semibold hover:underline">{s.name}</Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    <span>CS <b className="text-gray-800">{g.cs_name ?? "Admin"}</b></span>
                    <span>Estimasi {s.duration} · {s.unit}</span>
                  </p>
                </div>
                <b className="shrink-0">{rp(s.price)}</b>
                <OrderButton s={s} game={g.name} cs={g.cs_wa} csName={g.cs_name} compact />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}