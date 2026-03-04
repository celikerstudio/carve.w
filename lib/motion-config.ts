// @ai-why: Centralized animation constants for the entire app.
// Matches Apple HIG feel — snappy springs, subtle easing.
// All components import from here for consistency.

export const SPRING = { type: 'spring' as const, stiffness: 400, damping: 30 }
export const SPRING_GENTLE = { type: 'spring' as const, stiffness: 260, damping: 20 }
export const EASE = [0.25, 0.1, 0.25, 1] as const
export const STAGGER = 0.04 // 40ms per item
