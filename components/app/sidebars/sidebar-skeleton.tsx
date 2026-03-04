export function SidebarSkeleton() {
  return (
    <div
      className="hidden lg:flex lg:flex-col h-full shrink-0 bg-surface pb-3"
      style={{ width: "64px" }}
      role="status"
      aria-label="Loading navigation"
    >
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {/* Group 1 */}
        <div className="mb-3">
          {/* Group label skeleton */}
          <div className="mb-1.5 flex items-center px-3">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <div className="w-2 h-0.5 bg-ink-muted animate-pulse rounded" />
            </div>
          </div>

          {/* Nav items skeleton */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 flex items-center rounded-lg px-3 py-1.5 mb-0.5"
            >
              <div className="h-5 w-5 bg-ink-muted animate-pulse rounded shrink-0" />
            </div>
          ))}
        </div>

        {/* Group 2 */}
        <div className="mb-3">
          <div className="mb-1.5 flex items-center px-3">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <div className="w-2 h-0.5 bg-ink-muted animate-pulse rounded" />
            </div>
          </div>

          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-9 flex items-center rounded-lg px-3 py-1.5 mb-0.5"
            >
              <div className="h-5 w-5 bg-ink-muted animate-pulse rounded shrink-0" />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
