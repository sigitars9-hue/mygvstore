import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { rp, type Service } from "@/lib/utils";
import AddToCart from "@/components/AddToCart";

export default async function Home({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const { game } = await searchParams;
  const sb = await createClient();
  const { data } = await sb.from("services").select("*").eq("is_active", true).order("created_at");
  const all = (data ?? []) as Service[];
  const games = [...new Set(all.map((s) => s.game))];
  const list = game ? all.filter((s) => s.game === game) : all;
  const chip = (on: boolean) => `rounded-full border px-3 py-1 text-sm ${on ? "border-violet-600 bg-violet-600 text-white" : "bg-white"}`;

  return (
    <>
      <section className="mb-5 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 p-7 text-white">
        <h1 className="text-3xl font-extrabold">Naik rank tanpa begadang</h1>
        <p className="mt-1 opacity-90">Booster profesional, akun aman, progres bisa dipantau real-time.</p>
      </section>
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/" className={chip(!game)}>Semua</Link>
        {games.map((g) => <Link key={g} href={`/?game=${encodeURIComponent(g)}`} className={chip(game === g)}>{g}</Link>)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <div key={s.id} className="rounded-xl border bg-white p-4">
            <Link href={`/layanan/${s.slug}`}>
              <div className="text-4xl">{s.emoji}</div>
              <p className="text-sm text-gray-500">{s.game}</p>
              <b>{s.name}</b>
              <p className="text-sm text-gray-500">Estimasi {s.duration}</p>
            </Link>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-extrabold text-violet-600">{rp(s.price)}<span className="text-xs font-normal text-gray-500"> {s.unit}</span></span>
              <AddToCart s={s} compact />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}