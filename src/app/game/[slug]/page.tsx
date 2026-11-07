import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCatalog } from "@/lib/catalog";
import { rp } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import AddToCart from "@/components/AddToCart";
import TermsButton from "@/components/TermsButton";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { games, jokis } = await loadCatalog();
  const g = games.find((x) => x.slug === slug);
  if (!g) notFound();

  // Semua layanan di game ini, urut abjad (nama layanan, lalu nama joki)
  const rows = jokis
    .filter((j) => j.game_id === g.id)
    .flatMap((j) => j.services.map((s) => ({ s, j })))
    .sort((a, b) => a.s.name.localeCompare(b.s.name, "id") || a.j.name.localeCompare(b.j.name, "id"));
  const chip = "flex items-center gap-1.5";

  return (
    <>
      <Link href="/" className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-black">
        <Icon name="back" className="h-4 w-4" />Semua game
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">{g.name}</h1>
        {g.badges.map((b) => (
          <span key={b} className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-extrabold text-white">{b}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
        <span className={chip}><Icon name="star" className="h-4 w-4 text-amber-500" />{g.rating ? g.rating.toFixed(1) : "Baru"}{g.reviews > 0 && ` (${g.reviews})`}</span>
        <span className={chip}><Icon name="check" className="h-4 w-4" />{g.projects.toLocaleString("id-ID")} proyek</span>
        <span className={chip}><Icon name="list" className="h-4 w-4" />{g.jokiCount} joki · {rows.length} layanan</span>
      </div>
      <div className="mt-4"><TermsButton /></div>

      {g.is_soon && <p className="mt-10 rounded-2xl bg-gray-50 p-8 text-center text-gray-500">Game ini segera hadir. Pantau terus ya!</p>}
      {!g.is_soon && rows.length === 0 && <p className="mt-10 text-center text-gray-500">Belum ada layanan tersedia untuk game ini.</p>}

      {rows.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-xl font-bold">Layanan tersedia</h2>
          <ul className="divide-y divide-gray-100 rounded-3xl border border-gray-200 bg-white">
            {rows.map(({ s, j }) => (
              <li key={s.id} className="flex items-center gap-3 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <Link href={`/layanan/${s.slug}`} className="block font-semibold hover:underline">{s.name}</Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    <span>Joki <b className="text-gray-800">{j.name}</b></span>
                    {j.badge && <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-extrabold text-white">{j.badge}</span>}
                    <span>Estimasi {s.duration} · {s.unit}</span>
                  </p>
                </div>
                <b className="shrink-0">{rp(s.price)}</b>
                <AddToCart s={s} compact />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}