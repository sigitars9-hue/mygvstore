import Link from "next/link";
import { Icon, type IconName } from "@/components/Icons";
import { signOut } from "@/app/actions/admin";
import { LinkSpinner } from "@/components/LinkPending";

const TABS: readonly (readonly [string, string, string, IconName])[] = [
  ["home", "/admin", "Ringkasan", "grid"],
  ["games", "/admin/games", "Game & Harga", "list"],
  ["pricelist", "/admin/pricelist", "Pricelist", "coin"],
  ["banners", "/admin/banners", "Banner", "image"],
  ["testimoni", "/admin/testimoni", "Testimoni", "star"],
  ["terms", "/admin/terms", "S&K", "receipt"],
];

const item = (on: boolean) =>
  `flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
    on ? "bg-gray-100 font-semibold text-[#0d0c22]" : "font-medium text-gray-600 hover:bg-gray-50 hover:text-[#0d0c22]"
  }`;

export default function AdminShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl pb-16 pt-4 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
      <aside className="border-b border-gray-200 pb-3 lg:sticky lg:top-4 lg:self-start lg:border-0 lg:pb-0">
        <p className="mb-2 hidden px-3 text-xs font-semibold text-gray-400 lg:block">Admin</p>

        <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
          {TABS.map(([k, href, label, icon]) => (
            <Link key={k} href={href} aria-current={active === k ? "page" : undefined} className={item(active === k)}>
              <LinkSpinner><Icon name={icon} className="h-4 w-4" /></LinkSpinner>
              {label}
            </Link>
          ))}

          {/* Mobile: aksi ikut di baris yang sama */}
          <Link href="/" target="_blank" className={`${item(false)} lg:hidden`}>
            <Icon name="external" className="h-4 w-4" />Situs
          </Link>
          <form action={signOut} className="lg:hidden">
            <button className={`${item(false)} hover:!bg-red-50 hover:!text-red-600`}>
              <Icon name="logout" className="h-4 w-4" />Keluar
            </button>
          </form>
        </nav>

        {/* Desktop: aksi di bawah menu */}
        <div className="mt-4 hidden flex-col gap-1 border-t border-gray-200 pt-4 lg:flex">
          <Link href="/" target="_blank" className={item(false)}>
            <Icon name="external" className="h-4 w-4" />Lihat situs
          </Link>
          <form action={signOut}>
            <button className={`${item(false)} w-full hover:!bg-red-50 hover:!text-red-600`}>
              <Icon name="logout" className="h-4 w-4" />Keluar
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 pt-4 lg:pt-0">{children}</div>
    </div>
  );
}