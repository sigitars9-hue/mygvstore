import Link from "next/link";
import { Icon } from "@/components/Icons";
import { signOut } from "@/app/actions/admin";

const TABS = [
  ["home", "/admin", "Ringkasan", "grid"],
  ["games", "/admin/games", "Game & Harga", "list"],
  ["pricelist", "/admin/pricelist", "Pricelist", "coin"],
  ["banners", "/admin/banners", "Banner", "image"],
  ["testimoni", "/admin/testimoni", "Testimoni", "star"],
  ["terms", "/admin/terms", "S&K", "receipt"],
] as const;

export default function AdminShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl pb-16 pt-4">
      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        {TABS.map(([k, href, label, icon]) => (
          <Link key={k} href={href}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${active === k ? "bg-gray-100 text-[#0d0c22]" : "text-gray-600 hover:bg-gray-50"}`}>
            <Icon name={icon} className="h-4 w-4" />{label}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <Icon name="external" className="h-4 w-4" />Lihat situs
          </Link>
          <form action={signOut}>
            <button className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <Icon name="logout" className="h-4 w-4" />Keluar
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}