export default function SocialLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-36 rounded-lg bg-white/[0.06] animate-shimmer" />
          <div className="h-4 w-52 rounded-lg bg-white/[0.06] animate-shimmer mt-1" />
        </div>
        <div className="h-9 w-[140px] rounded-lg border border-white/[0.06] bg-transparent animate-shimmer" />
      </div>

      {/* Activity feed */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5"
          >
            <div className="flex items-start gap-4">
              {/* Activity icon circle */}
              <div className="w-10 h-10 rounded-full bg-white/[0.06] animate-shimmer flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                {/* Activity description */}
                <div className="h-3.5 w-3/4 rounded bg-white/[0.06] animate-shimmer" />
                {/* XP badge — shown on some items */}
                {i % 2 === 0 && (
                  <div className="h-5 w-14 rounded-full bg-emerald-500/10 animate-shimmer" />
                )}
                {/* Timestamp */}
                <div className="h-3 w-20 rounded bg-white/[0.06] animate-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
