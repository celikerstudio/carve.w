'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Loader2, Trophy, TrendingUp, LogIn } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/hooks'
import { ARTICLE_QUESTIONS_PER_QUIZ } from '@/lib/quiz/constants'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import type { QuizQuestion as QuizQuestionType, QuizSubmitResponse } from '@/lib/quiz/types'

type QuizPhase = 'cta' | 'loading' | 'quiz' | 'completed'

interface Answer {
  question_id: string
  selected_option_index: number
}

interface QuestionResult {
  selected_option_index: number
  correct_option_index: number
  is_correct: boolean
  explanation: string | null
  article_link: string | null
}

interface PostArticleQuizProps {
  articleSlug: string
  category: string
}

export function PostArticleQuiz({ articleSlug, category }: PostArticleQuizProps) {
  const { user } = useAuth()
  const [phase, setPhase] = useState<QuizPhase>('cta')
  const [questions, setQuestions] = useState<QuizQuestionType[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [results, setResults] = useState<Map<number, QuestionResult>>(new Map())
  const [submitResponse, setSubmitResponse] = useState<QuizSubmitResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestions = useCallback(async () => {
    setPhase('loading')
    setError(null)

    try {
      const params = new URLSearchParams({
        category,
        difficulty: 'beginner',
        article_slug: articleSlug,
      })

      const res = await fetch(`/api/quiz/questions?${params}`)
      if (!res.ok) throw new Error('Failed to load questions')

      const data = await res.json()
      if (!data.questions || data.questions.length === 0) {
        setError('No quiz questions available for this article yet.')
        setPhase('cta')
        return
      }

      setQuestions(data.questions)
      setCurrentIndex(0)
      setAnswers([])
      setResults(new Map())
      setPhase('quiz')
    } catch {
      setError('Could not load quiz. Please try again.')
      setPhase('cta')
    }
  }, [category, articleSlug])

  const handleAnswer = useCallback(
    async (selectedIndex: number) => {
      const question = questions[currentIndex]
      if (!question) return

      const newAnswer: Answer = {
        question_id: question.id,
        selected_option_index: selectedIndex,
      }

      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)

      // We show a temporary "answered" result based on the selected option
      // The correct_option_index isn't returned from the questions endpoint for security,
      // so we show a neutral "answered" state and reveal results after submission
      const tempResult: QuestionResult = {
        selected_option_index: selectedIndex,
        correct_option_index: -1, // unknown until submit
        is_correct: false,
        explanation: null,
        article_link: null,
      }
      setResults(new Map(results.set(currentIndex, tempResult)))

      // Auto-advance after a short delay
      const isLast = currentIndex >= questions.length - 1

      if (isLast) {
        // Submit the quiz
        setTimeout(() => submitQuiz(updatedAnswers), 800)
      } else {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1)
        }, 1200)
      }
    },
    [questions, currentIndex, answers, results],
  )

  const submitQuiz = async (finalAnswers: Answer[]) => {
    setPhase('loading')

    if (!user) {
      // For unauthenticated users, calculate a basic local score
      // (we don't have correct_option_index client-side, so just show completion)
      setPhase('completed')
      return
    }

    try {
      const supabase = createClient()

      // Create a quiz session
      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          category,
          difficulty: 'beginner',
          source: 'article',
          article_slug: articleSlug,
          total_questions: finalAnswers.length,
          xp_earned: 0,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (sessionError || !session) {
        throw new Error('Failed to create session')
      }

      // Submit answers
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          answers: finalAnswers,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit quiz')

      const data: QuizSubmitResponse = await res.json()
      setSubmitResponse(data)
      setPhase('completed')
    } catch {
      setError('Could not submit your answers. Please try again.')
      setPhase('quiz')
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-subtle">
      <AnimatePresence mode="wait">
        {/* CTA State */}
        {phase === 'cta' && (
          <motion.div
            key="cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center py-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#c8b86e]/10 flex items-center justify-center mb-4">
              <Brain className="w-7 h-7 text-[#c8b86e]" />
            </div>

            <h3 className="text-xl font-bold text-ink mb-2">
              Test Your Knowledge
            </h3>

            <p className="text-ink-secondary text-sm max-w-md mb-6 leading-relaxed">
              Answer {ARTICLE_QUESTIONS_PER_QUIZ} quick questions to reinforce what you just read.
              {user ? ' Earn XP and track your progress.' : ''}
            </p>

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button
              onClick={fetchQuestions}
              className={cn(
                'px-8 py-3 rounded-xl text-sm font-semibold transition-colors',
                'bg-[#c8b86e] text-black hover:bg-[#c8b86e]/90',
              )}
            >
              Start Quiz
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <Loader2 className="w-8 h-8 text-[#c8b86e] animate-spin" />
            <p className="text-ink-secondary text-sm mt-3">Loading questions...</p>
          </motion.div>
        )}

        {/* Quiz State */}
        {phase === 'quiz' && questions[currentIndex] && (
          <motion.div
            key={`question-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="py-4"
          >
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#c8b86e] transition-all duration-500 ease-out"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-ink-tertiary tabular-nums whitespace-nowrap">
                {currentIndex + 1}/{questions.length}
              </span>
            </div>

            <QuizQuestion
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              questionText={questions[currentIndex].question_text}
              options={questions[currentIndex].options}
              onAnswer={handleAnswer}
              result={results.get(currentIndex)}
            />
          </motion.div>
        )}

        {/* Completed State - Authenticated */}
        {phase === 'completed' && user && submitResponse && (
          <motion.div
            key="completed-auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center py-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Trophy className="w-12 h-12 text-[#c8b86e] mb-4" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-3xl font-bold text-ink tabular-nums"
            >
              {submitResponse.score}/{submitResponse.total}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-ink-secondary text-sm mt-1 mb-4"
            >
              {Math.round((submitResponse.score / submitResponse.total) * 100)}% correct
            </motion.p>

            {submitResponse.xp_earned > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8b86e]/10 border border-[#c8b86e]/20 mb-6"
              >
                <TrendingUp className="w-4 h-4 text-[#c8b86e]" />
                <span className="text-[#c8b86e] text-sm font-semibold">
                  +{submitResponse.xp_earned} XP
                </span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Link
                href="/quiz"
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  'border border-subtle text-ink hover:bg-surface',
                )}
              >
                Knowledge Hub
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* Completed State - Unauthenticated */}
        {phase === 'completed' && !user && (
          <motion.div
            key="completed-unauth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center py-8"
          >
            <Trophy className="w-12 h-12 text-[#c8b86e] mb-4" />

            <h3 className="text-xl font-bold text-ink mb-2">
              Quiz Complete!
            </h3>

            <p className="text-ink-secondary text-sm max-w-sm mb-6 leading-relaxed">
              Log in to save your score, earn XP, and track your learning progress.
            </p>

            <Link
              href="/login"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors',
                'bg-[#c8b86e] text-black hover:bg-[#c8b86e]/90',
              )}
            >
              <LogIn className="w-4 h-4" />
              Log in to save your score
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
