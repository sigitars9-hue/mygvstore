import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin as db } from "@/lib/supabase/admin";
import { Icon } from "@/components/Icons";
import InstagramEmbed from "@/components/InstagramEmbed";

export const metadata: Metadata = {
  title: "Testimoni | Mygvstore",
  description: "Komentar dan pengalaman pelanggan Mygvstore.",
};

export const revalidate = 60;

const IG_POST = "https://www.instagram.com/p/C0s1Dgbx52i/";

type Testi = { id: string | number; username: string; body: string };

// Dipakai kalau tabel testimonials masih kosong
const FALLBACK: Testi[] = [
  {
    id: "f1",
    username: "hbb_almaula",
    body: "ini udah yg ke 5 dan ttp amanah woe, asli ini gacor jir, respect and recommended banget lah",
  },
  {
    id: "f2",
    username: "rath_rust26",
    body: "Third(?) time ordering here, aman cepat satset, kelar 🔥",
  },
  {
    id: "f3",
    username: "arnnmen",
    body: "trustedd 👍 👍",
  },
  {
    id: "f4",
    username: "ibrahimfaqih_1014",
    body: "Recommended banget buat yg mau joki Di sini, adminnya ramah dan oke banget nanggapin pertanyaannya",
  },
  {
    id: "f5",
    username: "gathanologyy",
    body: "Big respect buat kakak yang joki nya! first time nyari store dan puji tuhan dapat yang bagus 👌. worth to try dan gabakal nyesel",
  },
];

export default async function TestimoniPage() {
  const { data } = await db
    .from("testimonials")
    .select("id, username, body")
    .eq("is_active", true)
    .order("sort")
    .order("created_at");

  const list: Testi[] = data && data.length > 0 ? data : FALLBACK;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-[#0d0c22] sm:text-4xl">Testimoni</h1>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          Kata mereka yang sudah order di Mygvstore.
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <li
            key={t.id}
            className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="flex-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              “{t.body}”
            </p>
            <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-sm font-extrabold uppercase text-white">
                {t.username.charAt(0)}
              </span>
              <b className="truncate text-sm text-[#0d0c22]">@{t.username}</b>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-14">
        <h2 className="mb-4 text-center text-lg font-bold text-[#0d0c22]">Dari Instagram kami</h2>
        <InstagramEmbed url={IG_POST} />
      </section>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#0d0c22] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Lihat layanan
          <Icon name="right" className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}