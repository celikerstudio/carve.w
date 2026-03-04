export const metadata = {
  title: 'Updates - Carve',
  description: 'Latest updates, changes, and news about Carve.',
};

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-ink mb-4">
            Updates & Changelog
          </h1>
          <p className="text-xl text-ink-secondary max-w-2xl mx-auto">
            Stay up to date with the latest features, improvements, and fixes.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          <UpdateItem
            date="January 2025"
            title="Dashboard Redesign"
            category="feature"
            description="Complete redesign of the web dashboard with modern widget-based layout, dark hero cards, and gradient visualizations."
            highlights={[
              "New widget-based layout",
              "Interactive charts and visualizations",
              "Friend leaderboard integration",
              "Activity heatmap",
              "Responsive design improvements"
            ]}
          />

          <UpdateItem
            date="January 2025"
            title="Wiki System Launch"
            category="feature"
            description="Comprehensive fitness encyclopedia with evidence-based articles covering nutrition, exercise science, and training methods."
            highlights={[
              "6 knowledge domains",
              "Community contribution system",
              "Full search functionality",
              "Version history tracking"
            ]}
          />

          <UpdateItem
            date="December 2024"
            title="Landing Page & Hiscores"
            category="feature"
            description="New marketing website with interactive demo and live leaderboards."
            highlights={[
              "Hero section with app preview",
              "Live hiscores widget",
              "Activity feed",
              "Interactive demo mode"
            ]}
          />

          <UpdateItem
            date="December 2024"
            title="Initial Project Setup"
            category="improvement"
            description="Foundation setup with Next.js 16, React 19, and TypeScript. Modern app-like UI with sidebar navigation."
            highlights={[
              "Next.js 16 + React 19",
              "TypeScript setup",
              "Supabase integration",
              "Responsive sidebar navigation"
            ]}
          />
        </div>

        {/* Subscribe CTA */}
        <div className="mt-16 text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <h3 className="text-2xl font-bold text-ink mb-3">
            Want update notifications?
          </h3>
          <p className="text-ink-secondary mb-6">
            Follow our progress and be the first to know about new features.
          </p>
          <div className="text-sm text-ink-secondary">
            RSS feed and email notifications coming soon
          </div>
        </div>
      </div>
    </div>
  );
}

function UpdateItem({
  date,
  title,
  category,
  description,
  highlights
}: {
  date: string;
  title: string;
  category: 'feature' | 'improvement' | 'fix';
  description: string;
  highlights: string[];
}) {
  const categoryStyles = {
    feature: 'bg-blue-100 text-blue-700',
    improvement: 'bg-purple-100 text-purple-700',
    fix: 'bg-green-100 text-green-700'
  };

  const categoryLabels = {
    feature: 'New Feature',
    improvement: 'Improvement',
    fix: 'Bug Fix'
  };

  return (
    <div className="relative pl-8 pb-8 border-l-2 border-subtle last:border-l-0 last:pb-0">
      {/* Timeline dot */}
      <div className="absolute left-0 top-0 -translate-x-[9px] w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow" />

      <div className="bg-white rounded-xl p-6 shadow-sm border border-subtle hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-sm text-ink-secondary mb-1">{date}</div>
            <h3 className="text-2xl font-bold text-ink">{title}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${categoryStyles[category]}`}>
            {categoryLabels[category]}
          </span>
        </div>

        {/* Description */}
        <p className="text-ink-secondary mb-4">
          {description}
        </p>

        {/* Highlights */}
        {highlights.length > 0 && (
          <ul className="space-y-2">
            {highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-ink">
                <span className="text-blue-600 mt-0.5">•</span>
                {highlight}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
