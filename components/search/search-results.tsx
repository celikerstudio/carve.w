"use client";

import Link from "next/link";
import type { SearchResult } from "@/types/search";

type SearchResultsProps = {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
};

export function SearchResults({ results, isLoading, query }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-subtle rounded w-3/4"></div>
          <div className="h-4 bg-subtle rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className="p-4 text-center text-ink-secondary">
        No results for &ldquo;{query}&rdquo;
      </div>
    );
  }

  // Group results by type
  const wikiResults = results.filter((r) => r.type === "wiki");
  const userResults = results.filter((r) => r.type === "user");
  const hiscoreResults = results.filter((r) => r.type === "hiscore");

  return (
    <div className="py-2 max-h-96 overflow-y-auto">
      {wikiResults.length > 0 && (
        <div className="mb-2">
          <div className="px-4 py-2 text-xs font-semibold text-ink-secondary uppercase">
            Wiki Articles ({wikiResults.length})
          </div>
          {wikiResults.map((result) => (
            <Link
              key={result.id}
              href={result.href}
              className="block px-4 py-2 hover:bg-surface transition-colors"
            >
              <div className="font-medium text-sm">{result.title}</div>
              {result.description && (
                <div className="text-xs text-ink-secondary truncate">{result.description}</div>
              )}
            </Link>
          ))}
        </div>
      )}

      {userResults.length > 0 && (
        <div className="mb-2">
          <div className="px-4 py-2 text-xs font-semibold text-ink-secondary uppercase">
            Users ({userResults.length})
          </div>
          {userResults.map((result) => (
            <Link
              key={result.id}
              href={result.href}
              className="block px-4 py-2 hover:bg-surface transition-colors"
            >
              <div className="font-medium text-sm">{result.title}</div>
            </Link>
          ))}
        </div>
      )}

      {hiscoreResults.length > 0 && (
        <div className="mb-2">
          <div className="px-4 py-2 text-xs font-semibold text-ink-secondary uppercase">
            Hiscores
          </div>
          <Link
            href="/hiscores"
            className="block px-4 py-2 hover:bg-surface transition-colors text-sm text-blue-600"
          >
            View all in Hiscores &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
