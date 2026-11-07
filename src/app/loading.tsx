export default function Loading() {
  return (
    <div className="grid gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <div className="shimmer aspect-[4/3] rounded-2xl" />
          <div className="shimmer mt-3 h-4 w-2/3 rounded" />
          <div className="shimmer mt-2 h-3 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );
}