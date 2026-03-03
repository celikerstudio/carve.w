"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-rose-500/10 p-4 mb-4">
          <AlertTriangle className="h-8 w-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-[#9da6b9] text-sm mb-6 text-center max-w-md">
          {error.message || "An unexpected error occurred while loading admin data."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-white text-sm hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
