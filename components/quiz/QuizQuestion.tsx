'use client'

import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface QuizQuestionResult {
  selected_option_index: number
  correct_option_index: number
  is_correct: boolean
  explanation: string | null
  article_link: string | null
}

interface QuizQuestionProps {
  questionNumber: number
  totalQuestions: number
  questionText: string
  options: string[]
  onAnswer: (selectedIndex: number) => void
  result?: QuizQuestionResult
}

const LETTERS = ['A', 'B', 'C', 'D']

export function QuizQuestion({
  questionNumber,
  totalQuestions,
  questionText,
  options,
  onAnswer,
  result,
}: QuizQuestionProps) {
  const answered = !!result

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Question label */}
      <p className="text-[13px] font-semibold text-[#9da6b9] uppercase tracking-wider">
        Question {questionNumber} of {totalQuestions}
      </p>

      {/* Question text */}
      <h2 className="text-xl font-bold text-white leading-relaxed">
        {questionText}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = result?.selected_option_index === index
          const isCorrect = result?.correct_option_index === index
          const isWrong = answered && isSelected && !result.is_correct

          // Determine option state for styling
          let optionState: 'default' | 'correct' | 'wrong' | 'faded' = 'default'
          if (answered) {
            if (isCorrect) optionState = 'correct'
            else if (isWrong) optionState = 'wrong'
            else optionState = 'faded'
          }

          return (
            <motion.button
              key={index}
              onClick={() => !answered && onAnswer(index)}
              disabled={answered}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300',
                // Default (unanswered) state
                optionState === 'default' && [
                  'bg-[#1c1f27] border-white/[0.06]',
                  'hover:border-[#c8b86e]/50 hover:bg-[#c8b86e]/5 cursor-pointer',
                ],
                // Correct
                optionState === 'correct' && 'bg-emerald-500/10 border-emerald-500/40',
                // Wrong selected
                optionState === 'wrong' && 'bg-red-500/10 border-red-500/40',
                // Faded (other options after answer)
                optionState === 'faded' && 'bg-[#1c1f27]/50 border-white/[0.03] opacity-40',
              )}
            >
              {/* Letter badge or result icon */}
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors duration-300',
                  optionState === 'default' && 'bg-white/[0.06] text-[#9da6b9]',
                  optionState === 'correct' && 'bg-emerald-500/20 text-emerald-400',
                  optionState === 'wrong' && 'bg-red-500/20 text-red-400',
                  optionState === 'faded' && 'bg-white/[0.04] text-[#7a8299]',
                )}
              >
                {answered && isCorrect ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : answered && isWrong ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  LETTERS[index]
                )}
              </div>

              {/* Option text */}
              <span
                className={cn(
                  'text-[15px] leading-snug transition-colors duration-300',
                  optionState === 'default' && 'text-white',
                  optionState === 'correct' && 'text-emerald-200',
                  optionState === 'wrong' && 'text-red-200',
                  optionState === 'faded' && 'text-[#7a8299]',
                )}
              >
                {option}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Explanation after answering */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            {result.is_correct ? (
              /* Correct answer reinforcement */
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-300 font-semibold text-sm">
                    Correct!
                  </span>
                </div>
                {result.explanation && (
                  <p className="text-emerald-200/70 text-sm mt-2 leading-relaxed">
                    {result.explanation}
                  </p>
                )}
              </div>
            ) : (
              /* Wrong answer explanation */
              <div className="rounded-xl border border-[#c8b86e]/20 bg-[#c8b86e]/[0.07] p-4 space-y-3">
                {result.explanation && (
                  <p className="text-[#c8b86e]/90 text-sm leading-relaxed">
                    {result.explanation}
                  </p>
                )}
                {result.article_link && (
                  <Link
                    href={result.article_link}
                    className="inline-flex items-center gap-2 text-[#c8b86e] text-sm font-medium hover:text-[#c8b86e]/80 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Read more
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
