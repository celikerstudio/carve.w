'use client';

import { useState } from 'react';

interface CitationProps {
  number: number;
  author: string;
  year?: number;
  title: string;
  publication: string;
}

export function Citation({ number, author, year, title, publication }: CitationProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <sup className="relative inline-block">
      <a
        href={`#cite-${number}`}
        className="citation-link text-action hover:text-action font-medium px-0.5"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        onClick={(e) => {
          // Smooth scroll to citation
          e.preventDefault();
          const element = document.getElementById(`cite-${number}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the citation briefly
            element.classList.add('bg-yellow-100');
            setTimeout(() => element.classList.remove('bg-yellow-100'), 2000);
          }
        }}
      >
        [{number}]
      </a>

      {/* Hover Preview Tooltip */}
      {showPreview && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 pointer-events-none">
          <div className="bg-white border border-subtle text-ink text-xs rounded-lg px-3 py-2 shadow-xl">
            <div className="font-semibold mb-1">
              {author} {year && `(${year})`}
            </div>
            <div className="text-ink-secondary line-clamp-2">
              "{title}"
            </div>
            <div className="text-ink-tertiary italic mt-1 text-[10px]">
              {publication}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-white"></div>
            </div>
          </div>
        </div>
      )}
    </sup>
  );
}
