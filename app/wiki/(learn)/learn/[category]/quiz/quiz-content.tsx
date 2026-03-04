'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { DifficultyLevel } from '@/lib/quiz/constants'
import type { QuizQuestion as QuizQuestionType, QuizSubmitResponse } from '@/lib/quiz/types'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { QuizResults } from '@/components/quiz/QuizResults'

interface QuizContentProps {
  category: string
  sessionId: string
  difficulty: DifficultyLevel
}

interface StoredAnswer {
  question_id: string
  selected_option_index: number
}

export function QuizContent({ category, sessionId, difficulty }: QuizContentProps) {
  const [questions, setQuestions] = useState<QuizQuestionType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<StoredAnswer[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitResponse, setSubmitResponse] = useState<QuizSubmitResponse | null>(null)

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `/api/quiz/questions?category=${encodeURIComponent(category)}&difficulty=${difficulty}`
        )
        if (!res.ok) {
          throw new Error('Failed to load questions')
        }
        const data = await res.json()
        setQuestions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [category, difficulty])

  // Submit all answers
  const submitQuiz = useCallback(
    async (allAnswers: StoredAnswer[]) => {
      setSubmitting(true)
      try {
        const res = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            answers: allAnswers,
          }),
        })
        if (!res.ok) {
          throw new Error('Failed to submit quiz')
        }
        const data: QuizSubmitResponse = await res.json()
        setSubmitResponse(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit')
      } finally {
        setSubmitting(false)
      }
    },
    [sessionId]
  )

  // Handle answering a question
  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      const currentQuestion = questions[currentIndex]
      if (!currentQuestion) return

      const newAnswer: StoredAnswer = {
        question_id: currentQuestion.id,
        selected_option_index: selectedIndex,
      }

      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)

      // Auto-advance or submit after a delay
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1)
        } else {
          // Last question — submit
          submitQuiz(updatedAnswers)
        }
      }, 300)
    },
    [answers, currentIndex, questions, submitQuiz]
  )

  // Current question result for display (if already answered)
  const currentQuestionResult = (() => {
    const currentQuestion = questions[currentIndex]
    if (!currentQuestion) return undefined

    const answer = answers.find((a) => a.question_id === currentQuestion.id)
    if (!answer) return undefined

    return {
      selected_option_index: answer.selected_option_index,
      correct_option_index: currentQuestion.correct_option_index,
      is_correct: answer.selected_option_index === currentQuestion.correct_option_index,
      explanation: currentQuestion.explanation,
      article_link: currentQuestion.article_link,
    }
  })()

  // Score so far
  const currentScore = answers.filter((a) => {
    const q = questions.find((question) => question.id === a.question_id)
    return q && a.selected_option_index === q.correct_option_index
  }).length

  // Loading state
  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-[#c8b86e] animate-spin" />
        <p className="text-[#9da6b9] text-sm">Loading questions...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-red-300 font-medium">{error}</p>
        <Link
          href={`/wiki/learn/${category.toLowerCase()}`}
          className="text-[#9da6b9] text-sm hover:text-white transition-colors"
        >
          Back to {category}
        </Link>
      </div>
    )
  }

  // No questions available
  if (questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center gap-4 text-center">
        <p className="text-[#9da6b9]">No questions available for this category and difficulty.</p>
        <Link
          href={`/wiki/learn/${category.toLowerCase()}`}
          className="text-[#c8b86e] text-sm font-medium hover:text-[#c8b86e]/80 transition-colors"
        >
          Go back
        </Link>
      </div>
    )
  }

  // Submitting state
  if (submitting) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-[#c8b86e] animate-spin" />
        <p className="text-[#9da6b9] text-sm">Submitting your answers...</p>
      </div>
    )
  }

  // Results state
  if (submitResponse) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <QuizResults response={submitResponse} category={category} />
        </motion.div>

        {/* Back to category link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <Link
            href={`/wiki/learn/${category.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-[#9da6b9] text-sm hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {category}
          </Link>
        </motion.div>
      </div>
    )
  }

  // Active quiz state
  const currentQuestion = questions[currentIndex]

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/wiki/learn/${category.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-[#9da6b9] text-sm hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit
          </Link>
          <span
            className={cn(
              'text-xs font-medium px-3 py-1 rounded-full',
              'bg-[#c8b86e]/10 text-[#c8b86e] border border-[#c8b86e]/20'
            )}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>

        <QuizProgress
          current={answers.length}
          total={questions.length}
          score={currentScore}
        />
      </motion.div>

      {/* Question with animated transitions */}
      <AnimatePresence mode="wait">
        <QuizQuestion
          key={currentIndex}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          questionText={currentQuestion.question_text}
          options={currentQuestion.options}
          onAnswer={handleAnswer}
          result={currentQuestionResult}
        />
      </AnimatePresence>
    </div>
  )
}
