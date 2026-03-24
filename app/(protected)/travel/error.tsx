"use client"

export default function TravelError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-[#9da6b9] text-sm mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-medium text-white bg-white/[0.08] hover:bg-white/[0.12] rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
