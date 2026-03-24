export default function FoodLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-32 rounded-lg bg-white/[0.06] animate-shimmer" />
          <div className="h-4 w-52 rounded-lg bg-white/[0.06] animate-shimmer mt-1" />
        </div>
        <div className="h-9 w-[105px] rounded-lg bg-white/10 animate-shimmer" />
      </div>

      {/* Stats — 2 column grid matching HealthCard */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
            <div className="h-3 w-20 rounded bg-white/[0.06] animate-shimmer mb-1" />
            <div className="h-9 w-12 rounded bg-white/[0.06] animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Meal list — grouped by date */}
      {[1, 2].map((group) => (
        <div key={group} className="space-y-3">
          {/* Date header */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/[0.06] animate-shimmer" />
            <div className="h-4 w-48 rounded bg-white/[0.06] animate-shimmer" />
          </div>

          {/* Daily totals card */}
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-5">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-white/[0.06] animate-shimmer" />
              <div className="flex gap-5">
                <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-shimmer" />
                <div className="h-3.5 w-10 rounded bg-white/[0.06] animate-shimmer" />
                <div className="h-3.5 w-10 rounded bg-white/[0.06] animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Meal cards */}
          {[1, 2].map((meal) => (
            <div
              key={meal}
              className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Meal type with icon */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-4 w-20 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-3.5 w-24 rounded bg-white/[0.06] animate-shimmer" />
                  </div>
                  {/* Macro info */}
                  <div className="flex gap-4">
                    <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-3.5 w-20 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-shimmer" />
                  </div>
                </div>
                <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
