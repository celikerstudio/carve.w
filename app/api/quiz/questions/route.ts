import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  QUIZ_CATEGORIES,
  DIFFICULTY_LEVELS,
  HUB_QUESTIONS_PER_QUIZ,
  ARTICLE_QUESTIONS_PER_QUIZ,
} from '@/lib/quiz/constants'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get('category')
  const difficulty = searchParams.get('difficulty')
  const articleSlug = searchParams.get('article_slug')

  // Validate required params
  if (!category || !difficulty) {
    return NextResponse.json(
      { error: 'Missing required params: category, difficulty' },
      { status: 400 }
    )
  }

  if (!QUIZ_CATEGORIES.includes(category as (typeof QUIZ_CATEGORIES)[number])) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  if (!DIFFICULTY_LEVELS.includes(difficulty as (typeof DIFFICULTY_LEVELS)[number])) {
    return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })
  }

  const supabase = await createClient()

  // Check if user is authenticated (optional for this endpoint)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Build the base query — strip correct_option_index and explanation from response
  let query = supabase
    .from('quiz_questions')
    .select('id, article_slug, category, difficulty, question_text, options, article_link')
    .eq('category', category)
    .eq('difficulty', difficulty)
    .eq('published', true)

  if (articleSlug) {
    query = query.eq('article_slug', articleSlug)
  }

  const { data: allQuestions, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!allQuestions || allQuestions.length === 0) {
    return NextResponse.json({ questions: [], total_available: 0 })
  }

  const totalAvailable = allQuestions.length
  const limit = articleSlug ? ARTICLE_QUESTIONS_PER_QUIZ : HUB_QUESTIONS_PER_QUIZ

  let selected: typeof allQuestions

  if (user) {
    // Prioritize questions the user hasn't correctly answered on first attempt
    const questionIds = allQuestions.map((q) => q.id)

    const { data: correctAttempts } = await supabase
      .from('quiz_attempts')
      .select('question_id')
      .eq('user_id', user.id)
      .eq('is_correct', true)
      .eq('is_first_attempt', true)
      .in('question_id', questionIds)

    const correctSet = new Set(correctAttempts?.map((a) => a.question_id) ?? [])

    // Shuffle each group independently, then concat unanswered-first
    const unanswered = shuffle(allQuestions.filter((q) => !correctSet.has(q.id)))
    const answered = shuffle(allQuestions.filter((q) => correctSet.has(q.id)))
    selected = [...unanswered, ...answered].slice(0, limit)
  } else {
    selected = shuffle(allQuestions).slice(0, limit)
  }

  return NextResponse.json({
    questions: selected,
    total_available: totalAvailable,
  })
}
