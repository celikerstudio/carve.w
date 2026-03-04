'use client';

import { useEffect } from 'react';

interface Citation {
  citation_number: number;
  authors: string;
  year: number | null;
  title: string;
  publication: string;
}

interface CitationEnhancerProps {
  citations: Citation[];
}

/**
 * Client-side component that enhances inline citations with hover previews
 * Works with server-rendered HTML from markdown
 */
export function CitationEnhancer({ citations }: CitationEnhancerProps) {
  useEffect(() => {
    // Create a map of citation numbers to citation data
    const citationMap = new Map(
      citations.map((c) => [c.citation_number, c])
    );

    // Find all citation links in the article
    const citationLinks = document.querySelectorAll('a.citation-link');

    citationLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Extract citation number from href (#cite-1 -> 1)
      const match = href.match(/#cite-(\d+)/);
      if (!match) return;

      const citationNumber = parseInt(match[1], 10);
      const citation = citationMap.get(citationNumber);
      if (!citation) return;

      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'citation-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 pointer-events-none hidden';
      tooltip.innerHTML = `
        <div class="bg-white border border-subtle text-ink text-xs rounded-lg px-3 py-2">
          <div class="font-semibold mb-1">
            ${citation.authors} ${citation.year ? `(${citation.year})` : ''}
          </div>
          <div class="text-ink-secondary line-clamp-2">
            "${citation.title}"
          </div>
          <div class="text-ink-tertiary italic mt-1 text-[10px]">
            ${citation.publication}
          </div>
          <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div class="border-4 border-transparent border-t-white"></div>
          </div>
        </div>
      `;

      // Make parent <sup> relative for positioning
      const parent = link.parentElement;
      if (parent && parent.tagName === 'SUP') {
        parent.style.position = 'relative';
        parent.style.display = 'inline-block';
        parent.appendChild(tooltip);

        // Add hover event listeners
        link.addEventListener('mouseenter', () => {
          tooltip.classList.remove('hidden');
        });

        link.addEventListener('mouseleave', () => {
          tooltip.classList.add('hidden');
        });

        // Enhance click behavior for smooth scrolling
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = href.replace('#', '');
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight briefly
            element.classList.add('bg-amber-50', 'transition-colors', 'duration-300');
            setTimeout(() => {
              element.classList.remove('bg-amber-50');
            }, 2000);
          }
        });
      }
    });

    // Cleanup function
    return () => {
      citationLinks.forEach((link) => {
        const parent = link.parentElement;
        if (parent) {
          const tooltip = parent.querySelector('.citation-tooltip');
          if (tooltip) {
            tooltip.remove();
          }
        }
      });
    };
  }, [citations]);

  return null; // This component doesn't render anything
}
