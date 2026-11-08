import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { Icon, type IconName } from "@/components/Icons";
import AdminShell from "@/components/admin/AdminShell";
import { card } from "@/components/admin/ui";

export default async function AdminHome() {
  await requireAdmin();
  const [g, s, b] = await Promise.all([
    db.from("games").select("*", { count: "exact", head: true }),
    db.from("services").select("*", { count: "exact", head: true }).eq("is_active", true),
    db.from("banners").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);
  const r2ok = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET && process.env.R2_PUBLIC_URL);

  const cards: { href: string; icon: IconName; title: string; desc: string }[] = [
    { href: "/admin/games", icon: "list", title: `${g.count ?? 0} game · ${s.count ?? 0} layanan aktif`, desc: "Ubah ikon, gambar kategori, joki, deskripsi, dan daftar harga." },
    { href: "/admin/banners", icon: "image", title: `${b.count ?? 0} banner aktif`, desc: "Tambah, urutkan, atau ganti banner di halaman utama." },
    { href: "/admin/testimoni", icon: "star", title: "Testimoni", desc: "Kelola komentar pelanggan di halaman testimoni." },
    { href: "/admin/terms", icon: "receipt", title: "Syarat & Ketentuan", desc: "Ubah poin S&K yang tampil di situs." },
  ];

  return (
    <AdminShell active="home">
      <h1 className="text-3xl font-bold tracking-tight text-[#0d0c22]">Dashboard</h1>
      <p className="mt-2 text-gray-600">Kelola isi situs tanpa menyentuh kode.</p>

      {!r2ok && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
          <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
          Variabel R2 di .env belum lengkap, jadi upload gambar belum bisa dipakai.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className={`${card} transition hover:shadow-xl`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100"><Icon name={c.icon} /></span>
            <h2 className="mt-4 text-lg font-bold text-[#0d0c22]">{c.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{c.desc}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}