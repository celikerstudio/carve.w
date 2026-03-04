import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/ai/rate-limit'
import { XP_PER_CORRECT, type DifficultyLevel, type QuizCategory } from '@/lib/quiz/constants'
import { getRankTitle, getNextLevel, canUnlockNextLevel } from '@/lib/quiz/utils'
import type { QuizSubmitRequest, QuizSubmitResponse } from '@/lib/quiz/types'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Rate limit: 60 submissions per hour
  const { allowed, retryAfterMs } = checkRateLimit(user.id, 'quiz-submit', 60)
  if (!allowed) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
    })
  }

  // Parse and validate body
  let body: QuizSubmitRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { session_id, answers } = body

  if (!session_id || !answers || !Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json(
      { error: 'Missing required fields: session_id, answers' },
      { status: 400 }
    )
  }

  // Validate each answer has required fields
  for (const answer of answers) {
    if (!answer.question_id || answer.selected_option_index === undefined) {
      return NextResponse.json(
        { error: 'Each answer must have question_id and selected_option_index' },
        { status: 400 }
      )
    }
  }

  // Fetch session and validate ownership
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', session_id)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (session.completed_at) {
    return NextResponse.json({ error: 'Session already completed' }, { status: 400 })
  }

  // Fetch the actual questions for grading
  const questionIds = answers.map((a) => a.question_id)
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('id, correct_option_index, explanation, article_link, category, difficulty')
    .in('id', questionIds)

  if (questionsError || !questions || questions.length === 0) {
    return NextResponse.json({ error: 'Questions not found' }, { status: 404 })
  }

  const questionMap = new Map(questions.map((q) => [q.id, q]))

  // Check which questions this user has already attempted (for is_first_attempt)
  const { data: previousAttempts } = await supabase
    .from('quiz_attempts')
    .select('question_id')
    .eq('user_id', user.id)
    .in('question_id', questionIds)

  const previouslyAttemptedSet = new Set(previousAttempts?.map((a) => a.question_id) ?? [])

  // Grade answers
  const difficulty = session.difficulty as DifficultyLevel
  const xpPerCorrect = XP_PER_CORRECT[difficulty] ?? 0
  let score = 0
  let xpEarned = 0

  const results: QuizSubmitResponse['results'] = []
  const attemptRows: {
    session_id: string
    user_id: string
    question_id: string
    selected_option_index: number
    is_correct: boolean
    is_first_attempt: boolean
  }[] = []

  for (const answer of answers) {
    const question = questionMap.get(answer.question_id)
    if (!question) continue

    const isCorrect = answer.selected_option_index === question.correct_option_index
    const isFirstAttempt = !previouslyAttemptedSet.has(answer.question_id)

    if (isCorrect) {
      score++
      if (isFirstAttempt) {
        xpEarned += xpPerCorrect
      }
    }

    attemptRows.push({
      session_id,
      user_id: user.id,
      question_id: answer.question_id,
      selected_option_index: answer.selected_option_index,
      is_correct: isCorrect,
      is_first_attempt: isFirstAttempt,
    })

    results.push({
      question_id: answer.question_id,
      selected_option_index: answer.selected_option_index,
      correct_option_index: question.correct_option_index,
      is_correct: isCorrect,
      // Only show explanation for wrong answers
      explanation: isCorrect ? null : question.explanation,
      article_link: question.article_link,
    })
  }

  // Insert all attempt rows
  const { error: attemptError } = await supabase.from('quiz_attempts').insert(attemptRows)
  if (attemptError) {
    return NextResponse.json({ error: 'Failed to save attempts' }, { status: 500 })
  }

  // Update session with results
  const { error: sessionUpdateError } = await supabase
    .from('quiz_sessions')
    .update({
      score,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    })
    .eq('id', session_id)

  if (sessionUpdateError) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }

  // Award XP via RPC if earned
  if (xpEarned > 0) {
    await supabase.rpc('award_quiz_xp', {
      p_user_id: user.id,
      p_xp_amount: xpEarned,
    })
  }

  // Update user_knowledge for the session's category
  const category = session.category as QuizCategory
  let levelProgress: QuizSubmitResponse['level_progress'] = null

  const { data: existingKnowledge } = await supabase
    .from('user_knowledge')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', category)
    .single()

  if (existingKnowledge) {
    const newTotalCorrect = existingKnowledge.total_correct + score
    const newTotalAttempted = existingKnowledge.total_attempted + answers.length
    let newLevelCorrect = existingKnowledge.level_correct + score
    let newLevelAttempted = existingKnowledge.level_attempted + answers.length
    let currentLevel = existingKnowledge.current_level as DifficultyLevel
    let rankTitle = existingKnowledge.rank_title
    let unlockedNext = false

    // Check if user can unlock next level
    if (canUnlockNextLevel(newLevelCorrect, newLevelAttempted)) {
      const nextLevel = getNextLevel(currentLevel)
      if (nextLevel) {
        currentLevel = nextLevel
        rankTitle = getRankTitle(category, nextLevel)
        newLevelCorrect = 0
        newLevelAttempted = 0
        unlockedNext = true
      }
    }

    await supabase
      .from('user_knowledge')
      .update({
        total_correct: newTotalCorrect,
        total_attempted: newTotalAttempted,
        level_correct: newLevelCorrect,
        level_attempted: newLevelAttempted,
        current_level: currentLevel,
        rank_title: rankTitle,
        xp_earned: existingKnowledge.xp_earned + xpEarned,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('category', category)

    levelProgress = {
      category,
      current_level: currentLevel,
      rank_title: rankTitle,
      level_correct: newLevelCorrect,
      level_attempted: newLevelAttempted,
      unlocked_next: unlockedNext,
    }
  } else {
    // New knowledge entry — start at beginner
    const initialLevel: DifficultyLevel = 'beginner'
    const rankTitle = getRankTitle(category, initialLevel)

    await supabase.from('user_knowledge').insert({
      user_id: user.id,
      category,
      current_level: initialLevel,
      rank_title: rankTitle,
      total_correct: score,
      total_attempted: answers.length,
      level_correct: score,
      level_attempted: answers.length,
      streak: 0,
      best_streak: 0,
      xp_earned: xpEarned,
    })

    levelProgress = {
      category,
      current_level: initialLevel,
      rank_title: rankTitle,
      level_correct: score,
      level_attempted: answers.length,
      unlocked_next: false,
    }
  }

  const response: QuizSubmitResponse = {
    session_id,
    score,
    total: answers.length,
    xp_earned: xpEarned,
    results,
    level_progress: levelProgress,
  }

  return NextResponse.json(response)
}
