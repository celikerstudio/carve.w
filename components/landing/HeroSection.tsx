import { WaitlistForm } from './WaitlistForm';
import { ChevronDown } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center py-20">
        {/* Left: Text + CTA */}
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-ink leading-tight">
            One AI.
            <br />
            Your whole life.
          </h1>

          <p className="mt-6 text-xl text-ink-secondary leading-relaxed">
            Carve AI coaches you on fitness, finances, and travel — because life isn&apos;t just one thing.
          </p>

          <div className="mt-8 max-w-md">
            <WaitlistForm source="hero" />
          </div>

          <p className="mt-4 text-sm text-ink-secondary">
            Join the waitlist — it&apos;s free
          </p>
        </div>

        {/* Right: App Mockup */}
        <div className="relative">
          {/* TODO: Replace with actual app screenshot */}
          <div className="aspect-[9/19] max-w-xs mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl shadow-2xl flex items-center justify-center">
            <p className="text-ink-secondary font-semibold">App Preview</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-ink-tertiary" />
      </div>
    </section>
  );
}
