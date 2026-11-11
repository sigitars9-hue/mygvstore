export default function Loading() {
  return (
    <div className="animate-pulse pb-10" role="status" aria-busy="true">
      <span className="sr-only">Memuat halaman game…</span>

      <div className="flex gap-2">
        <div className="h-11 w-24 rounded-full bg-gray-100" />
        <div className="h-11 w-28 rounded-full bg-gray-100" />
      </div>

      <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-6 w-44 rounded bg-gray-200" />
            <div className="flex gap-1.5">
              <div className="h-4 w-16 rounded bg-gray-100" />
              <div className="h-4 w-20 rounded bg-gray-100" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-7 w-24 rounded-full bg-gray-100" />)}
        </div>
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
          <div className="h-10 w-36 rounded-full bg-gray-200" />
          <div className="h-10 w-20 rounded-full bg-gray-100" />
        </div>
      </div>

      <div className="mt-4 h-12 rounded-full bg-gray-100" />

      <div className="mt-8 h-6 w-24 rounded bg-gray-200" />
      <div className="-mx-4 mt-3 flex gap-3 overflow-hidden px-4 sm:mx-0 sm:px-0">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/3] w-56 shrink-0 rounded-2xl bg-gray-200 sm:w-64" />
        ))}
      </div>

      <div className="mt-6 h-6 w-40 rounded bg-gray-200" />
      <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-200 bg-white">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="flex items-center gap-4 p-4">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/2 rounded bg-gray-200" />
              <div className="h-4 w-1/3 rounded bg-gray-100" />
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-100" />
          </li>
        ))}
      </ul>
    </div>
  );
}