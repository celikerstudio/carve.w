'use client'

import Link from 'next/link'
import { ArrowRight, Dumbbell, Wallet, Plane } from 'lucide-react'
import { track } from '@/lib/analytics'
import type { DomainIconName } from '@/lib/domains'

// @ai-gotcha: De icoon-map moet hier staan en niet in de server component die
// deze kaart rendert. Een componentreferentie is niet serialiseerbaar over de
// server/client-grens; dat geeft een 500 zodra je hem als prop meegeeft. Daarom
// draagt lib/domains.ts een icoon-náám en niet het component zelf.
// @ai-sync: lib/domains.ts
const ICONS: Record<DomainIconName, React.ElementType> = { Dumbbell, Wallet, Plane }

interface DomainCardLinkProps {
  id: string
  label: string
  blurb: string
  color: string
  icon: DomainIconName
  delay: number
}

// @ai-why: De kaart is een <Link> en geen <button>. TDR-0001 beslissing 9 vraagt
// echte knoppen in plaats van divs met onClick; bij ilvlup is dat een button omdat
// de kaart daar een router.push binnen dezelfde pagina doet. Hier is het navigatie
// naar een URL, en dan is een anchor correcter: rechtermuisknop, nieuw tabblad en
// de statusbalk werken dan gewoon.
//
// @ai-todo: `href` is het terugvalpad uit TDR-0001 beslissing 5. Zodra TDR-0002
// landt wordt dit /demo?d=<id>, en verandert de proof-regel in DomainPicker mee.
export function DomainCardLink({ id, label, blurb, color, icon, delay }: DomainCardLinkProps) {
  const Icon = ICONS[icon]
  return (
    <Link
      href={`/signup?start=${id}`}
      onClick={() => track('home_card_click', { domain: id })}
      style={{ animationDelay: `${delay}s` }}
      className="carve-fade-up group relative flex items-center gap-4 w-full p-[17px] rounded-2xl
                 bg-[#141415] border border-[#262626]
                 transition-[border-color,transform] duration-300 hover:-translate-y-0.5
                 motion-reduce:hover:translate-y-0
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]"
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${color} 32%, transparent)` }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '' }}
    >
      <span
        className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
      >
        <Icon className="w-[21px] h-[21px]" strokeWidth={1.6} aria-hidden="true" />
      </span>

      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* @ai-why: h2 en niet h3 — de kop van de pagina is de enige h1, dus de
            kaarten zijn het eerstvolgende niveau. */}
        <h2 className="text-[15.5px] font-semibold text-[#fafafa] tracking-[-0.01em]">{label}</h2>
        <span className="text-[13.5px] text-white/40 leading-snug">{blurb}</span>
      </span>

      <span
        aria-hidden="true"
        className="w-[30px] h-[30px] shrink-0 rounded-full bg-white/[0.05] text-white/50
                   flex items-center justify-center
                   opacity-0 -translate-x-1.5 transition-all duration-300
                   group-hover:opacity-100 group-hover:translate-x-0
                   group-focus-visible:opacity-100 group-focus-visible:translate-x-0
                   motion-reduce:transition-none motion-reduce:translate-x-0"
      >
        <ArrowRight className="w-[15px] h-[15px]" />
      </span>
    </Link>
  )
}
