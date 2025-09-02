export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/40" />
        ))}
      </div>
    </div>
  )
}
