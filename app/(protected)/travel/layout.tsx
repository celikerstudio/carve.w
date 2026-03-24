export default function TravelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-y-auto relative">
      {/* Subtle teal gradient glow for Travel section */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_rgba(184,216,232,0.08)_0%,_transparent_70%)] pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  )
}
