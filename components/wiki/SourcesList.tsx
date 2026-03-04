interface Citation {
  citation_number: number;
  authors: string;
  year: number | null;
  title: string;
  publication: string;
  url: string | null;
}

interface SourcesListProps {
  citations: Citation[];
}

export function SourcesList({ citations }: SourcesListProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <ol className="space-y-3">
      {citations.map((citation) => (
        <li
          key={citation.citation_number}
          id={`cite-${citation.citation_number}`}
          className="text-sm text-ink-secondary leading-relaxed"
        >
          <span className="font-medium text-ink">
            [{citation.citation_number}]
          </span>{' '}
          {citation.authors} {citation.year && `(${citation.year})`}. "
          {citation.url ? (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-action hover:text-action hover:underline"
            >
              {citation.title}
            </a>
          ) : (
            citation.title
          )}
          ." <em>{citation.publication}</em>.
        </li>
      ))}
    </ol>
  );
}
