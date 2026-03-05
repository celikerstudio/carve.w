export default function DashboardLoading() {
  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* CarveChat area */}
      <div className="flex-1 min-w-0 min-h-0 lg:border-r lg:border-white/[0.04] flex flex-col">
        {/* Empty state skeleton */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-6 max-w-sm px-4">
            {/* Coach avatar */}
            <div className="w-16 h-16 rounded-full bg-[#1c1f27] border border-white/[0.06] animate-shimmer" />

            {/* Welcome text */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-3 w-16 rounded bg-white/[0.06] animate-shimmer" />
              <div className="h-4 w-64 rounded bg-white/[0.06] animate-shimmer" />
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-24 rounded-full bg-[#1c1f27] border border-white/[0.06] animate-shimmer"
                />
              ))}
            </div>

            {/* Suggestion chips - 2 column grid */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-11 rounded-xl bg-[#1c1f27] border border-white/[0.06] animate-shimmer"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Input bar skeleton */}
        <div className="px-4 pb-4">
          <div className="flex items-end gap-2 px-3 py-2 rounded-2xl bg-[#1c1f27] border border-white/[0.06]">
            <div className="flex-1 h-8" />
            <div className="w-8 h-8 rounded-full bg-white/[0.06] animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Widget sidebar — desktop */}
      <div className="hidden lg:block w-[340px] shrink-0">
        <div className="h-full overflow-hidden py-4 pr-4 pl-2">
          <div className="flex flex-col gap-3">
            {/* XpRank widget skeleton */}
            <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-2.5 w-10 rounded bg-white/[0.06] animate-shimmer" />
                <div className="h-3 w-16 rounded bg-white/[0.06] animate-shimmer" />
              </div>
              <div className="h-5 w-24 rounded bg-white/[0.06] animate-shimmer mb-2" />
              <div className="h-[3px] w-full rounded-full bg-white/[0.05] mb-2" />
              <div className="h-3 w-28 rounded bg-white/[0.06] animate-shimmer" />
            </div>

            {/* Today widget skeleton */}
            <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-4">
              <div className="h-2.5 w-12 rounded bg-white/[0.06] animate-shimmer mb-3" />
              <div className="flex flex-col gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-white/[0.06] animate-shimmer" />
                      <div className="h-3 w-16 rounded bg-white/[0.06] animate-shimmer" />
                    </div>
                    <div className="h-3.5 w-10 rounded bg-white/[0.06] animate-shimmer" />
                  </div>
                ))}
              </div>
            </div>

            {/* Money widget skeleton */}
            <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-4">
              <div className="h-2.5 w-14 rounded bg-white/[0.06] animate-shimmer mb-3" />
              <div className="h-5 w-20 rounded bg-white/[0.06] animate-shimmer mb-2" />
              <div className="h-3 w-32 rounded bg-white/[0.06] animate-shimmer" />
            </div>

            {/* Challenges widget skeleton */}
            <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-4">
              <div className="h-2.5 w-20 rounded bg-white/[0.06] animate-shimmer mb-3" />
              <div className="flex flex-col gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-3 w-full rounded bg-white/[0.06] animate-shimmer" />
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard widget skeleton */}
            <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-4">
              <div className="h-2.5 w-24 rounded bg-white/[0.06] animate-shimmer mb-3" />
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/[0.06] animate-shimmer" />
                    <div className="h-3 w-20 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="ml-auto h-3 w-12 rounded bg-white/[0.06] animate-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
