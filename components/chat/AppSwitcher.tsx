'use client'

import { cn } from '@/lib/utils'
import { Dumbbell, Wallet, Plane, Mail } from 'lucide-react'
import type { AppId } from './types'

interface AppDef {
  id: AppId
  label: string
  icon: React.ElementType
  color: string
}

const apps: AppDef[] = [
  { id: 'health', label: 'Health', icon: Dumbbell, color: '#22c55e' },
  { id: 'money', label: 'Money', icon: Wallet, color: '#3b82f6' },
  { id: 'life', label: 'Life', icon: Plane, color: '#a855f7' },
  // @ai-todo: re-enable inbox when ready
  // { id: 'inbox', label: 'Inbox', icon: Mail, color: '#f59e0b' },
]

interface AppSwitcherProps {
  activeApp: AppId
  onAppChange: (app: AppId) => void
}

export function AppSwitcher({ activeApp, onAppChange }: AppSwitcherProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {apps.map((app) => {
        const isActive = activeApp === app.id
        const Icon = app.icon
        return (
          <button
            key={app.id}
            onClick={() => onAppChange(isActive ? 'home' : app.id)}
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
