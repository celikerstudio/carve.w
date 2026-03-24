export default function MoneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-y-auto relative">
      {/* Subtle green gradient glow for Money section */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08)_0%,_transparent_70%)] pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  )
}
