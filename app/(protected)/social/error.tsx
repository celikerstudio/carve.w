"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SocialError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Social page error:", error);
  }, [error]);

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto pt-16">
      <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Error Loading Social Feed
            </h2>
            <p className="text-[#9da6b9] mb-6">
              We couldn&apos;t load your social feed. Your data is safe and this is
              likely a temporary issue.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/chat")}
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-white/[0.15] transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
