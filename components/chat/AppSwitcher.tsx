'use client'

import { cn } from '@/lib/utils'
import { Dumbbell, Wallet, Plane } from 'lucide-react'
import { DOMAINS, type DomainIconName } from '@/lib/domains'
import type { AppId } from './types'

// @ai-why: De lijst zelf stond hier tot TDR-0001 hardcoded en was daardoor
// onleesbaar voor de publieke homepage (niet geëxporteerd, 'use client',
// componentreferenties als data). Hij leeft nu in lib/domains.ts als pure data;
// deze map is het enige dat client-side moet blijven.
// @ai-sync: lib/domains.ts
const ICONS: Record<DomainIconName, React.ElementType> = {
  Dumbbell,
  Wallet,
  Plane,
}

interface AppSwitcherProps {
  activeApp: AppId
  onAppChange: (app: AppId) => void
}

export function AppSwitcher({ activeApp, onAppChange }: AppSwitcherProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {DOMAINS.map((app) => {
        const isActive = activeApp === (app.appId as AppId)
        const Icon = ICONS[app.icon]
        return (
          <button
            key={app.id}
            onClick={() => onAppChange(isActive ? 'home' : (app.appId as AppId))}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all',
              isActive
                ? 'bg-white/[0.08]'
                : 'hover:bg-white/[0.05]'
            )}
          >
            <Icon
              className="w-[18px] h-[18px] shrink-0"
              style={{ color: isActive ? app.color : 'rgba(255,255,255,0.4)' }}
            />
            <span
              className={cn(
                'text-[13px] font-medium',
                isActive ? 'text-white/90' : 'text-white/55'
              )}
            >
              {app.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
