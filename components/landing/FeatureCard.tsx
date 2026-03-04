import { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  screenshot?: string;
};

export function FeatureCard({ icon: Icon, title, description, screenshot }: Props) {
  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
      <Icon className="w-12 h-12 text-blue-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-ink-secondary">{description}</p>
      {screenshot && (
        <div className="mt-4 aspect-video bg-surface rounded" />
      )}
    </div>
  );
}
