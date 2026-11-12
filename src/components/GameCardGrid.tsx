import Link from "next/link";
import Image from "next/image";
import { respText, type GameView } from "@/lib/catalog";
import { rp, badgeTone } from "@/lib/utils";
import { Icon } from "@/components/Icons";
import ServiceArt, { KEYS, bgOf } from "@/components/ServiceArt";
import SaveButton from "@/components/SaveButton";
import GameAvatar from "@/components/GameAvatar";
import { LinkSpinner } from "@/components/LinkPending";

export default function GameCardGrid({ g, i }: { g: GameView; i: number }) {
  const key = KEYS[i % KEYS.length];
  const cover = g.categories.map((c) => g.categoryImages[c]).find(Boolean);
  const pic = g.cs_name || "Admin";

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl"
      style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
    >
      {/* Cover */}
      <div className={`relative aspect-[16/10] overflow-hidden ${cover ? "bg-gray-100" : bgOf(key)}`}>
        {cover ? (
          <Image
            src={cover}
            alt={g.name}
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <ServiceArt k={key} className="h-full w-full p-4 transition duration-500 group-hover:scale-105" />
        )}

        {g.maxDiscount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-gradient-to-b from-red-500 to-red-700 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm shadow-red-500/30">
            -{g.maxDiscount}%
          </span>
        )}
        {g.is_soon && (
          <span className="absolute left-2 top-2 rounded-md bg-pink-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
            SEGERA
          </span>
        )}

        <SaveButton id={g.slug} className="absolute right-2 top-2 z-10 h-9 w-9 bg-white/90" />
      </div>

      {/* Avatar menimpa cover */}
      <div className="relative px-3 sm:px-4">
        <span className="absolute -top-6 left-3 rounded-2xl border-2 border-white bg-white shadow-sm transition duration-300 group-hover:scale-105 sm:left-4">
          <GameAvatar slug={g.slug} name={g.name} size={48} src={g.icon} />
        </span>
      </div>

      {/* Isi */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-8 sm:px-4 sm:pb-4">
        <Link
          href={`/game/${g.slug}`}
          className="line-clamp-2 text-sm font-bold leading-snug tracking-tight text-[#0d0c22] transition-colors after:absolute after:inset-0 after:content-[''] hover:text-pink-600 sm:text-base"
        >
          {g.name}
        </Link>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
          <span className="flex items-center gap-1">
            <Icon name="star" className="h-3.5 w-3.5 text-amber-500" />
            {g.rating ? g.rating.toFixed(1) : "Baru"}
            {g.reviews > 0 && <span className="font-normal text-gray-400">({g.reviews})</span>}
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <Icon name="check" className="h-3.5 w-3.5" />
            {g.projects.toLocaleString("id-ID")}
          </span>
        </div>

        {g.badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {g.badges.slice(0, 2).map((b) => (
              <span key={b} className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white ${badgeTone(b)}`}>
                {b}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 space-y-1 text-xs text-gray-600">
          <p className="flex items-center gap-1.5">
            <Icon name="coin" className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-colors group-hover:text-pink-500" />
            <span className="truncate">{g.minPrice !== null ? `Mulai ${rp(g.minPrice)}` : "Segera diumumkan"}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Icon name="clock" className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-colors group-hover:text-pink-500" />
            <span className="truncate">Respon {respText(g.response)}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Icon name="chat" className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-colors group-hover:text-pink-500" />
            <span className="truncate">
              CS: <b className="font-semibold text-[#0d0c22]">{pic}</b>
            </span>
          </p>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-3">
          {g.is_soon ? (
            <span className="block rounded-full bg-gray-200 py-2.5 text-center text-sm font-bold text-gray-500">
              Segera hadir
            </span>
          ) : (
            <span className="group/cta flex items-center justify-center gap-1.5 rounded-full bg-[#0d0c22] py-2.5 text-center text-sm font-bold text-white transition group-hover:bg-pink-500 group-hover:shadow-lg group-hover:shadow-pink-500/30">
              Lihat Joki
              <LinkSpinner>
                <Icon name="right" className="h-4 w-4 transition group-hover:translate-x-1" />
              </LinkSpinner>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}