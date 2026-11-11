import Link from "next/link";
import { Icon } from "@/components/Icons";
import { signOut } from "@/app/actions/admin";
import { LinkSpinner } from "@/components/LinkPending";

const TABS = [
  ["home", "/admin", "Ringkasan", "grid"],
  ["games", "/admin/games", "Game & Harga", "list"],
  ["pricelist", "/admin/pricelist", "Pricelist", "coin"],
  ["banners", "/admin/banners", "Banner", "image"],
  ["testimoni", "/admin/testimoni", "Testimoni", "star"],
  ["terms", "/admin/terms", "S&K", "receipt"],
] as const;

const base = "group flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition";

export default function AdminShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl pb-16 pt-4">
      <div className="animate-fade-up mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <nav className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map(([k, href, label, icon]) => {
            const on = active === k;
            return (
              <Link key={k} href={href} aria-current={on ? "page" : undefined}
                className={`${base} ${on ? "bg-[#0d0c22] text-white shadow-md shadow-black/10" : "text-gray-600 hover:bg-gray-100 hover:text-[#0d0c22]"}`}>
                <LinkSpinner>
                  <Icon name={icon} className={`h-4 w-4 transition ${on ? "" : "group-hover:scale-110 group-hover:-rotate-6"}`} />
                </LinkSpinner>
                {label}
                {on && <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Link href="/" target="_blank" className={`${base} text-gray-600 hover:bg-gray-100 hover:text-[#0d0c22]`}>
            <Icon name="external" className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />Lihat situs
          </Link>
          <form action={signOut}>
            <button className={`${base} text-gray-600 hover:bg-red-50 hover:text-red-600`}>
              <Icon name="logout" className="h-4 w-4 transition group-hover:translate-x-0.5" />Keluar
            </button>
          </form>
        </div>
      </div>

      {children}
    </div>
  );
}