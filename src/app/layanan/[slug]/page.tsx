import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rp, type Service } from "@/lib/utils";
import AddToCart from "@/components/AddToCart";
import ReviewForm from "@/components/ReviewForm";
import ServiceCard from "@/components/ServiceCard";
import ServiceArt, { ART_BG } from "@/components/ServiceArt";
import { Icon } from "@/components/Icons";


const STEPS = [
  ["1", "Booking", "Isi data dan akun game"],
  ["2", "Bayar", "Transfer, lalu upload bukti"],
  ["3", "Dikerjakan", "Pantau progres langsung"],
  ["4", "Selesai", "Cek hasil dan beri ulasan"],
];

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await createClient();
  const { data: rows } = await sb.from("services").select("*").eq("is_active", true).order("created_at");
  const all = (rows ?? []) as Service[];
  const idx = all.findIndex((x) => x.slug === slug);
  if (idx < 0) notFound();
  const s = all[idx];

  const { data: rv } = await sb
    .from("reviews").select("name,rating,comment,created_at")
    .eq("service_id", s.id).order("created_at", { ascending: false });
  const reviews = rv ?? [];
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const more = all
    .filter((x) => x.id !== s.id)
    .sort((a, b) => Number(b.game === s.game) - Number(a.game === s.game))
    .slice(0, 3);

  return (
    <>
      <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-black">← Semua layanan</Link>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{s.name}</h1>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold">{s.game}</span>
        {avg > 0 && <span><span className="text-amber-500">★</span> {avg.toFixed(1)} ({reviews.length} ulasan)</span>}
        <span className="flex items-center gap-1"><Icon name="clock" className="h-4 w-4" />Estimasi {s.duration}</span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
                    <div className={`aspect-video overflow-hidden rounded-3xl ${ART_BG[s.slug] ?? "bg-gray-200"}`}>
            <ServiceArt slug={s.slug} className="h-full w-full p-10 sm:p-14" />
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-bold">Tentang layanan</h2>
            <p className="mt-2 leading-relaxed text-gray-600">{s.description}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">Yang kamu dapat</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {s.includes.map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3.5 text-sm font-medium">
                 <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white"><Icon name="check" className="h-3.5 w-3.5" /></span>
                  {i}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">Cara kerja</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STEPS.map(([n, t, d]) => (
                <div key={n} className="rounded-2xl border border-gray-200 p-4">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">{n}</div>
                  <b className="text-sm">{t}</b>
                  <p className="text-xs text-gray-500">{d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-bold">Ulasan pelanggan</h2>
              {avg > 0 && <p className="text-sm text-gray-500"><b className="text-2xl text-black">{avg.toFixed(1)}</b> / 5</p>}
            </div>
            {reviews.length === 0 && <p className="mt-3 text-sm text-gray-500">Belum ada ulasan. Jadilah yang pertama setelah pesananmu selesai.</p>}
            <div className="mt-3 grid gap-3">
              {reviews.map((r, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-amber-500">{"★".repeat(r.rating)}<span className="text-gray-300">{"★".repeat(5 - r.rating)}</span></p>
                    </div>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
            <ReviewForm serviceId={s.id} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-gray-200 p-6 shadow-sm">
            <p className="text-3xl font-extrabold">{rp(s.price)}</p>
            <p className="mb-4 text-sm text-gray-500">{s.unit}</p>
            <AddToCart s={s} />
            <ul className="mt-5 space-y-2 border-t pt-4 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Icon name="shield" className="h-4 w-4 shrink-0" />Akun dikerjakan manual, tanpa cheat</li>
              <li className="flex items-center gap-2"><Icon name="chart" className="h-4 w-4 shrink-0" />Progres dipantau lewat kode pesanan</li>
              <li className="flex items-center gap-2"><Icon name="receipt" className="h-4 w-4 shrink-0" />Pembayaran manual, dikonfirmasi admin</li>
            </ul>
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-xl font-bold">Layanan lainnya</h2>
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((m) => <ServiceCard key={m.id} s={m} />)}
          </div>
        </section>
      )}
    </>
  );
}