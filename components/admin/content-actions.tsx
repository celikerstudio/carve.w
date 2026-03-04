"use client";

import { useTransition } from "react";
import { toggleArticlePublished } from "@/app/actions/admin/content";
import { toast } from "sonner";

interface ContentActionsProps {
  articleId: string;
  isPublished: boolean;
  title: string;
}

export function ContentActions({
  articleId,
  isPublished,
  title,
}: ContentActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const newState = !isPublished;
    startTransition(async () => {
      const result = await toggleArticlePublished(articleId, newState);
      if (result.error) {
        toast.error(`Failed to update "${title}": ${result.error}`);
      } else {
        toast.success(
          newState
            ? `"${title}" has been published`
            : `"${title}" has been unpublished`
        );
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        isPublished
          ? "bg-white/5 border border-subtle text-ink-secondary hover:bg-white/10"
          : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
      }`}
    >
      {isPending ? "Updating..." : isPublished ? "Unpublish" : "Publish"}
    </button>
  );
}
