"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchResults } from "./search-results";
import { useDebouncedCallback } from "use-debounce";
import type { SearchResult } from "@/types/search";

type GlobalSearchProps = {
  className?: string;
  variant?: "compact" | "large";
  autoFocus?: boolean;
};

export function GlobalSearch({ className, variant = "compact", autoFocus = false }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search (300ms)
  const debouncedSearch = useDebouncedCallback(performSearch, 300);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search
      if (e.key === "/" && !isOpen && variant === "compact") {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setQuery("");
        setResults([]);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, variant]);

  // Auto-focus for large variant (homepage)
  useEffect(() => {
    if (autoFocus && variant === "large") {
      inputRef.current?.focus();
    }
  }, [autoFocus, variant]);

  // Compact variant (header)
  if (variant === "compact") {
    return (
      <div className={className}>
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-ink-secondary hover:text-ink hover:bg-surface rounded-md transition-colors"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        ) : (
          <div className="relative">
            <div className="flex items-center bg-white rounded-md shadow-sm border border-subtle">
              <svg className="w-5 h-5 ml-3 text-ink-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder="Search everything..."
                className="w-64 px-3 py-2 focus:outline-none bg-transparent"
              />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                  setResults([]);
                }}
                className="p-2 text-ink-tertiary hover:text-ink-secondary"
                aria-label="Close search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Results dropdown */}
            {isOpen && (query || results.length > 0) && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-md shadow-lg border border-subtle z-50">
                <SearchResults results={results} isLoading={isLoading} query={query} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Large variant (homepage)
  return (
    <div className={className}>
      <div className="relative max-w-2xl mx-auto">
        <div className="flex items-center bg-white rounded-lg shadow-lg border border-subtle">
          <svg className="w-6 h-6 ml-4 text-ink-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search articles, users, rankings..."
            className="w-full px-4 py-4 text-lg focus:outline-none bg-transparent"
          />
        </div>

        {/* Results overlay */}
        {(query || results.length > 0) && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-xl border border-subtle z-50">
            <SearchResults results={results} isLoading={isLoading} query={query} />
          </div>
        )}
      </div>
    </div>
  );
}
