import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCatalog, respText } from "@/lib/catalog";
import { rp } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import AddToCart from "@/components/AddToCart";
import Reveal from "@/components/Reveal";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { games, jokis } = await loadCatalog();
  const g = games.find((x) => x.slug === slug);
  if (!g) notFound();

  const list = jokis
    .filter((j) => j.game_id === g.id)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.projects_done - a.projects_done);
  const chip = "flex items-center gap-1.5";

  return (
    <>
      <Link href="/" className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-black">
        <Icon name="back" className="h-4 w-4" />Semua game
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">{g.name}</h1>
        {g.badges.map((b) => <span key={b} className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-extrabold text-white">{b}</span>)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
        <span className={chip}><Icon name="star" className="h-4 w-4 text-amber-500" />{g.rating ? g.rating.toFixed(1) : "Baru"} {g.reviews > 0 && `(${g.reviews})`}</span>
        <span className={chip}><Icon name="check" className="h-4 w-4" />{g.projects.toLocaleString("id-ID")} proyek</span>
        <span className={chip}><Icon name="list" className="h-4 w-4" />{list.length} joki tersedia</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {g.categories.map((c) => <span key={c} className="rounded-full bg-gray-100 px-3.5 py-1.5 text-sm">{c}</span>)}
      </div>

      {g.is_soon && <p className="mt-10 rounded-2xl bg-gray-50 p-8 text-center text-gray-500">Game ini segera hadir. Pantau terus ya!</p>}
      {!g.is_soon && list.length === 0 && <p className="mt-10 text-center text-gray-500">Belum ada joki tersedia untuk game ini.</p>}

      <h2 className="mb-4 mt-8 text-xl font-bold">{list.length > 0 && "Joki yang tersedia"}</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        {list.map((j, i) => (
          <Reveal key={j.id} delay={(i % 2) * 0.08}>
            <article className="h-full rounded-3xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0d0c22] text-xl font-black text-white">{j.name.charAt(0)}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-extrabold">{j.name}</h3>
                    {j.badge && <span className="rounded-lg bg-gradient-to-b from-slate-600 to-slate-900 px-2 py-0.5 text-xs font-extrabold text-white">{j.badge}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span className={chip}><Icon name="star" className="h-4 w-4 text-amber-500" />{j.rating ? j.rating.toFixed(1) : "Baru"}{j.reviews > 0 && ` (${j.reviews})`}</span>
                    <span className={chip}><Icon name="check" className="h-4 w-4" />{j.projects_done} proyek</span>
                    <span className={chip}><Icon name="clock" className="h-4 w-4" />Respon {respText(j.response_minutes)}</span>
                  </div>
                </div>
              </div>
              {j.bio && <p className="mt-3 text-sm text-gray-600">{j.bio}</p>}
              <div className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-100">
                {j.services.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/layanan/${s.slug}`} className="block truncate font-semibold hover:underline">{s.name}</Link>
                      <p className="text-xs text-gray-500">Estimasi {s.duration} · {s.unit}</p>
                    </div>
                    <b className="shrink-0 text-sm">{rp(s.price)}</b>
                    <AddToCart s={s} compact />
                  </div>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </>
  );
}