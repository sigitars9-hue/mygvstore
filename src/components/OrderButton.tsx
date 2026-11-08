import { rp, type Service } from "@/lib/utils";
import { Icon } from "@/components/Icons";

const DEFAULT_WA = process.env.NEXT_PUBLIC_WA_NUMBER;

export default function OrderButton({
  s, game, cs, csName, compact,
}: { s: Service; game: string; cs?: string | null; csName?: string | null; compact?: boolean }) {
  const text = [
    csName ? `Halo kak ${csName}, saya mau pesan:` : "Halo admin, saya mau pesan:",
    "",
    `Game: ${game}`,
    `Layanan: ${s.name}`,
    `Harga: ${rp(s.price)} ${s.unit}`,
    "",
    "Nama:",
    "ID / Server akun:",
    "Jadwal mulai:",
  ].join("\n");

  return (
    <a
      href={`https://wa.me/${cs || DEFAULT_WA}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noreferrer"
      className={
        compact
          ? "flex shrink-0 items-center gap-1.5 rounded-full bg-[#0d0c22] px-3.5 py-2 text-xs font-bold text-white hover:bg-black"
          : "flex items-center justify-center gap-2 rounded-full bg-[#0d0c22] py-4 text-base font-bold text-white hover:bg-black"
      }
    >
      <Icon name="chat" className="h-4 w-4" />Pesan
    </a>
  );
}