'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
// @ai-why: Turbopack can't resolve subpath exports from symlinked local packages.
// Direct dist import bypasses the broken exports map resolution.
import { LabDashboard, LabSidebar } from '@celikerstudio/ui/dist/lab/index.js'
import type { LabNavGroup } from '@celikerstudio/ui/dist/lab/index.js'
import {
  FlaskConical, Palette, Layout, Component,
  Paintbrush,
} from 'lucide-react'

const groups: LabNavGroup[] = [
  {
    label: 'Lab',
    items: [
      { title: 'Overview',   href: '/lab',            icon: FlaskConical, description: 'Lab overview' },
      { title: 'Brand',      href: '/lab/brand',      icon: Palette,      description: 'Brand identity' },
      { title: 'Pages',      href: '/lab/pages',      icon: Layout,       description: 'Page designs' },
      { title: 'Components', href: '/lab/components', icon: Component,    description: 'UI components' },
      { title: 'Tokens',     href: '/lab/tokens',     icon: Paintbrush,   description: 'Design tokens' },
    ],
  },
]

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <LabDashboard
      title="Carve Lab"
      collapsedTitle="CW"
      renderTitleLink={({ className, children: content }) => (
        <Link href="/lab" className={className}>{content}</Link>
      )}
      renderBackLink={({ className, children: content }) => (
        <Link href="/" className={className}>{content}</Link>
      )}
      sidebar={
        <LabSidebar
          groups={groups}
          activePath={pathname}
          renderLink={({ href, children: content, className }) => (
            <Link href={href} className={className}>{content}</Link>
          )}
        />
      }
    >
      {children}
    </LabDashboard>
  )
}
