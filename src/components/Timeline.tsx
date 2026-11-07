import { STAGES, type Track } from "@/lib/utils";

export default function Timeline({ t }: { t: Track }) {
  return (
    <div>
      <div className="h-2.5 overflow-hidden rounded bg-gray-200">
        <div className="h-full bg-gradient-to-r from-violet-600 to-pink-500" style={{ width: `${t.progress}%` }} />
      </div>
      <p className="mb-3 mt-1 text-sm text-gray-500">{t.progress}% selesai</p>
      <ol className="ml-2 border-l-4 border-gray-200 pl-4">
        {STAGES.map((s, i) => (
          <li key={s} className={`pb-3 ${i < t.stage ? "font-semibold text-emerald-600" : i === t.stage ? "font-bold" : "text-gray-400"}`}>
            {i < t.stage ? "✓ " : ""}{s}
          </li>
        ))}
      </ol>
      <h3 className="mt-4 font-bold">Catatan progres</h3>
      {t.logs.length === 0 && <p className="text-sm text-gray-500">Belum ada catatan.</p>}
      {[...t.logs].reverse().map((l, i) => (
        <div key={i} className="mt-2 rounded-lg border p-3">
          <b>{l.title}</b>
          <p className="text-sm text-gray-500">{l.detail}</p>
          <p className="text-xs text-gray-400">{new Date(l.at).toLocaleString("id-ID")}</p>
        </div>
      ))}
    </div>
  );
}