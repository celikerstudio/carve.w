import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { QUIZ_CATEGORIES } from '@/lib/quiz/constants'
import { CategoryQuizContent } from './category-quiz-content'

interface PageProps {
  params: Promise<{ category: string }>
}

function getValidCategory(slug: string): string | null {
  const match = QUIZ_CATEGORIES.find(
    (c) => c.toLowerCase() === slug.toLowerCase()
  )
  return match ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const valid = getValidCategory(category)
  if (!valid) return { title: 'Category Not Found' }

  return {
    title: `${valid} Quiz | Carve Wiki`,
    description: `Test your ${valid.toLowerCase()} knowledge with quizzes at beginner, intermediate, and expert levels.`,
  }
}

export default async function CategoryQuizPage({ params }: PageProps) {
  const { category } = await params
  const valid = getValidCategory(category)
  if (!valid) notFound()

  return <CategoryQuizContent category={valid} />
}
