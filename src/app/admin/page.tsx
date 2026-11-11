import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { Icon, type IconName } from "@/components/Icons";
import AdminShell from "@/components/admin/AdminShell";
import { PageHeader, StatCard, stagger } from "@/components/admin/AdminKit";
import { card } from "@/components/admin/ui";

export default async function AdminHome() {
  await requireAdmin();
  const head = { count: "exact", head: true } as const;
  const [g, s, j, b, t] = await Promise.all([
    db.from("games").select("*", head),
    db.from("services").select("*", head).eq("is_active", true),
    db.from("jokis").select("*", head).eq("is_active", true),
    db.from("banners").select("*", head).eq("is_active", true),
    db.from("testimonials").select("*", head).eq("is_active", true),
  ]);
  const r2ok = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET && process.env.R2_PUBLIC_URL);

  const menu: { href: string; icon: IconName; title: string; desc: string }[] = [
    { href: "/admin/games", icon: "list", title: "Game & Harga", desc: "Ubah ikon, kategori, joki, PIC/CS, dan daftar harga." },
    { href: "/admin/pricelist", icon: "coin", title: "Pricelist", desc: "Atur harga, gambar, dan pilihan tiap layanan." },
    { href: "/admin/banners", icon: "image", title: "Banner", desc: "Tambah, urutkan, atau ganti banner di halaman utama." },
    { href: "/admin/testimoni", icon: "star", title: "Testimoni", desc: "Kelola komentar pelanggan di halaman testimoni." },
    { href: "/admin/terms", icon: "receipt", title: "Syarat & Ketentuan", desc: "Ubah poin S&K yang tampil di situs." },
  ];

  return (
    <AdminShell active="home">
      <PageHeader title="Dashboard" desc="Kelola isi situs tanpa menyentuh kode.">
        <Link href="/" target="_blank"
          className="group flex items-center gap-2 rounded-full bg-[#0d0c22] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-pink-500 hover:shadow-lg hover:shadow-pink-500/30">
          Lihat situs
          <Icon name="external" className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </PageHeader>

      {!r2ok && (
        <div className="animate-fade-up mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
          <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
          Variabel R2 di .env belum lengkap, jadi upload gambar belum bisa dipakai.
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard i={0} href="/admin/games" icon="list" tone="pink" value={g.count ?? 0} label="Game" />
        <StatCard i={1} href="/admin/pricelist" icon="coin" tone="violet" value={s.count ?? 0} label="Layanan aktif" />
        <StatCard i={2} href="/admin/games" icon="chat" tone="emerald" value={j.count ?? 0} label="Joki aktif" />
        <StatCard i={3} href="/admin/banners" icon="image" tone="amber" value={b.count ?? 0} label="Banner aktif" />
      </div>

      <h2 className="animate-fade-up mt-8 text-lg font-bold text-[#0d0c22]" style={stagger(4)}>Menu</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {menu.map((c, i) => (
          <Link key={c.href} href={c.href} style={stagger(i + 5)}
            className={`${card} group animate-fade-up flex items-start gap-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 transition group-hover:bg-[#0d0c22] group-hover:text-white">
              <Icon name={c.icon} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-lg text-[#0d0c22]">{c.title}</b>
              <span className="text-sm text-gray-600">{c.desc}</span>
              {c.href === "/admin/testimoni" && <span className="mt-1 block text-xs font-semibold text-pink-600">{t.count ?? 0} tampil</span>}
            </span>
            <Icon name="right" className="mt-1 h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#0d0c22]" />
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}