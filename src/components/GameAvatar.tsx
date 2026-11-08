import Image from "next/image";
import { GAME_ICONS } from "@/lib/game-icons";

export default function GameAvatar({
  slug, name, size = 64, src: custom,
}: { slug: string; name: string; size?: number; src?: string | null }) {
  const src = custom || GAME_ICONS[slug];
  const box = "relative shrink-0 overflow-hidden rounded-full bg-[#0d0c22]";
  if (!src) {
    return (
      <span
        className={`${box} flex items-center justify-center font-black text-white`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name.charAt(0)}
      </span>
    );
  }
  return (
    <span className={`${box} block`} style={{ width: size, height: size }}>
      <Image src={src} alt={`Ikon ${name}`} fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}