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
  const it = "flex items-center gap-2";
  const ic = "h-4 w-4 shrink-0 lg:h-5 lg:w-5";

  const info = (
    <>
      <span className={it}><Icon name="coin" className={ic} />{g.minPrice !== null ? `Mulai ${rp(g.minPrice)}/paket` : "Harga segera diumumkan"}</span>
      <span className={it}><Icon name="clock" className={ic} />Respon sekitar {respText(g.response)}</span>
      <span className={it}><Icon name="list" className={ic} />{g.jokiCount} joki tersedia</span>
    </>
  );

  const cta = (cls: string) =>
    g.is_soon ? (
      <span className={`rounded-full bg-gray-200 text-center font-bold text-gray-500 ${cls}`}>Segera hadir</span>
    ) : (
      <Link href={`/game/${g.slug}`} className={`rounded-full bg-[#0d0c22] text-center font-bold text-white hover:bg-black ${cls}`}>
        Lihat Joki
      </Link>
    );

  const thumb = (c: string, k: number, cls: string) => {
    const key = KEYS[(i + k) % KEYS.length];
    return (
      <div key={c} className={`relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[16/10] lg:rounded-3xl ${bgOf(key)} ${cls}`}>
        <ServiceArt k={key} className="h-full w-full p-2.5 pb-7 lg:p-4 lg:pb-10" />
        <span className="absolute bottom-0 left-0 max-w-full truncate rounded-tr-xl bg-white px-2.5 py-1 text-[10px] font-bold lg:rounded-tr-3xl lg:px-4 lg:py-2 lg:text-xs">
          {c}
        </span>
      </div>
    );
  };

  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-4 transition duration-300 hover:shadow-xl lg:p-5">
      <div className="lg:flex lg:items-center lg:gap-4">
        <div className="flex items-center gap-3 lg:min-w-0 lg:flex-1 lg:gap-4">
          <div className="relative h-12 w-12 shrink-0 lg:hidden">
  <GameAvatar slug={g.slug} name={g.name} size={48} />
</div>
<div className="relative hidden h-16 w-16 shrink-0 lg:block">
  <GameAvatar slug={g.slug} name={g.name} size={64} />
</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
                <Link href={`/game/${g.slug}`} className="text-base font-bold tracking-tight text-[#0d0c22] hover:text-pink-600 lg:text-xl">
                  {g.name}
                </Link>
                {g.badges.map((b, k) => (
                  <span key={b} className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white lg:rounded-lg lg:px-2.5 lg:py-1 lg:text-xs ${k === 0 ? "bg-gray-600" : "bg-gradient-to-b from-slate-600 to-slate-900"}`}>{b}</span>
                ))}
                {g.is_soon && <span className="rounded-md bg-pink-500 px-2 py-0.5 text-[10px] font-extrabold text-white lg:rounded-lg lg:px-2.5 lg:py-1 lg:text-xs">SEGERA</span>}
              </div>
              <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold lg:w-auto lg:gap-x-4 lg:text-sm">
                <span className="flex items-center gap-1">
                  <Icon name="star" className="h-3.5 w-3.5 lg:h-4 lg:w-4" />{g.rating ? g.rating.toFixed(1) : "Baru"}
                  {g.reviews > 0 && <span className="font-normal text-gray-400">({g.reviews})</span>}
                </span>
                <span className="flex items-center gap-1"><Icon name="check" className="h-3.5 w-3.5 lg:h-4 lg:w-4" />{g.projects.toLocaleString("id-ID")} proyek</span>
                {g.promoted && <span className="font-semibold text-gray-400">Dipromosikan</span>}
              </div>
            </div>
            <div className="mt-2 hidden flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600 lg:flex">{info}</div>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <SaveButton id={g.slug} className="h-11 w-11" />
          {cta("px-6 py-3 text-sm")}
        </div>
      </div>

      <div className="lg:hidden">
        <hr className="my-3 border-gray-100" />
        <div className="grid gap-y-2 text-sm text-gray-600">{info}</div>
      </div>

      <div className="flex flex-col">
        {cats.length > 0 && (
          <div className="order-1 mt-3 flex flex-wrap items-center gap-2 lg:order-2 lg:mt-4 lg:gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-[#3a3a4d] px-3 py-1.5 text-xs font-bold text-white lg:gap-2 lg:px-4 lg:py-2.5 lg:text-sm">
              <Icon name="sparkle" className="h-3.5 w-3.5 lg:h-4 lg:w-4" />{cats[0]}
            </span>
            {cats.slice(1).map((c, k) => (
              <span key={c} className={`rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-700 lg:px-4 lg:py-2.5 lg:text-sm ${k > 0 ? "hidden lg:inline-block" : ""}`}>{c}</span>
            ))}
            {cats.length > 2 && (
              <Link href={`/game/${g.slug}`} className="text-xs text-gray-500 underline lg:hidden">+{cats.length - 2} layanan</Link>
            )}
          </div>
        )}

        {cats.length > 0 ? (
          <>
            <div className="order-2 lg:hidden">
              <Carousel>{cats.map((c, k) => thumb(c, k, "w-36 shrink-0 snap-start"))}</Carousel>
            </div>
            <div className="order-2 mt-4 hidden gap-4 lg:order-1 lg:grid lg:grid-cols-4">
              {cats.map((c, k) => thumb(c, k, ""))}
            </div>
          </>
        ) : (
          <div className="order-2 mt-3 flex aspect-[16/6] items-center justify-center rounded-2xl bg-gray-100 text-xs font-semibold text-gray-400 lg:mt-4 lg:aspect-[16/3] lg:rounded-3xl lg:text-sm">
            Layanan segera hadir
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 lg:hidden">
        {cta("flex-1 py-3 text-base")}
        <SaveButton id={g.slug} className="h-12 w-12" />
      </div>
    </article>
  );
}