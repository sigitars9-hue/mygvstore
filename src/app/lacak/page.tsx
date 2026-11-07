import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STAGES, rp, merge, type Track } from "@/lib/utils";
import PayBox from "@/components/PayBox";
import { waLink } from "@/lib/wa-report";
import { Icon, type IconName } from "@/components/Icons";

const WA = process.env.NEXT_PUBLIC_WA_NUMBER;

const fmt = (d: string) =>
  new Date(d).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });

function status(t: Track): { label: string; cls: string } {
  if (t.cancelled) return { label: "Dibatalkan", cls: "bg-gray-100 text-gray-600" };
  if (t.pay_status === "paid")
    return { label: t.stage <= 0 ? "Dikonfirmasi" : STAGES[t.stage], cls: "bg-emerald-50 text-emerald-700" };
  if (t.pay_status === "proof") return { label: "Verifikasi pembayaran", cls: "bg-amber-50 text-amber-700" };
  if (t.pay_status === "rejected") return { label: "Pembayaran ditolak", cls: "bg-red-50 text-red-700" };
  return { label: "Menunggu pembayaran", cls: "bg-pink-50 text-pink-700" };
}

function Row({ icon, label, children }: { icon: IconName; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon name={icon} className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="break-words text-[15px] font-medium text-[#0d0c22]">{children}</div>
      </div>
    </div>
  );
}

export default async function Lacak({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const { kode } = await searchParams;
  let t: Track | null = null;
  if (kode) {
    const sb = await createClient();
    const c = kode.trim();
    const [{ data }, { data: info }] = await Promise.all([
      sb.rpc("track_order", { p_code: c }),
      sb.rpc("track_order_info", { p_code: c }),
    ]);
    t = data ? { ...data, ...info } : null;
  }
  const paid = t?.pay_status === "paid";
  const st = t ? status(t) : null;
  const lastLog = t?.logs?.length ? t.logs[t.logs.length - 1] : null;

return (
  <div className="mx-auto max-w-5xl pb-10 pt-4">
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold tracking-tight text-[#0d0c22]">Lacak pesanan</h1>
      <p className="mt-2 text-gray-600">Masukkan kode pesananmu untuk membayar atau menghubungi admin.</p>

      <form action="/lacak" className="mt-6 flex items-center rounded-full bg-gray-100 py-2 pl-6 pr-2">
        <input
          name="kode"
          defaultValue={kode}
          placeholder="Kode pesanan, mis. JK-1001"
          autoCapitalize="characters"
          className="h-11 min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray-500"
        />
        <button aria-label="Cek pesanan" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600">
          <Icon name="search" />
        </button>
      </form>
    </div>

    {kode && !t && (
      <div className="mt-6 flex max-w-xl items-center gap-3 rounded-3xl border border-gray-200 bg-white p-5 text-gray-600">
        <Icon name="alert" className="h-6 w-6 shrink-0 text-gray-400" />
        Kode tidak ditemukan. Periksa lagi penulisannya.
      </div>
    )}

      {t && st && (
  <div className="mt-6 grid items-start gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Ringkasan */}
           <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6 lg:sticky lg:top-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Kode pesanan</p>
                <h2 className="truncate text-2xl font-extrabold tracking-tight text-[#0d0c22]">{t.code}</h2>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${st.cls}`}>{st.label}</span>
            </div>

            <div className="mt-3 divide-y divide-gray-100 border-t border-gray-100">
              {t.customer_name && <Row icon="list" label="Atas nama">{t.customer_name}</Row>}
              {!!t.items?.length && (
                <Row icon="receipt" label="Layanan">
                  {merge(t.items).map((i) => (
                    <div key={i.name}>
                      {i.name}
                      {i.qty > 1 && <span className="text-gray-500"> × {i.qty}</span>}
                    </div>
                  ))}
                </Row>
              )}
              {t.account && <Row icon="grid" label="ID / Server akun">{t.account}</Row>}
              {t.schedule && <Row icon="clock" label="Jadwal mulai">{fmt(t.schedule)} WIB</Row>}
              <Row icon="coin" label="Total">{rp(t.total_pay)}</Row>
            </div>
          </div>
       <div className="space-y-4">
          {/* Dibatalkan */}
          {t.cancelled && (
             <div className="rounded-3xl border border-gray-200 bg-white p-5 text-center sm:p-6">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                <Icon name="alert" className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-lg font-bold">Pesanan dibatalkan</h3>
              <p className="mt-1 text-sm text-gray-600">Batas waktu pembayaran terlewat. Silakan buat pesanan baru.</p>
              <Link href="/" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0d0c22] px-6 py-3 text-sm font-bold text-white hover:bg-black">
                <Icon name="sparkle" className="h-4 w-4" />Pilih layanan
              </Link>
            </div>
          )}

 {/* Belum bayar */}
            {!t.cancelled && !paid && <PayBox t={t} />}

            {/* Sudah bayar */}
            {!t.cancelled && paid && (
              <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Icon name="check" />
                  </span>
                  <div>
                    <h3 className="font-bold text-[#0d0c22]">Pembayaran terkonfirmasi</h3>
                    <p className="text-sm text-gray-600">Pesananmu sudah masuk antrean pengerjaan.</p>
                  </div>
                </div>

                {lastLog && (
                  <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Update terakhir · {fmt(lastLog.at)} WIB</p>
                    <p className="mt-0.5 font-semibold text-[#0d0c22]">{lastLog.title}</p>
                    {lastLog.detail && <p className="mt-0.5 text-sm text-gray-600">{lastLog.detail}</p>}
                  </div>
                )}

                <a
                  href={waLink(WA, t, "progres")}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#0d0c22] py-4 text-base font-bold text-white hover:bg-black"
                >
                  <Icon name="send" className="h-5 w-5" />Tanya progres via WhatsApp
                </a>
                <p className="mt-3 text-center text-xs text-gray-500">
                  Pesan sudah terisi otomatis. Tinggal tekan kirim di WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}