'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EvidenceRating } from './EvidenceRating';

interface SearchResult {
  slug: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  evidence_rating: string;
  combined_rank: number;
}

interface SearchBarProps {
  variant?: 'hero' | 'header';
  theme?: 'dark' | 'light';
}

export function SearchBar({ variant = 'hero', theme = 'dark' }: SearchBarProps) {
  const isHeader = variant === 'header';
  const isLightHeader = isHeader && theme === 'light';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc('search_wiki_articles', {
          search_query: query,
          search_language: 'auto',
        });

        if (error) throw error;

        setResults(data || []);
        setShowResults(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToArticle(results[selectedIndex]);
        } else if (results.length > 0) {
          navigateToArticle(results[0]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        inputRef.current?.blur();
        break;
    }
  };

  const navigateToArticle = (result: SearchResult) => {
    router.push(`/wiki/${result.category}/${result.slug}`);
    setShowResults(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-100 text-amber-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className={cn(
      "relative",
      isHeader ? "w-[180px]" : "w-full max-w-2xl mx-auto"
    )}>
      {/* Search Input */}
      <div className="relative">
        <Search className={cn(
          "absolute top-1/2 -translate-y-1/2",
          isHeader
            ? cn("left-3 w-3.5 h-3.5", isLightHeader ? "text-ink-tertiary" : "text-white/30")
            : "left-4 w-5 h-5 text-ink-tertiary"
        )} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={isHeader ? "Zoek in wiki..." : "Zoek artikelen over fitness, voeding, training..."}
          className={cn(
            "w-full focus:outline-none transition-all",
            isHeader
              ? cn(
                  "pl-9 pr-8 py-1.5 text-sm rounded-lg border",
                  isLightHeader
                    ? "bg-subtle border-subtle text-ink placeholder:text-ink-secondary focus:bg-subtle focus:border-subtle"
                    : "bg-white/[0.03] border-white/[0.06] focus:border-white/20 text-white placeholder:text-white/30"
                )
              : "pl-12 pr-12 py-4 text-lg bg-white/90 backdrop-blur-sm border border-white/20 text-ink placeholder:text-ink-tertiary rounded-xl shadow-lg focus:border-subtle"
          )}
        />
        {query && (
          <button
            onClick={clearSearch}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 rounded-full transition-colors",
              isHeader
                ? cn("right-2 p-0.5", isLightHeader ? "hover:bg-subtle" : "hover:bg-white/[0.08]")
                : "right-4 p-1 hover:bg-subtle"
            )}
            aria-label="Clear search"
          >
            <X className={cn(
              isHeader
                ? cn("w-3.5 h-3.5", isLightHeader ? "text-ink-tertiary" : "text-white/30")
                : "w-5 h-5 text-ink-tertiary"
            )} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className={cn(
          "absolute top-full mt-2 bg-white rounded-xl border border-subtle shadow-xl overflow-y-auto z-50",
          isHeader ? "right-0 w-[380px] max-h-[60vh]" : "left-0 right-0 max-h-[70vh]"
        )}>
          {isSearching ? (
            <div className="p-8 text-center text-ink-secondary">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ink-tertiary"></div>
              <p className="mt-2">Zoeken...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-subtle text-xs text-ink-tertiary">
                {results.length} resultaten gevonden
              </div>
              <ul>
                {results.map((result, index) => (
                  <li key={result.slug}>
                    <button
                      onClick={() => navigateToArticle(result)}
                      className={`w-full text-left p-4 hover:bg-surface transition-colors border-b border-subtle last:border-b-0 ${
                        index === selectedIndex ? 'bg-surface' : ''
                      }`}
                    >
                      {/* Evidence Rating */}
                      <div className="mb-2">
                        <EvidenceRating rating={result.evidence_rating} />
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-ink mb-1">
                        {highlightMatch(result.title, query)}
                      </h3>

                      {/* Category */}
                      <div className="text-xs text-ink-secondary mb-2">
                        {result.category.split('-').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </div>

                      {/* Summary */}
                      {result.summary && (
                        <p className="text-sm text-ink-secondary line-clamp-2 mb-2">
                          {result.summary}
                        </p>
                      )}

                      {/* Tags */}
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-surface border border-subtle text-ink-secondary rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center text-ink-secondary">
              <p className="mb-2">Geen resultaten gevonden voor &ldquo;{query}&rdquo;</p>
              <p className="text-sm">Probeer andere zoektermen</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
