export const QUIZ_CATEGORIES = [
  'Training', 'Nutrition', 'Supplements', 'Recovery', 'Mindset', 'Money', 'Travel'
] as const

export type QuizCategory = typeof QUIZ_CATEGORIES[number]

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'expert'] as const
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]

export const XP_PER_CORRECT: Record<DifficultyLevel, number> = {
  beginner: 10,
  intermediate: 25,
  expert: 50,
}

export const LEVEL_UNLOCK_THRESHOLD = 0.8
export const LEVEL_UNLOCK_MIN_QUESTIONS = 20

export const RANK_TITLES: Record<QuizCategory, Record<DifficultyLevel, string>> = {
  Training:    { beginner: 'Rookie',   intermediate: 'Coach',        expert: 'Personal Trainer' },
  Nutrition:   { beginner: 'Foodie',   intermediate: 'Nutritionist', expert: 'Dietitian' },
  Supplements: { beginner: 'Curious',  intermediate: 'Informed',     expert: 'Specialist' },
  Recovery:    { beginner: 'Starter',  intermediate: 'Practitioner', expert: 'Recovery Pro' },
  Mindset:     { beginner: 'Learner',  intermediate: 'Mentor',       expert: 'Psychologist' },
  Money:       { beginner: 'Saver',    intermediate: 'Advisor',      expert: 'Financial Planner' },
  Travel:      { beginner: 'Tourist',  intermediate: 'Explorer',     expert: 'World Traveler' },
}

export const MASTER_TITLE = 'Carve Master'

export const HUB_QUESTIONS_PER_QUIZ = 10
export const ARTICLE_QUESTIONS_PER_QUIZ = 5
