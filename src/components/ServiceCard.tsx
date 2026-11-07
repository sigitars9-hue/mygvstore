import Link from "next/link";
import { rp, type Service } from "@/lib/utils";
import AddToCart from "@/components/AddToCart";
import ServiceArt, { ART_BG } from "@/components/ServiceArt";
import { Icon } from "@/components/Icons";

export default function ServiceCard({ s, rating, count }: { s: Service; rating?: number; count?: number }) {
  return (
    <article className="group">
      <div className="relative">
        <Link
          href={`/layanan/${s.slug}`}
          className={`relative block aspect-[4/3] overflow-hidden rounded-2xl transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl ${ART_BG[s.slug] ?? "bg-gray-200"}`}
        >
          <ServiceArt slug={s.slug} className="h-full w-full p-6 transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <p className="font-bold text-white">{s.name}</p>
            <p className="text-xs text-white/80">{s.game}</p>
          </div>
        </Link>
        <div className="absolute right-3 top-3 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          <AddToCart s={s} compact />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
          {s.game.charAt(0)}
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">{s.name}</p>
        <p className="shrink-0 text-sm font-bold">{rp(s.price)}</p>
      </div>
      <p className="ml-[38px] mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
        <span>{s.game}</span>
        <span className="flex items-center gap-0.5">
          <Icon name="star" className="h-3.5 w-3.5 text-amber-500" />
          {rating ? `${rating.toFixed(1)} (${count})` : "Baru"}
        </span>
        <span className="flex items-center gap-0.5"><Icon name="clock" className="h-3.5 w-3.5" />{s.duration}</span>
      </p>
    </article>
  );
}