import {
  RANK_TITLES,
  LEVEL_UNLOCK_THRESHOLD,
  LEVEL_UNLOCK_MIN_QUESTIONS,
  DIFFICULTY_LEVELS,
  type QuizCategory,
  type DifficultyLevel,
} from './constants'

export function getRankTitle(category: QuizCategory, level: DifficultyLevel): string {
  return RANK_TITLES[category]?.[level] ?? ''
}

export function getNextLevel(current: DifficultyLevel): DifficultyLevel | null {
  const idx = DIFFICULTY_LEVELS.indexOf(current)
  if (idx === -1 || idx >= DIFFICULTY_LEVELS.length - 1) return null
  return DIFFICULTY_LEVELS[idx + 1]
}

export function canUnlockNextLevel(
  levelCorrect: number,
  levelAttempted: number,
): boolean {
  if (levelAttempted < LEVEL_UNLOCK_MIN_QUESTIONS) return false
  return levelCorrect / levelAttempted >= LEVEL_UNLOCK_THRESHOLD
}

export function categoryToSlug(category: string): string {
  return category.toLowerCase()
}

export function slugToCategory(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}
