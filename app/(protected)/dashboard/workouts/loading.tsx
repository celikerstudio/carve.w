export default function WorkoutsLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-36 rounded-lg bg-white/[0.06] animate-shimmer" />
          <div className="h-4 w-64 rounded-lg bg-white/[0.06] animate-shimmer mt-1" />
        </div>
        <div className="h-9 w-[120px] rounded-lg bg-white/10 animate-shimmer" />
      </div>

      {/* Stats — 2 column grid matching HealthCard */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
            <div className="h-3 w-24 rounded bg-white/[0.06] animate-shimmer mb-1" />
            <div className="h-9 w-12 rounded bg-white/[0.06] animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Workout list — grouped by date */}
      {[1, 2].map((group) => (
        <div key={group} className="space-y-3">
          {/* Date header */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/[0.06] animate-shimmer" />
            <div className="h-4 w-48 rounded bg-white/[0.06] animate-shimmer" />
          </div>

          {/* Workout cards */}
          {[1, 2].map((card) => (
            <div
              key={card}
              className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-4"
            >
              {/* Workout header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-5 w-36 rounded bg-white/[0.06] animate-shimmer" />
                  <div className="flex items-center gap-4 mt-1">
                    <div className="h-3.5 w-20 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-3.5 w-24 rounded bg-white/[0.06] animate-shimmer" />
                  </div>
                </div>
                <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-shimmer" />
              </div>

              {/* Exercise rows */}
              <div className="space-y-2">
                {[1, 2, 3].map((exercise) => (
                  <div
                    key={exercise}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-28 rounded bg-white/[0.06] animate-shimmer" />
                      {exercise === 1 && (
                        <div className="h-4 w-7 rounded-full bg-white/[0.06] animate-shimmer" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="h-3.5 w-20 rounded bg-white/[0.06] animate-shimmer" />
                      <div className="h-3 w-14 rounded bg-white/[0.06] animate-shimmer mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
