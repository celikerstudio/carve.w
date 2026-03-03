"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  updateFeatureRequestStatus,
  toggleFeatureRequestVisibility,
} from "@/app/actions/admin/feedback";

const STATUS_FLOW: Record<string, string[]> = {
  new: ["reviewed", "planned", "completed"],
  reviewed: ["planned", "completed"],
  planned: ["completed"],
  completed: [],
};

interface FeatureRequestActionsProps {
  id: string;
  currentStatus: string;
  isVisible: boolean;
}

export function FeatureRequestActions({
  id,
  currentStatus,
  isVisible,
}: FeatureRequestActionsProps) {
  const [isPending, startTransition] = useTransition();

  const nextStatuses = STATUS_FLOW[currentStatus] ?? [];

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      try {
        await updateFeatureRequestStatus(id, newStatus);
        toast.success(`Status updated to "${newStatus}"`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update status"
        );
      }
    });
  }

  function handleToggleVisibility() {
    startTransition(async () => {
      try {
        await toggleFeatureRequestVisibility(id, !isVisible);
        toast.success(isVisible ? "Hidden from users" : "Now visible to users");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to toggle visibility"
        );
      }
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {nextStatuses.map((status) => (
        <button
          key={status}
          onClick={() => handleStatusChange(status)}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.06] text-[#9da6b9] hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "..." : status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}

      <button
        onClick={handleToggleVisibility}
        disabled={isPending}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isVisible
            ? "border-white/[0.06] text-[#9da6b9] hover:bg-white/5 hover:text-white"
            : "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
        }`}
      >
        {isPending ? "..." : isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
