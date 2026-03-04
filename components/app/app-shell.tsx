"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import React from "react";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  hasGlobalHeader?: boolean;
  headerHeight?: number;
  disablePageScroll?: boolean;
  isDark?: boolean;
}

export function AppShell({
  children,
  className,
  hasGlobalHeader = false,
  headerHeight = 56,
  disablePageScroll = true,
  isDark = false,
}: AppShellProps) {
  React.useEffect(() => {
    if (disablePageScroll) {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100dvh';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100dvh';
    }
    return () => {
      if (disablePageScroll) {
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        document.body.style.overflow = '';
        document.body.style.height = '';
      }
    };
  }, [disablePageScroll]);

  return (
    <div
      className={cn(
        "flex flex-col w-full h-full overflow-hidden",
        "bg-surface text-white",
        "relative z-10",
        className
      )}
      role="main"
      aria-label="App application"
    >
      {children}
    </div>
  );
}

interface AppBodyProps {
  children: ReactNode;
  className?: string;
}

export function AppBody({
  children,
  className,
}: AppBodyProps) {
  return (
    <div
      className={cn(
        "flex flex-1 min-h-0 overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AppContentProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  useFixedHeight?: boolean;
  isDark?: boolean;
}

export function AppContent({
  children,
  className,
  padded = true,
  useFixedHeight = true,
  isDark = false,
}: AppContentProps) {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col min-h-0",
        useFixedHeight
          ? "h-full overflow-y-auto scrollbar-auto-hide"
          : "min-h-full",
        "bg-surface text-white rounded-tl-xl",
        "overflow-hidden",
        "m-0",
        className
      )}
      role="main"
      aria-label="Main content area"
    >
      <section
        className="w-full h-full flex flex-col flex-1 min-h-0 [&>*]:flex-1 [&>*]:w-full"
      >
        {children}
      </section>
    </main>
  );
}

interface AppPageProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function AppPage({
  children,
  className,
  title,
}: AppPageProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full w-full overflow-hidden",
        className
      )}
      role="region"
      aria-label={title ? `${title} page` : "App page"}
    >
      {children}
    </div>
  );
}
