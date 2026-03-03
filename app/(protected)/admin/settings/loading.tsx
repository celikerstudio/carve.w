export default function SettingsLoading() {
  return (
    <div className="h-full lg:grid lg:grid-cols-[250px_1fr]">
      <div className="hidden lg:block p-6 space-y-4">
        <div className="h-8 w-32 rounded bg-white/[0.06]" />
        <div className="space-y-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-white/[0.06]" />
          ))}
        </div>
      </div>
      <div className="p-6 max-w-4xl space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-6 space-y-6">
            <div className="space-y-2">
              <div className="h-6 w-32 rounded bg-white/[0.06]" />
              <div className="h-4 w-64 rounded bg-white/[0.06]" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between py-4">
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-white/[0.06]" />
                    <div className="h-3 w-48 rounded bg-white/[0.06]" />
                  </div>
                  <div className="h-6 w-12 rounded-full bg-white/[0.06]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
