'use client';

import {
  Settings,
  Users,
  FileText,
  Bell,
  Shield,
  Plug,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: SettingsCategory[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'advanced', label: 'Advanced', icon: Wrench },
];

interface SettingsNavProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function SettingsNav({ activeSection, onNavigate }: SettingsNavProps) {
  return (
    <nav className="sticky top-0 h-screen overflow-y-auto p-6 border-r border-subtle">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <ul className="space-y-1">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeSection === category.id;

          return (
            <li key={category.id}>
              <button
                onClick={() => onNavigate(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                  'hover:bg-white/5',
                  isActive && 'bg-white/5 font-semibold border-l-2 border-amber-500',
                  !isActive && 'text-ink-secondary'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5',
                  isActive ? 'text-amber-500' : 'text-slate-500'
                )} />
                <span>{category.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
