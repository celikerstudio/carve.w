'use client'

// @ai-why: Staggered fade-up entry for list items.
// Wraps each child in a motion.div with delay based on index.
// Respects prefers-reduced-motion — renders children directly when enabled.

import { Children, type ReactNode, useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SPRING_GENTLE, STAGGER } from '@/lib/motion-config'

interface AnimatedListProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

export function AnimatedList({ children, staggerDelay = STAGGER, className }: AnimatedListProps) {
  const prefersReduced = useReducedMotion()
  const id = useId()
  const items = Children.toArray(children)

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: staggerDelay }}
    >
      {items.map((child, i) => (
        <motion.div key={`${id}-${i}`} variants={itemVariants} transition={SPRING_GENTLE}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
