import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rp, type Service } from "@/lib/utils";
import AddToCart from "@/components/AddToCart";
import ReviewForm from "@/components/ReviewForm";

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await createClient();
  const { data } = await sb.from("services").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!data) notFound();
  const s = data as Service;
  const { data: rv } = await sb.from("reviews").select("name,rating,comment").eq("service_id", s.id).order("created_at", { ascending: false });
  const avg = rv?.length ? (rv.reduce((a, r) => a + r.rating, 0) / rv.length).toFixed(1) : null;

  return (
    <>
      <Link href="/" className="text-sm text-gray-500">← Kembali</Link>
      <div className="mt-3 grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border bg-white p-5">
          <div className="text-5xl">{s.emoji}</div>
          <h1 className="text-2xl font-extrabold">{s.name}</h1>
          <p className="text-sm text-gray-500">{s.game} · Estimasi {s.duration}{avg && ` · ★ ${avg} (${rv!.length} ulasan)`}</p>
          <p className="my-3">{s.description}</p>
          <b>Yang kamu dapat</b>
          <ul className="ml-5 list-disc">{s.includes.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
        <div className="h-fit rounded-xl border bg-white p-5">
          <div className="text-3xl font-extrabold text-violet-600">{rp(s.price)}</div>
          <p className="mb-2 text-sm text-gray-500">{s.unit}</p>
          <AddToCart s={s} />
          <p className="mt-3 text-sm text-gray-500">💬 Pembayaran manual, dikonfirmasi admin.</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border bg-white p-5">
        <h2 className="text-lg font-bold">Ulasan Pelanggan</h2>
        {!rv?.length && <p className="text-sm text-gray-500">Belum ada ulasan.</p>}
        {rv?.map((r, i) => (
          <div key={i} className="mt-3">
            <b>{r.name}</b> <span className="text-amber-500">{"★".repeat(r.rating)}</span>
            <p>{r.comment}</p>
          </div>
        ))}
        <ReviewForm serviceId={s.id} />
      </div>
    </>
  );
}