export function AdminSkeleton() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-white/[0.06]" />
        <div className="h-4 w-72 rounded bg-white/[0.06]" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-3">
            <div className="h-3 w-24 rounded bg-white/[0.06]" />
            <div className="h-8 w-20 rounded bg-white/[0.06]" />
            <div className="h-3 w-32 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>

      {/* Chart grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-3">
            <div className="h-4 w-32 rounded bg-white/[0.06]" />
            <div className="h-3 w-48 rounded bg-white/[0.06]" />
            <div className="h-48 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-white/[0.06]" />
        <div className="h-4 w-72 rounded bg-white/[0.06]" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <div className="h-10 w-full rounded bg-white/[0.06]" />
        </div>
        <div className="divide-y divide-white/[0.06]">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="h-4 w-1/4 rounded bg-white/[0.06]" />
              <div className="h-4 w-1/6 rounded bg-white/[0.06]" />
              <div className="h-4 w-1/6 rounded bg-white/[0.06]" />
              <div className="h-4 w-1/6 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
