export default function FeedbackLoading() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-white/[0.06]" />
        <div className="h-4 w-72 rounded bg-white/[0.06]" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-6 space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-white/[0.06]" />
              <div className="h-6 w-20 rounded-full bg-white/[0.06]" />
            </div>
            <div className="h-4 w-48 rounded bg-white/[0.06]" />
            <div className="h-16 w-full rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}
