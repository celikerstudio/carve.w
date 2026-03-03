export default function UserDetailLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Back button + header */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-white/[0.06]" />
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-white/[0.06]" />
          <div className="h-4 w-32 rounded bg-white/[0.06]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-6 space-y-4">
              <div className="h-6 w-40 rounded bg-white/[0.06]" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-12 rounded bg-white/[0.06]" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-6 space-y-4">
              <div className="h-6 w-32 rounded bg-white/[0.06]" />
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-16 rounded-lg bg-white/[0.06]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
