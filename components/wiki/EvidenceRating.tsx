interface EvidenceRatingProps {
  rating: string;
  variant?: 'default' | 'hero';
}

const ratingConfig = {
  'well-established': {
    label: 'Well-Established',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    heroColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    icon: '🟢',
    description: 'Strong peer-reviewed consensus with multiple meta-analyses',
  },
  'emerging-research': {
    label: 'Emerging Research',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    heroColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
    icon: '🟡',
    description: 'Promising research findings that need more replication studies',
  },
  'expert-consensus': {
    label: 'Expert Consensus',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    heroColor: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
    icon: '🔵',
    description: 'Based on practitioner experience with limited research',
  },
};

export function EvidenceRating({ rating, variant = 'default' }: EvidenceRatingProps) {
  const config = ratingConfig[rating as keyof typeof ratingConfig] || ratingConfig['expert-consensus'];
  const colorClass = variant === 'hero' ? config.heroColor : config.color;

  return (
    <div className="group relative">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClass} text-sm font-medium`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>

      {/* Tooltip — variant-aware */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
        {variant === 'hero' ? (
          <div className="bg-surface border border-subtle text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
            {config.description}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-surface"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-subtle text-ink text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
            {config.description}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-white"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
