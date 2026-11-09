export default function Loading() {
  return (
    <div className="animate-pulse pb-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-gray-200" />
          <div className="h-6 w-48 rounded bg-gray-200" />
        </div>
        <div className="mt-4 flex gap-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-7 w-24 rounded-full bg-gray-100" />)}
        </div>
      </div>
      <ul className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-200 bg-white">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="flex items-center gap-4 p-4">
            <div className="h-16 w-16 rounded-2xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/2 rounded bg-gray-200" />
              <div className="h-4 w-1/3 rounded bg-gray-100" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}