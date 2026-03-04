import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  imagePosition?: 'left' | 'right';
  gradient?: string;
}

export function DetailedFeatureSection({
  icon: Icon,
  title,
  description,
  features,
  imagePosition = 'right',
  gradient = 'from-blue-500 to-purple-600',
}: Props) {
  const mockupContent = (
    <div className="relative">
      {/* Phone Mockup */}
      <div className="aspect-[9/19] max-w-xs mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl p-3 border-8 border-gray-900">
        <div className={`w-full h-full bg-gradient-to-br ${gradient} rounded-[2rem] flex items-center justify-center relative overflow-hidden`}>
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 flex items-center justify-between px-6 text-white text-xs">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-white/30 rounded-full" />
              <div className="w-4 h-4 bg-white/30 rounded-full" />
              <div className="w-4 h-4 bg-white/30 rounded-full" />
            </div>
          </div>

          {/* Content Area */}
          <div className="text-white text-center px-6">
            <Icon className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <p className="text-sm font-semibold opacity-80">
              {title}
            </p>
          </div>

          {/* Bottom Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );

  const textContent = (
    <div className="flex flex-col justify-center">
      <div className="inline-flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-ink">{title}</h2>
      </div>

      <p className="text-xl text-ink-secondary mb-8 leading-relaxed">
        {description}
      </p>

      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`w-6 h-6 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-ink text-lg">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {imagePosition === 'left' ? (
        <>
          {mockupContent}
          {textContent}
        </>
      ) : (
        <>
          {textContent}
          {mockupContent}
        </>
      )}
    </div>
  );
}
