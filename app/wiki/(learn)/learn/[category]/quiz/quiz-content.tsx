'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, ArrowLeft, LogIn } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { XP_PER_CORRECT } from '@/lib/quiz/constants'
import type { DifficultyLevel } from '@/lib/quiz/constants'
import type { QuizSubmitResponse } from '@/lib/quiz/types'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { QuizResults } from '@/components/quiz/QuizResults'

interface QuizContentProps {
  category: string
  sessionId: string
  difficulty: DifficultyLevel
}

interface QuestionData {
  id: string
  question_text: string
  options: string[]
  correct_option_index: number
  explanation: string
  article_link: string | null
}

interface StoredAnswer {
  question_id: string
  selected_option_index: number
}

export function QuizContent({ category, sessionId, difficulty }: QuizContentProps) {
  const isGuest = sessionId === 'guest'
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<StoredAnswer[]>([])
  const [currentResult, setCurrentResult] = useState<{
    selected_option_index: number
    correct_option_index: number
    is_correct: boolean
    explanation: string | null
    article_link: string | null
  } | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)
  const [submitResponse, setSubmitResponse] = useState<QuizSubmitResponse | null>(null)
  const [showGuestComplete, setShowGuestComplete] = useState(false)

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `/api/quiz/questions?category=${encodeURIComponent(category)}&difficulty=${difficulty}`
        )
        if (!res.ok) throw new Error('Failed to load questions')
        const data = await res.json()
        setQuestions(data.questions ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [category, difficulty])

  // Submit quiz (authenticated only)
  const submitQuiz = useCallback(
    async (allAnswers: StoredAnswer[]) => {
      if (isGuest) {
        setShowGuestComplete(true)
        return
      }

      setSubmitting(true)
      try {
        const res = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, answers: allAnswers }),
        })
        if (!res.ok) throw new Error('Failed to submit quiz')
        const data: QuizSubmitResponse = await res.json()
        setSubmitResponse(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit')
      } finally {
        setSubmitting(false)
      }
    },
    [sessionId, isGuest]
  )

  // Handle answering
  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      const question = questions[currentIndex]
      if (!question) return

      const newAnswer: StoredAnswer = {
        question_id: question.id,
        selected_option_index: selectedIndex,
      }

      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)

      // Show result immediately (we have correct_option_index)
      const isCorrect = selectedIndex === question.correct_option_index
      setCurrentResult({
        selected_option_index: selectedIndex,
        correct_option_index: question.correct_option_index,
        is_correct: isCorrect,
        explanation: isCorrect ? null : question.explanation,
        article_link: question.article_link,
      })

      // Auto-advance after delay (longer if wrong to read explanation)
      const delay = isCorrect ? 1200 : 2500
      setTimeout(() => {
        setCurrentResult(undefined)
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1)
        } else {
          submitQuiz(updatedAnswers)
        }
      }, delay)
    },
    [answers, currentIndex, questions, submitQuiz]
  )

  // Calculate local score
  const currentScore = answers.filter((a) => {
    const q = questions.find((question) => question.id === a.question_id)
    return q && a.selected_option_index === q.correct_option_index
  }).length

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-[#c8b86e] animate-spin" />
        <p className="text-[#9da6b9] text-sm">Loading questions...</p>
      </div>
    )
  }

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

  if (submitting) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-[#c8b86e] animate-spin" />
        <p className="text-[#9da6b9] text-sm">Submitting your answers...</p>
      </div>
    )
  }

  // Authenticated results
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

  // Guest completion
  if (showGuestComplete) {
    const total = questions.length
    const percentage = Math.round((currentScore / total) * 100)

    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 text-center"
        >
          <p className="text-3xl font-bold text-white mb-1">
            {currentScore}/{total}
          </p>
          <p className="text-[#9da6b9] text-sm mb-6">
            {percentage}% correct
          </p>

          <div className="border-t border-white/[0.06] pt-6">
            <p className="text-[#9da6b9] text-sm mb-4">
              Log in to save your score, earn XP, and track your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/login?redirect=/wiki/learn/${category.toLowerCase()}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8b86e] text-[#0A0A0B] text-sm font-semibold hover:bg-[#d4c478] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Log in
              </Link>
              <Link
                href={`/wiki/learn/${category.toLowerCase()}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.06] text-white text-sm font-medium hover:border-white/[0.12] transition-colors"
              >
                Try another quiz
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Active quiz
  const currentQuestion = questions[currentIndex]

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
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

      <AnimatePresence mode="wait">
        <QuizQuestion
          key={currentIndex}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          questionText={currentQuestion.question_text}
          options={currentQuestion.options}
          onAnswer={handleAnswer}
          result={currentResult}
        />
      </AnimatePresence>
    </div>
  )
}
