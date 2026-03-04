'use client'

// @ai-why: Count-up animation for stat card numbers (0 → 847).
// Uses motion/react useSpring for physics-based interpolation.
// Triggered on viewport entry. Respects prefers-reduced-motion.

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  decimals?: number
  className?: string
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 0.8,
  decimals = 0,
  className,
}: AnimatedNumberProps) {
  const prefersReduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-20px' })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  })

  useEffect(() => {
    if (isInView && !prefersReduced) {
      motionValue.set(value)
    } else if (prefersReduced) {
      motionValue.jump(value)
    }
  }, [isInView, value, prefersReduced, motionValue])

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      if (ref.current) {
        const formatted = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString()
        ref.current.textContent = `${prefix}${formatted}${suffix}`
      }
    })
    return unsubscribe
  }, [spring, prefix, suffix, decimals])

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()

  return (
    <span ref={ref} className={className}>
      {prefersReduced ? `${prefix}${display}${suffix}` : `${prefix}0${suffix}`}
    </span>
  )
}
