import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { QUIZ_CATEGORIES, DIFFICULTY_LEVELS } from '@/lib/quiz/constants'
import type { DifficultyLevel } from '@/lib/quiz/constants'
import { QuizContent } from './quiz-content'

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ session?: string; difficulty?: string }>
}

function getValidCategory(slug: string): string | null {
  const match = QUIZ_CATEGORIES.find(
    (c) => c.toLowerCase() === slug.toLowerCase()
  )
  return match ?? null
}

function getValidDifficulty(value: string | undefined): DifficultyLevel | null {
  if (!value) return null
  if ((DIFFICULTY_LEVELS as readonly string[]).includes(value)) {
    return value as DifficultyLevel
  }
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const valid = getValidCategory(category)
  if (!valid) return { title: 'Quiz Not Found' }

  return {
    title: `${valid} Quiz | Carve Wiki`,
    description: `Answer questions to test your ${valid.toLowerCase()} knowledge.`,
  }
}

export default async function QuizPage({ params, searchParams }: PageProps) {
  const { category } = await params
  const { session, difficulty } = await searchParams

  const validCategory = getValidCategory(category)
  if (!validCategory) notFound()

  const validDifficulty = getValidDifficulty(difficulty)
  if (!session || !validDifficulty) notFound()

  return (
    <QuizContent
      category={validCategory}
      sessionId={session}
      difficulty={validDifficulty}
    />
  )
}
