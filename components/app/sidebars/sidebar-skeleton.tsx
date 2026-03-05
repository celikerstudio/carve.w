export function SidebarSkeleton() {
  return (
    <div
      className="hidden lg:flex lg:flex-col h-full shrink-0 bg-surface"
      style={{ width: "52px" }}
      role="status"
      aria-label="Loading navigation"
    >
      <nav className="flex-1 px-1.5 pt-2 overflow-y-auto">
        {/* Group 1 */}
        <div className="mb-1.5">
          {/* Group divider */}
          <div className="flex items-center justify-center mb-1 h-4">
            <div className="w-3 h-px bg-ink-muted animate-pulse" />
          </div>

          {/* Nav items */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-9 mx-auto flex items-center justify-center rounded-md mb-0.5"
            >
              <div className="h-5 w-5 bg-ink-muted animate-pulse rounded" />
            </div>
          ))}
        </div>

        {/* Group 2 */}
        <div className="mb-1.5">
          <div className="flex items-center justify-center mb-1 h-4">
            <div className="w-3 h-px bg-ink-muted animate-pulse" />
          </div>

          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-9 w-9 mx-auto flex items-center justify-center rounded-md mb-0.5"
            >
              <div className="h-5 w-5 bg-ink-muted animate-pulse rounded" />
            </div>
          ))}
        </div>

        {/* Group 3 */}
        <div className="mb-1.5">
          <div className="flex items-center justify-center mb-1 h-4">
            <div className="w-3 h-px bg-ink-muted animate-pulse" />
          </div>

          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-9 w-9 mx-auto flex items-center justify-center rounded-md mb-0.5"
            >
              <div className="h-5 w-5 bg-ink-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
