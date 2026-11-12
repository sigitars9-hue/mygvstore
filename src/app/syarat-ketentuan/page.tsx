import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icons";
import PageNav from "@/components/PageNav";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat, aturan, denda, diskon, dan garansi refund layanan joki. Baca sebelum memesan.",
};

const WA = process.env.NEXT_PUBLIC_WA_NUMBER;

const NAV = [
  ["umum", "Ketentuan umum"],
  ["rule", "Rule penting"],
  ["denda", "Rush hour & denda"],
  ["diskon", "Diskon"],
  ["refund", "Garansi & refund"],
] as const;

/* ---------- Komponen kecil ---------- */
function Section({
  id, n, icon, title, danger, children,
}: { id: string; n: number; icon: IconName; title: string; danger?: boolean; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <header
        className={`flex items-center gap-3 border-b px-4 py-3.5 sm:px-5 ${
          danger ? "border-red-100 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10" : "border-gray-100 bg-gray-50"
        }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
            danger ? "bg-red-500 text-white" : "bg-[#0d0c22] text-white"
          }`}
        >
          {n}
        </span>
        <h2 className={`flex-1 text-base font-bold sm:text-lg ${danger ? "text-red-700 dark:text-red-400" : "text-[#0d0c22]"}`}>
          {title}
        </h2>
        <Icon name={icon} className={`h-5 w-5 shrink-0 ${danger ? "text-red-400" : "text-gray-400"}`} />
      </header>
      {children}
    </section>
  );
}

function Points({ children }: { children: ReactNode }) {
  return <ul className="divide-y divide-gray-100 px-4 sm:px-5">{children}</ul>;
}

