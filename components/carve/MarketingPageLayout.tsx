'use client';

import { MarketingSidebar } from './MarketingSidebar';

interface MarketingPageLayoutProps {
  page: string;
  children: React.ReactNode;
}

export function MarketingPageLayout({ page, children }: MarketingPageLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white">
      {/* Mobile: sidebar above content */}
      <div className="lg:hidden pt-8 pb-4 px-6 border-b border-white/[0.04]">
        <MarketingSidebar page={page} />
      </div>

      {/* Desktop: 2-column layout */}
      <div className="flex">
        {/* Left column: marketing content */}
        <div className="w-full lg:w-[65%]">
          {children}
        </div>

        {/* Right column: sticky sidebar */}
        <div className="hidden lg:block lg:w-[35%] border-l border-white/[0.04]">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <MarketingSidebar page={page} />
          </div>
        </div>
      </div>
    </div>
  );
}
