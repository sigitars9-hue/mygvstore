export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse pb-16 pt-4" role="status" aria-busy="true">
      <span className="sr-only">Memuat halaman admin…</span>

      <div className="mb-6 flex gap-1.5 overflow-hidden">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 w-28 shrink-0 rounded-full bg-gray-100" />)}
      </div>

      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="mt-2 h-1 w-12 rounded-full bg-gray-200" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-gray-100" />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl border border-gray-200 bg-white p-5">
            <div className="h-11 w-11 rounded-2xl bg-gray-200" />
            <div className="mt-4 h-8 w-16 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-24 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-200 bg-white">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 sm:px-6">
            <div className="h-12 w-12 shrink-0 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}