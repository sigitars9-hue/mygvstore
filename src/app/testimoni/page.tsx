import Link from "next/link";
import type { Metadata } from "next";
import InstagramEmbed from "@/components/InstagramEmbed";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Testimoni | Mygvstore" };

const POST = "https://www.instagram.com/p/C0s1Dgbx52i/";

const REVIEWS = [
  { user: "dixayusaka", text: "adminnya kerjanya cepet euy, walopun sempet ketunda tp bs dimaklumi, W atmint" },
  { user: "el.kamisaki_fisalia", text: "W admin+worker, walaupun di kejar laprak wkwk" },
  { user: "jonathan.aldy", text: "best piloting service 🔥🔥🔥🔥" },
  { user: "jug379969", text: "Baru pertama kali joki emang the best, kalo mau joki disini aja adminnya ramah jokinyq juga gacor langsung mulangin karakter emang mantep 🔥🔥" },
  { user: "rizzmustdie", text: "rekomen buat joki disini, worker nya amanah, gercep satset banget pengerjaannya" },
];

export default async function TestimoniPage() {
  const sb = await createClient();
  const { data } = await sb
    .from("testimonials")
    .select("username,body")
    .eq("is_active", true)
    .order("sort")
    .order("created_at");
  const list = data?.length ? data.map((t) => ({ user: t.username, text: t.body })) : REVIEWS;

  return (
    <>
      <section className="pb-8 pt-4">
        <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-black">
          ← Kembali
        </Link>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight text-[#0d0c22] sm:text-4xl xl:text-5xl">
          Kata mereka yang sudah <span className="text-pink-400">pakai jasa kami</span>
        </h1>
        <p className="mt-2 max-w-xl text-gray-600">Komentar asli dari pelanggan di Instagram kami.</p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,540px)_1fr] lg:gap-10">
        <InstagramEmbed />

        <div className="space-y-4">
          {list.map((r) => (
            <figure key={r.user + r.text} className="rounded-3xl border border-gray-200 bg-white p-5 transition duration-300 hover:shadow-xl">
              <blockquote className="text-[15px] leading-relaxed text-gray-700">“{r.text}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold uppercase text-pink-600">
                  {r.user.charAt(0)}
                </span>
                <span className="min-w-0">
                  <b className="block truncate text-sm">@{r.user}</b>
                  <span className="text-xs text-gray-400">via Instagram</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={POST}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#0d0c22] px-6 py-3 text-sm font-bold text-white hover:bg-black"
        >
          Lihat semua komentar di Instagram
        </a>
        <Link href="/" className="rounded-full border border-gray-300 px-6 py-3 text-sm font-bold hover:border-black">
          Pilih layanan
        </Link>
      </div>
    </>
  );
}