function Point({ term, children, danger }: { term: string; children?: ReactNode; danger?: boolean }) {
  return (
    <li className="flex gap-3 py-3.5">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          danger ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
        }`}
      >
        <Icon name={danger ? "close" : "check"} className="h-3 w-3" />
      </span>
      <p className="min-w-0 text-[15px] leading-relaxed text-gray-600">
        <b className="font-semibold text-[#0d0c22]">{term}</b>
        {children && <>: {children}</>}
      </p>
    </li>
  );
}

function Note({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "red" | "amber" }) {
  const t = {
    gray: "bg-gray-50 text-gray-600",
    red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    amber: "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  }[tone];
  return (
    <p className={`flex gap-2.5 border-t border-gray-100 px-4 py-3.5 text-sm leading-relaxed sm:px-5 ${t}`}>
      <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

const th = "px-4 py-2.5 text-left text-xs font-semibold text-gray-500 sm:px-5";
const td = "px-4 py-3 text-[15px] sm:px-5";

export default function SyaratKetentuanPage() {
  return (
    <div className="pb-12">
      <PageNav />

      {/* Header */}
      <header className="animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0d0c22] sm:text-4xl">Syarat & Ketentuan</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
          Baca aturan di bawah sebelum memesan supaya proses joki berjalan lancar dan tidak ada salah paham.
          Dengan memesan, kamu dianggap setuju dengan seluruh ketentuan ini.
        </p>
      </header>

      {/* Sekilas */}
      <dl className="mt-5 grid grid-cols-3 divide-x divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {[
          ["Diskon", "50%", "rate on & pity >40"],
          ["Refund", "hingga 50%", "sesuai batas pity"],
          ["Pelanggaran", "3x", "joki dicancel tanpa refund"],
        ].map(([label, value, note]) => (
          <div key={label} className="px-3 py-3.5 text-center sm:px-5">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="mt-0.5 text-lg font-extrabold text-[#0d0c22] sm:text-2xl">{value}</dd>
            <p className="mt-0.5 text-[11px] leading-snug text-gray-400 sm:text-xs">{note}</p>
          </div>
        ))}
      </dl>

      {/* Navigasi cepat */}
      <nav aria-label="Daftar isi" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV.map(([id, label], i) => (
          <a
            key={id}
            href={`#${id}`}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:border-[#0d0c22] hover:text-[#0d0c22]"
          >
            <span className="mr-1.5 text-gray-400">{i + 1}</span>
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-6 space-y-4">
        {/* 1. Ketentuan umum */}
        <Section id="umum" n={1} icon="shield" title="Ketentuan umum">
          <Points>
            <Point term="Bukan akun endgame">resource masih tersedia.</Point>
            <Point term="Akun wajib bind">contoh via Kurogame atau Hoyoverse.</Point>
            <Point term="Toleransi rate off">
              hanya diterima jika pity di atas 50. Bisa di bawahnya, namun resource wajib memadai dan worker sanggup.
            </Point>
            <Point term="Akses bebas">worker berhak mengerjakan story, event, dan explore untuk farming.</Point>
            <Point term="Akun lemah">karakter under-leveled dikenakan biaya tambahan +Rp30.000.</Point>
          </Points>
        </Section>

        {/* 2. Rule penting */}
        <Section id="rule" n={2} icon="alert" title="Rule penting" danger>
          <Points>
            <Point danger term="No gacha mandiri">customer dilarang memakai hasil farming.</Point>
            <Point danger term="Dilarang login">
              di luar kesepakatan waktu yang sudah disepakati.
            </Point>
          </Points>
          <Note tone="red">
            Apabila melanggar salah satu rule penting di atas sebanyak <b>3x</b>, maka joki akan dicancel
            <b> tanpa refund</b>.
          </Note>
        </Section>

        {/* 3. Rush hour & denda */}
        <Section id="denda" n={3} icon="clock" title="Rush hour & denda">
          <Points>
            <Point term="Denda bohong">salah memberikan info spek akun didenda 10%.</Point>
            <Point term="Biaya mepet">berlaku pada kondisi guarantee, sesuai sisa waktu di bawah.</Point>
          </Points>
          <div className="overflow-x-auto border-t border-gray-100">
            <table className="w-full min-w-[16rem]">
              <thead className="bg-gray-50">
                <tr>
                  <th className={th}>Sisa waktu</th>
                  <th className={`${th} text-right`}>Biaya tambahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[["H-6", "+Rp60.000"], ["H-4", "+Rp80.000"], ["H-2", "+Rp100.000"]].map(([h, p]) => (
                  <tr key={h}>
                    <td className={`${td} font-semibold text-[#0d0c22]`}>{h}</td>
                    <td className={`${td} text-right font-semibold text-red-600`}>{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note tone="amber">Belum guarantee? Wajib diskusi dengan CS terlebih dahulu.</Note>
        </Section>

        {/* 4. Diskon */}
        <Section id="diskon" n={4} icon="coin" title="Diskon">
          <Points>
            <Point term="Diskon 50%">berlaku jika kondisi rate on dan pity di atas 40.</Point>
            <Point term="Kalah rate off">
              harga normal ditambah biaya per 10 pull pasca-lose: +Rp10.000 jika ladang luas, atau +Rp20.000 jika seret.
            </Point>
          </Points>
        </Section>

        {/* 5. Garansi & refund */}
        <Section id="refund" n={5} icon="receipt" title="Garansi & refund">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[20rem]">
              <thead className="bg-gray-50">
                <tr>
                  <th className={th}>Refund</th>
                  <th className={th}>Jika mentok di pity (karakter)</th>
                  <th className={th}>Jika mentok di pity (weapon)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[["50%", "1–50", "1–45"], ["25%", "1–70", "1–60"]].map(([r, c, w]) => (
                  <tr key={r}>
                    <td className={`${td} font-bold text-[#0d0c22]`}>{r}</td>
                    <td className={td}>{c}</td>
                    <td className={td}>{w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* Kontak */}
      <aside className="mt-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="font-semibold text-[#0d0c22]">Masih ada yang kurang jelas?</p>
          <p className="text-sm text-gray-500">Tanyakan ke CS sebelum memesan.</p>
        </div>
        <a
          href={`https://wa.me/${WA}?text=${encodeURIComponent("Halo admin, saya mau tanya soal syarat & ketentuan")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0d0c22] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black active:scale-95"
        >
          <Icon name="chat" className="h-4 w-4" />Chat CS
        </a>
      </aside>
    </div>
  );
}