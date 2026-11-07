import Link from "next/link";
import { respText, type GameView } from "@/lib/catalog";
import { rp } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import ServiceArt, { KEYS, bgOf } from "@/components/ServiceArt";
import Carousel from "@/components/Carousel";
import SaveButton from "@/components/SaveButton";
import GameAvatar from "@/components/GameAvatar";

export default function GameCard({ g, i }: { g: GameView; i: number }) {
  const cats = g.categories;
  const info = "flex items-center gap-2";
  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-6 transition duration-300 hover:shadow-xl">
      <div className="flex items-center gap-4">
        <GameAvatar slug={g.slug} name={g.name} size={64} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/game/${g.slug}`} className="text-xl font-bold tracking-tight text-[#0d0c22] hover:text-pink-600 sm:text-2xl">
              {g.name}
            </Link>
            {g.badges.map((b, k) => (
              <span key={b} className={`rounded-lg px-2.5 py-1 text-xs font-extrabold text-white ${k === 0 ? "bg-gray-600" : "bg-gradient-to-b from-slate-600 to-slate-900"}`}>{b}</span>
            ))}
            {g.is_soon && <span className="rounded-lg bg-pink-500 px-2.5 py-1 text-xs font-extrabold text-white">SEGERA</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
            <span className={`${info} gap-1`}>
              <Icon name="star" className="h-4 w-4" />{g.rating ? g.rating.toFixed(1) : "Baru"}
              {g.reviews > 0 && <span className="font-normal text-gray-400">({g.reviews})</span>}
            </span>
            <span className={`${info} gap-1`}><Icon name="check" className="h-4 w-4" />{g.projects.toLocaleString("id-ID")} Testimoni</span>
            {g.promoted && <span className="font-semibold text-gray-400">Dipromosikan</span>}
          </div>
        </div>
      </div>

      <hr className="my-4 border-gray-100" />
      <div className="grid gap-x-6 gap-y-2.5 text-[15px] text-gray-600 sm:grid-cols-2">
        <span className={info}><Icon name="coin" className="h-5 w-5 shrink-0" />{g.minPrice !== null ? `Mulai ${rp(g.minPrice)}/paket` : "Harga segera diumumkan"}</span>
        <span className={info}><Icon name="clock" className="h-5 w-5 shrink-0" />Respon sekitar {respText(g.response)}</span>
        <span className={info}><Icon name="list" className="h-5 w-5 shrink-0" />{g.jokiCount} joki tersedia</span>
      </div>

      {cats.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-[#3a3a4d] px-4 py-2.5 text-sm font-bold text-white">
            <Icon name="sparkle" className="h-4 w-4" />{cats[0]}
          </span>
          {cats[1] && <span className="rounded-full bg-gray-100 px-4 py-2.5 text-sm text-gray-700">{cats[1]}</span>}
          {cats.length > 2 && <Link href={`/game/${g.slug}`} className="text-sm text-gray-500 underline">+{cats.length - 2} layanan</Link>}
        </div>
      )}

      {cats.length > 0 ? (
        <Carousel>
          {cats.map((c, k) => {
            const key = KEYS[(i + k) % KEYS.length];
            return (
              <div key={c} className={`relative aspect-[4/3] w-[62%] shrink-0 snap-start overflow-hidden rounded-3xl sm:w-[46%] ${bgOf(key)}`}>
                <ServiceArt k={key} className="h-full w-full p-5 pb-12" />
                <span className="absolute bottom-0 left-0 rounded-tr-3xl bg-white px-5 py-2.5 text-sm font-extrabold uppercase">{c}</span>
              </div>
            );
          })}
        </Carousel>
      ) : (
        <div className="mt-5 flex aspect-[16/6] items-center justify-center rounded-3xl bg-gray-100 text-sm font-semibold text-gray-400">
          Layanan segera hadir
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        {g.is_soon ? (
          <span className="flex-1 rounded-full bg-gray-200 py-4 text-center text-lg font-bold text-gray-500">Segera hadir</span>
        ) : (
          <Link href={`/game/${g.slug}`} className="flex-1 rounded-full bg-[#0d0c22] py-4 text-center text-lg font-bold text-white hover:bg-black">
            Lihat Joki
          </Link>
        )}
        <SaveButton id={g.slug} />
      </div>
    </article>
  );
}