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
  { id: 'users', label: 'Users', icon: Users },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'advanced', label: 'Advanced', icon: Wrench },
];

interface SettingsMobileNavProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function SettingsMobileNav({
  activeSection,
  onNavigate
}: SettingsMobileNavProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-subtle px-4 py-3 lg:hidden">
      <h1 className="text-xl font-bold text-white mb-3">Settings</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeSection === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onNavigate(category.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors flex-shrink-0',
                isActive
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/5 text-ink-secondary hover:bg-white/10'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
