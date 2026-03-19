'use client'

import { cn } from '@/lib/utils'
import { Dumbbell, Wallet, Plane, Mail } from 'lucide-react'
import type { AppId } from './types'

interface AppDef {
  id: AppId
  label: string
  icon: React.ElementType
  color: string
  activeBg: string
  stat?: string
  badge?: number
}

const apps: AppDef[] = [
  { id: 'health', label: 'Health', icon: Dumbbell, color: '#22c55e', activeBg: 'rgba(34,197,94,0.12)', stat: '2/4 workouts' },
  { id: 'money', label: 'Money', icon: Wallet, color: '#3b82f6', activeBg: 'rgba(59,130,246,0.12)', stat: '€760 remaining' },
  { id: 'life', label: 'Life', icon: Plane, color: '#a855f7', activeBg: 'rgba(168,85,247,0.12)', stat: 'Barcelona in 3d' },
  { id: 'inbox', label: 'Inbox', icon: Mail, color: '#f59e0b', activeBg: 'rgba(245,158,11,0.12)', stat: '2 need attention', badge: 2 },
]

interface AppSwitcherProps {
  activeApp: AppId
  onAppChange: (app: AppId) => void
}

export function AppSwitcher({ activeApp, onAppChange }: AppSwitcherProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25 px-3 mb-1">Apps</p>
      {apps.map((app) => {
        const isActive = activeApp === app.id
        const Icon = app.icon
        return (
          <button
            key={app.id}
            onClick={() => onAppChange(app.id)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all relative',
              isActive
                ? 'border border-white/[0.08]'
                : 'hover:bg-white/[0.03]'
            )}
            style={isActive ? { background: app.activeBg } : undefined}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: isActive ? `${app.color}20` : 'rgba(255,255,255,0.06)' }}
            >
              <Icon
                className="w-3.5 h-3.5"
                style={{ color: isActive ? app.color : 'rgba(255,255,255,0.4)' }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-[11px] font-medium truncate',
                  isActive ? 'text-white' : 'text-white/60'
                )}
                style={isActive ? { color: app.color } : undefined}
              >
                {app.label}
              </p>
              {app.stat && (
                <p className="text-[9px] text-white/25 truncate">{app.stat}</p>
              )}
            </div>
            {app.badge && app.badge > 0 && (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background: app.color }}
              >
                <span className="text-[9px] font-bold text-black">{app.badge}</span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
