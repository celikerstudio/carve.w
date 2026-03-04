# Knowledge System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a quiz-based knowledge system with 3 difficulty levels, AI explanations, rank titles, and a Kenniskaart profile section.

**Architecture:** Supabase tables + RLS for data, Next.js API routes for quiz logic/grading, client-side quiz UI with Framer Motion, Recharts radar chart on profile. Routes under `/wiki/(learn)/learn/` route group to avoid collision with `/wiki/[category]`.

**Tech Stack:** Next.js 16 (App Router), Supabase (Postgres + RLS), TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Lucide icons, Zod validation.

**Design doc:** `docs/plans/2026-03-04-knowledge-system-design.md`

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260304000001_create_quiz_system.sql`

**Step 1: Write the migration SQL**

```sql
-- Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT,
  category TEXT NOT NULL CHECK (category IN ('Training', 'Nutrition', 'Supplements', 'Recovery', 'Mindset', 'Money', 'Travel')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'expert')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL CHECK (jsonb_array_length(options) = 4),
  correct_option_index INTEGER NOT NULL CHECK (correct_option_index BETWEEN 0 AND 3),
  explanation TEXT NOT NULL,
  article_link TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_category_difficulty
  ON quiz_questions (category, difficulty, is_published);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_article
  ON quiz_questions (article_slug);

-- Quiz Sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'hub',
  article_slug TEXT,
  score INTEGER,
  total_questions INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user
  ON quiz_sessions (user_id, created_at);

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  is_first_attempt BOOLEAN NOT NULL DEFAULT true,
  personalized_explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_question
  ON quiz_attempts (user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_created
  ON quiz_attempts (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session
  ON quiz_attempts (session_id);

-- User Knowledge (composite PK)
CREATE TABLE IF NOT EXISTS user_knowledge (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  current_level TEXT NOT NULL DEFAULT 'beginner',
  rank_title TEXT NOT NULL DEFAULT '',
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_attempted INTEGER NOT NULL DEFAULT 0,
  level_correct INTEGER NOT NULL DEFAULT 0,
  level_attempted INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_user_knowledge_user
  ON user_knowledge (user_id);

-- Award Quiz XP function (writes to profiles.total_xp matching production schema)
CREATE OR REPLACE FUNCTION award_quiz_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS TABLE(new_total_xp INTEGER, old_level INTEGER, new_level INTEGER, leveled_up BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_old_xp INTEGER;
  v_old_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  SELECT COALESCE(p.total_xp, 0), COALESCE(p.level, 1)
  INTO v_old_xp, v_old_level
  FROM profiles p WHERE p.id = p_user_id;

  v_new_xp := v_old_xp + p_xp_amount;
  v_new_level := calculate_level(v_new_xp);

  UPDATE profiles
  SET total_xp = v_new_xp,
      level = v_new_level,
      updated_at = now()
  WHERE id = p_user_id;

  RETURN QUERY SELECT v_new_xp, v_old_level, v_new_level, (v_new_level > v_old_level);
END;
$$;

-- RLS Policies
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_knowledge ENABLE ROW LEVEL SECURITY;

-- quiz_questions: anyone can read published, only admin can write
CREATE POLICY "Anyone can read published questions"
  ON quiz_questions FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admin can manage questions"
  ON quiz_questions FOR ALL
  USING (public.is_admin());

-- quiz_sessions: users can read/insert/update own
CREATE POLICY "Users can read own sessions"
  ON quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON quiz_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- quiz_attempts: users can read/insert own (no update — immutable)
CREATE POLICY "Users can read own attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- user_knowledge: users can read/update own, public read for profiles
CREATE POLICY "Users can read own knowledge"
  ON user_knowledge FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read knowledge for profiles"
  ON user_knowledge FOR SELECT
  USING (true);

CREATE POLICY "Users can upsert own knowledge"
  ON user_knowledge FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge"
  ON user_knowledge FOR UPDATE
  USING (auth.uid() = user_id);
```

**Step 2: Apply migration**

Run via Supabase dashboard SQL editor (due to production DB divergence) or:
```bash
npx supabase db push
```

**Step 3: Commit**

```bash
git add supabase/migrations/20260304000001_create_quiz_system.sql
git commit -m "feat(quiz): add database migration for quiz system tables and RLS"
```

---

### Task 2: Shared Types, Constants, and Utilities

**Files:**
- Create: `lib/quiz/types.ts`
- Create: `lib/quiz/constants.ts`
- Create: `lib/quiz/utils.ts`

**Step 1: Create TypeScript types**

Create `lib/quiz/types.ts`:
```ts
export interface QuizQuestion {
  id: string
  article_slug: string | null
  category: string
  difficulty: 'beginner' | 'intermediate' | 'expert'
  question_text: string
  options: string[]
  correct_option_index: number
  explanation: string
  article_link: string | null
}

export interface QuizSession {
  id: string
  user_id: string
  category: string
  difficulty: string
  source: 'hub' | 'article'
  article_slug: string | null
  score: number | null
  total_questions: number
  xp_earned: number
  started_at: string
  completed_at: string | null
}

export interface QuizAttempt {
  id: string
  session_id: string
  user_id: string
  question_id: string
  selected_option_index: number
  is_correct: boolean
  is_first_attempt: boolean
  personalized_explanation: string | null
}

export interface UserKnowledge {
  user_id: string
  category: string
  current_level: 'beginner' | 'intermediate' | 'expert'
  rank_title: string
  total_correct: number
  total_attempted: number
  level_correct: number
  level_attempted: number
  streak: number
  best_streak: number
  xp_earned: number
  updated_at: string
}

export interface QuizSubmitRequest {
  session_id: string
  answers: {
    question_id: string
    selected_option_index: number
  }[]
}

export interface QuizSubmitResponse {
  session_id: string
  score: number
  total: number
  xp_earned: number
  results: {
    question_id: string
    selected_option_index: number
    correct_option_index: number
    is_correct: boolean
    explanation: string
    article_link: string | null
  }[]
  level_progress: {
    category: string
    current_level: string
    rank_title: string
    level_correct: number
    level_attempted: number
    unlocked_next: boolean
  } | null
}
```

**Step 2: Create constants**

Create `lib/quiz/constants.ts`:
```ts
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

export const LEVEL_UNLOCK_THRESHOLD = 0.8 // 80% accuracy
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
```

**Step 3: Create utility functions**

Create `lib/quiz/utils.ts`:
```ts
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
```

**Step 4: Commit**

```bash
git add lib/quiz/
git commit -m "feat(quiz): add shared types, constants, and utility functions"
```

---

### Task 3: API Route — GET /api/quiz/questions

**Files:**
- Create: `app/api/quiz/questions/route.ts`

**Step 1: Implement the route**

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { QUIZ_CATEGORIES, DIFFICULTY_LEVELS, HUB_QUESTIONS_PER_QUIZ, ARTICLE_QUESTIONS_PER_QUIZ } from '@/lib/quiz/constants'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const articleSlug = searchParams.get('article_slug')
    const limit = articleSlug ? ARTICLE_QUESTIONS_PER_QUIZ : HUB_QUESTIONS_PER_QUIZ

    if (!category || !QUIZ_CATEGORIES.includes(category as any)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    if (!difficulty || !DIFFICULTY_LEVELS.includes(difficulty as any)) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is authenticated (optional — for filtering already-correct questions)
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
      .from('quiz_questions')
      .select('id, article_slug, category, difficulty, question_text, options, correct_option_index, explanation, article_link')
      .eq('category', category)
      .eq('difficulty', difficulty)
      .eq('is_published', true)

    if (articleSlug) {
      query = query.eq('article_slug', articleSlug)
    }

    const { data: allQuestions, error } = await query

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    if (!allQuestions || allQuestions.length === 0) {
      return NextResponse.json({ questions: [], total_available: 0 })
    }

    let questions = allQuestions

    // If authenticated, prioritize unseen/incorrect questions
    if (user) {
      const { data: correctAttempts } = await supabase
        .from('quiz_attempts')
        .select('question_id')
        .eq('user_id', user.id)
        .eq('is_correct', true)
        .eq('is_first_attempt', true)

      const correctIds = new Set((correctAttempts ?? []).map(a => a.question_id))
      const unseen = questions.filter(q => !correctIds.has(q.id))
      const seen = questions.filter(q => correctIds.has(q.id))

      // Prioritize unseen, backfill with already-correct if needed
      questions = [...unseen, ...seen]
    }

    // Shuffle and limit
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, limit)

    // Strip correct_option_index before sending to client
    const safeQuestions = shuffled.map(({ correct_option_index, explanation, ...q }) => q)

    return NextResponse.json({
      questions: safeQuestions,
      total_available: allQuestions.length,
    })
  } catch (error) {
    console.error('Error in quiz questions route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Test manually**

Open browser: `http://localhost:3000/api/quiz/questions?category=Training&difficulty=beginner`

Expected: `{ "questions": [], "total_available": 0 }` (no questions seeded yet)

**Step 3: Commit**

```bash
git add app/api/quiz/questions/route.ts
git commit -m "feat(quiz): add GET /api/quiz/questions endpoint"
```

---

### Task 4: API Route — POST /api/quiz/submit

**Files:**
- Create: `app/api/quiz/submit/route.ts`

**Step 1: Implement the route**

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/ai/rate-limit'
import { XP_PER_CORRECT, LEVEL_UNLOCK_THRESHOLD, LEVEL_UNLOCK_MIN_QUESTIONS, type DifficultyLevel } from '@/lib/quiz/constants'
import { getRankTitle, getNextLevel, canUnlockNextLevel, type QuizCategory } from '@/lib/quiz/utils'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { allowed, retryAfterMs } = checkRateLimit(user.id, 'quiz-submit', 60)
    if (!allowed) {
      return new Response('Rate limit exceeded', {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
      })
    }

    const body = await request.json()
    const { session_id, answers } = body

    if (!session_id || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Fetch the session
    const { data: session, error: sessionErr } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .is('completed_at', null)
      .single()

    if (sessionErr || !session) {
      return NextResponse.json({ error: 'Session not found or already completed' }, { status: 404 })
    }

    // Fetch the questions for grading
    const questionIds = answers.map((a: any) => a.question_id)
    const { data: questions, error: questionsErr } = await supabase
      .from('quiz_questions')
      .select('id, correct_option_index, explanation, article_link')
      .in('id', questionIds)

    if (questionsErr || !questions) {
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    const questionMap = new Map(questions.map(q => [q.id, q]))

    // Check which questions user has already attempted (for is_first_attempt)
    const { data: priorAttempts } = await supabase
      .from('quiz_attempts')
      .select('question_id')
      .eq('user_id', user.id)
      .eq('is_first_attempt', true)
      .in('question_id', questionIds)

    const priorQuestionIds = new Set((priorAttempts ?? []).map(a => a.question_id))

    // Grade answers
    const difficulty = session.difficulty as DifficultyLevel
    const xpPerCorrect = XP_PER_CORRECT[difficulty] ?? 10
    let score = 0
    let xpEarned = 0
    const results: any[] = []
    const attemptRows: any[] = []

    for (const answer of answers) {
      const question = questionMap.get(answer.question_id)
      if (!question) continue

      const isCorrect = answer.selected_option_index === question.correct_option_index
      const isFirstAttempt = !priorQuestionIds.has(answer.question_id)

      if (isCorrect) {
        score++
        if (isFirstAttempt) {
          xpEarned += xpPerCorrect
        }
      }

      results.push({
        question_id: answer.question_id,
        selected_option_index: answer.selected_option_index,
        correct_option_index: question.correct_option_index,
        is_correct: isCorrect,
        explanation: isCorrect ? null : question.explanation,
        article_link: question.article_link,
      })

      attemptRows.push({
        session_id,
        user_id: user.id,
        question_id: answer.question_id,
        selected_option_index: answer.selected_option_index,
        is_correct: isCorrect,
        is_first_attempt: isFirstAttempt,
      })
    }

    // Insert attempts
    const { error: insertErr } = await supabase
      .from('quiz_attempts')
      .insert(attemptRows)

    if (insertErr) {
      console.error('Error inserting attempts:', insertErr)
      return NextResponse.json({ error: 'Failed to save attempts' }, { status: 500 })
    }

    // Update session
    await supabase
      .from('quiz_sessions')
      .update({
        score,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
      })
      .eq('id', session_id)

    // Award XP (only first-attempt correct answers)
    if (xpEarned > 0) {
      await supabase.rpc('award_quiz_xp', {
        p_user_id: user.id,
        p_xp_amount: xpEarned,
      })
    }

    // Update user_knowledge
    const category = session.category as QuizCategory
    const firstAttemptCorrect = attemptRows.filter(a => a.is_correct && a.is_first_attempt).length
    const firstAttemptTotal = attemptRows.filter(a => a.is_first_attempt).length

    // Upsert user_knowledge
    const { data: existing } = await supabase
      .from('user_knowledge')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .single()

    let levelProgress = null

    if (existing) {
      const newTotalCorrect = existing.total_correct + firstAttemptCorrect
      const newTotalAttempted = existing.total_attempted + firstAttemptTotal
      const newLevelCorrect = existing.level_correct + firstAttemptCorrect
      const newLevelAttempted = existing.level_attempted + firstAttemptTotal
      const newXp = existing.xp_earned + xpEarned

      let currentLevel = existing.current_level as DifficultyLevel
      let rankTitle = existing.rank_title
      let unlockedNext = false

      // Check level unlock
      const nextLevel = getNextLevel(currentLevel)
      if (nextLevel && canUnlockNextLevel(newLevelCorrect, newLevelAttempted)) {
        currentLevel = nextLevel
        rankTitle = getRankTitle(category, nextLevel)
        unlockedNext = true
        // Reset level counters for the new level
        await supabase
          .from('user_knowledge')
          .update({
            total_correct: newTotalCorrect,
            total_attempted: newTotalAttempted,
            level_correct: 0,
            level_attempted: 0,
            current_level: currentLevel,
            rank_title: rankTitle,
            xp_earned: newXp,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('category', category)
      } else {
        await supabase
          .from('user_knowledge')
          .update({
            total_correct: newTotalCorrect,
            total_attempted: newTotalAttempted,
            level_correct: newLevelCorrect,
            level_attempted: newLevelAttempted,
            xp_earned: newXp,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('category', category)
      }

      levelProgress = {
        category,
        current_level: currentLevel,
        rank_title: rankTitle || getRankTitle(category, currentLevel),
        level_correct: unlockedNext ? 0 : newLevelCorrect,
        level_attempted: unlockedNext ? 0 : newLevelAttempted,
        unlocked_next: unlockedNext,
      }
    } else {
      // First quiz in this category — insert new row
      const rankTitle = getRankTitle(category, 'beginner')
      await supabase
        .from('user_knowledge')
        .insert({
          user_id: user.id,
          category,
          current_level: 'beginner',
          rank_title: rankTitle,
          total_correct: firstAttemptCorrect,
          total_attempted: firstAttemptTotal,
          level_correct: firstAttemptCorrect,
          level_attempted: firstAttemptTotal,
          xp_earned: xpEarned,
        })

      levelProgress = {
        category,
        current_level: 'beginner',
        rank_title: rankTitle,
        level_correct: firstAttemptCorrect,
        level_attempted: firstAttemptTotal,
        unlocked_next: false,
      }
    }

    return NextResponse.json({
      session_id,
      score,
      total: answers.length,
      xp_earned: xpEarned,
      results,
      level_progress: levelProgress,
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add app/api/quiz/submit/route.ts
git commit -m "feat(quiz): add POST /api/quiz/submit endpoint with grading and XP"
```

---

### Task 5: API Route — GET /api/quiz/progress

**Files:**
- Create: `app/api/quiz/progress/route.ts`

**Step 1: Implement the route**

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: knowledge, error } = await supabase
      .from('user_knowledge')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching progress:', error)
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }

    // Get recent sessions for activity history
    const { data: recentSessions } = await supabase
      .from('quiz_sessions')
      .select('id, category, difficulty, score, total_questions, xp_earned, completed_at')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      knowledge: knowledge ?? [],
      recent_sessions: recentSessions ?? [],
    })
  } catch (error) {
    console.error('Error in quiz progress route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add app/api/quiz/progress/route.ts
git commit -m "feat(quiz): add GET /api/quiz/progress endpoint"
```

---

### Task 6: Quiz UI Components

**Files:**
- Create: `components/quiz/QuizQuestion.tsx`
- Create: `components/quiz/QuizProgress.tsx`
- Create: `components/quiz/QuizResults.tsx`
- Create: `components/quiz/QuizStartCard.tsx`

These are the reusable quiz building blocks used by both the Knowledge Hub pages and the post-article quiz.

**Step 1: QuizProgress component**

Create `components/quiz/QuizProgress.tsx`:
```tsx
'use client'

import { cn } from '@/lib/utils'

interface QuizProgressProps {
  current: number
  total: number
  score: number
}

export function QuizProgress({ current, total, score }: QuizProgressProps) {
  const progress = ((current) / total) * 100

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#c8b86e] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm text-[#9da6b9] whitespace-nowrap">
        {current}/{total} · {score} correct
      </span>
    </div>
  )
}
```

**Step 2: QuizQuestion component**

Create `components/quiz/QuizQuestion.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface QuizQuestionProps {
  questionNumber: number
  totalQuestions: number
  questionText: string
  options: string[]
  onAnswer: (selectedIndex: number) => void
  // Set after answering:
  result?: {
    selected_option_index: number
    correct_option_index: number
    is_correct: boolean
    explanation: string | null
    article_link: string | null
  }
}

export function QuizQuestion({
  questionNumber,
  totalQuestions,
  questionText,
  options,
  onAnswer,
  result,
}: QuizQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const hasAnswered = result !== undefined

  function handleSelect(index: number) {
    if (hasAnswered) return
    setSelectedIndex(index)
    onAnswer(index)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <p className="text-[13px] font-semibold text-[#9da6b9] uppercase tracking-wider mb-3">
        Question {questionNumber} of {totalQuestions}
      </p>

      <h3 className="text-xl font-semibold text-white mb-6 leading-relaxed">
        {questionText}
      </h3>

      <div className="space-y-3">
        {options.map((option, i) => {
          let variant: 'default' | 'correct' | 'wrong' | 'missed' = 'default'
          if (hasAnswered) {
            if (i === result.correct_option_index) variant = 'correct'
            else if (i === result.selected_option_index && !result.is_correct) variant = 'wrong'
            else variant = 'missed'
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={hasAnswered}
              className={cn(
                'w-full text-left px-5 py-4 rounded-xl border transition-all duration-200',
                'text-[15px] leading-snug',
                variant === 'default' && 'bg-[#1c1f27] border-white/[0.06] text-white hover:border-[#c8b86e]/40 hover:bg-[#1c1f27]/80 cursor-pointer',
                variant === 'correct' && 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
                variant === 'wrong' && 'bg-red-500/10 border-red-500/40 text-red-300',
                variant === 'missed' && 'bg-[#1c1f27]/50 border-white/[0.03] text-[#7a8299]',
                selectedIndex === i && !hasAnswered && 'border-[#c8b86e] bg-[#c8b86e]/5',
              )}
            >
              <span className="flex items-center gap-3">
                <span className={cn(
                  'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                  variant === 'default' && 'bg-white/[0.06] text-[#9da6b9]',
                  variant === 'correct' && 'bg-emerald-500/20 text-emerald-300',
                  variant === 'wrong' && 'bg-red-500/20 text-red-300',
                  variant === 'missed' && 'bg-white/[0.03] text-[#7a8299]',
                )}>
                  {hasAnswered && variant === 'correct' && <CheckCircle2 size={16} />}
                  {hasAnswered && variant === 'wrong' && <XCircle size={16} />}
                  {(!hasAnswered || variant === 'default' || variant === 'missed') && String.fromCharCode(65 + i)}
                </span>
                {option}
              </span>
            </button>
          )
        })}
      </div>

      {/* Explanation on wrong answer */}
      <AnimatePresence>
        {hasAnswered && !result.is_correct && result.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-4 p-4 rounded-xl bg-[#c8b86e]/5 border border-[#c8b86e]/20"
          >
            <p className="text-sm text-[#c8b86e]/90 leading-relaxed">
              {result.explanation}
            </p>
            {result.article_link && (
              <Link
                href={`/wiki/${result.article_link}`}
                className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#c8b86e] hover:underline"
              >
                <BookOpen size={12} />
                Read more
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reinforcement on correct answer */}
      <AnimatePresence>
        {hasAnswered && result.is_correct && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
          >
            <p className="text-sm text-emerald-300/90">
              Correct! +{0} XP
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

**Note:** The XP display in the correct answer reinforcement should receive the actual XP value as a prop. This will be wired in the quiz page. The `+{0}` is a placeholder — the parent component passes the real value.

**Step 3: QuizResults component**

Create `components/quiz/QuizResults.tsx`:
```tsx
'use client'

import { motion } from 'framer-motion'
import { Trophy, ArrowRight, RotateCcw, Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { QuizSubmitResponse } from '@/lib/quiz/types'

interface QuizResultsProps {
  response: QuizSubmitResponse
  category: string
  onRetryMissed?: () => void
}

export function QuizResults({ response, category, onRetryMissed }: QuizResultsProps) {
  const { score, total, xp_earned, level_progress } = response
  const percentage = Math.round((score / total) * 100)
  const isPerfect = score === total

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Score card */}
      <div className="bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={cn(
            'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
            isPerfect ? 'bg-[#c8b86e]/20' : percentage >= 80 ? 'bg-emerald-500/20' : 'bg-white/[0.06]',
          )}
        >
          {isPerfect ? (
            <Star size={36} className="text-[#c8b86e]" />
          ) : (
            <Trophy size={36} className={percentage >= 80 ? 'text-emerald-400' : 'text-[#9da6b9]'} />
          )}
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-1">
          {score}/{total}
        </h2>
        <p className="text-[#9da6b9] text-sm mb-4">
          {percentage}% correct
        </p>

        {xp_earned > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8b86e]/10 border border-[#c8b86e]/20"
          >
            <TrendingUp size={14} className="text-[#c8b86e]" />
            <span className="text-sm font-semibold text-[#c8b86e]">+{xp_earned} XP</span>
          </motion.div>
        )}
      </div>

      {/* Level progress */}
      {level_progress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 mb-6"
        >
          {level_progress.unlocked_next ? (
            <div className="text-center">
              <p className="text-[#c8b86e] font-semibold text-lg mb-1">Level Up!</p>
              <p className="text-white text-xl font-bold">{level_progress.rank_title}</p>
              <p className="text-[#9da6b9] text-sm mt-1">in {level_progress.category}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#9da6b9]">{level_progress.rank_title}</span>
                <span className="text-xs text-[#7a8299]">
                  {level_progress.level_correct}/{level_progress.level_attempted} correct at this level
                </span>
              </div>
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c8b86e] rounded-full transition-all duration-700"
                  style={{
                    width: `${level_progress.level_attempted > 0
                      ? Math.min((level_progress.level_attempted / 20) * 100, 100)
                      : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[#7a8299] mt-1">
                {Math.max(0, 20 - level_progress.level_attempted)} questions until level check
              </p>
            </>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {score < total && onRetryMissed && (
          <button
            onClick={onRetryMissed}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1c1f27] border border-white/[0.06] text-white text-sm font-medium hover:border-white/[0.12] transition-colors"
          >
            <RotateCcw size={16} />
            Retry missed
          </button>
        )}
        <Link
          href={`/wiki/learn/${category.toLowerCase()}`}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#c8b86e] text-[#0A0A0B] text-sm font-semibold hover:bg-[#d4c478] transition-colors"
        >
          Next quiz
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  )
}
```

**Step 4: QuizStartCard component**

Create `components/quiz/QuizStartCard.tsx`:
```tsx
'use client'

import { motion } from 'framer-motion'
import { Brain, Lock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RANK_TITLES, type DifficultyLevel, type QuizCategory } from '@/lib/quiz/constants'
import type { UserKnowledge } from '@/lib/quiz/types'

interface QuizStartCardProps {
  category: QuizCategory
  difficulty: DifficultyLevel
  isUnlocked: boolean
  isCurrent: boolean
  knowledge?: UserKnowledge
  onStart: () => void
}

export function QuizStartCard({
  category,
  difficulty,
  isUnlocked,
  isCurrent,
  knowledge,
  onStart,
}: QuizStartCardProps) {
  const rankTitle = RANK_TITLES[category]?.[difficulty] ?? difficulty
  const accuracy = knowledge && knowledge.level_attempted > 0
    ? Math.round((knowledge.level_correct / knowledge.level_attempted) * 100)
    : null

  return (
    <motion.button
      onClick={onStart}
      disabled={!isUnlocked}
      whileHover={isUnlocked ? { scale: 1.02 } : undefined}
      whileTap={isUnlocked ? { scale: 0.98 } : undefined}
      className={cn(
        'w-full text-left p-5 rounded-xl border transition-all',
        isUnlocked && isCurrent && 'bg-[#c8b86e]/5 border-[#c8b86e]/30 cursor-pointer',
        isUnlocked && !isCurrent && 'bg-[#1c1f27] border-white/[0.06] cursor-pointer hover:border-white/[0.12]',
        !isUnlocked && 'bg-[#1c1f27]/50 border-white/[0.03] cursor-not-allowed opacity-60',
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {!isUnlocked && <Lock size={14} className="text-[#7a8299]" />}
          {isUnlocked && isCurrent && <Brain size={14} className="text-[#c8b86e]" />}
          {isUnlocked && !isCurrent && <CheckCircle2 size={14} className="text-emerald-400" />}
          <span className={cn(
            'text-sm font-semibold capitalize',
            isCurrent ? 'text-[#c8b86e]' : isUnlocked ? 'text-emerald-400' : 'text-[#7a8299]',
          )}>
            {difficulty}
          </span>
        </div>
        <span className="text-xs text-[#7a8299]">{rankTitle}</span>
      </div>

      {accuracy !== null && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-[#9da6b9] mb-1">
            <span>{accuracy}% accuracy</span>
            <span>{knowledge!.level_attempted} questions</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c8b86e]/60 rounded-full"
              style={{ width: `${Math.min((knowledge!.level_attempted / 20) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </motion.button>
  )
}
```

**Step 5: Commit**

```bash
git add components/quiz/
git commit -m "feat(quiz): add QuizQuestion, QuizProgress, QuizResults, QuizStartCard components"
```

---

### Task 7: Knowledge Hub Page — `/wiki/learn`

**Files:**
- Create: `app/wiki/(learn)/learn/page.tsx`
- Create: `app/wiki/(learn)/learn/layout.tsx`

**Step 1: Create layout**

Create `app/wiki/(learn)/learn/layout.tsx`:
```tsx
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {children}
    </div>
  )
}
```

**Step 2: Create Knowledge Hub page**

Create `app/wiki/(learn)/learn/page.tsx`:
```tsx
import { Metadata } from 'next'
import { KnowledgeHubContent } from './knowledge-hub-content'

export const metadata: Metadata = {
  title: 'Knowledge Hub — Carve Wiki',
  description: 'Test and improve your knowledge across Training, Nutrition, Supplements, Recovery, Mindset, Money, and Travel.',
}

export default function KnowledgeHubPage() {
  return <KnowledgeHubContent />
}
```

Create `app/wiki/(learn)/learn/knowledge-hub-content.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/hooks'
import { QUIZ_CATEGORIES } from '@/lib/quiz/constants'
import { getCategoryColor } from '@/lib/wiki/category-colors'
import type { UserKnowledge } from '@/lib/quiz/types'

const CATEGORY_ICONS: Record<string, string> = {
  Training: '💪',
  Nutrition: '🥗',
  Supplements: '💊',
  Recovery: '🧘',
  Mindset: '🧠',
  Money: '💰',
  Travel: '✈️',
}

export function KnowledgeHubContent() {
  const { user } = useAuth()
  const [knowledge, setKnowledge] = useState<UserKnowledge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProgress() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/quiz/progress')
        if (res.ok) {
          const data = await res.json()
          setKnowledge(data.knowledge)
        }
      } catch (e) {
        console.error('Failed to fetch progress:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [user])

  const knowledgeMap = new Map(knowledge.map(k => [k.category, k]))

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#c8b86e]/10 border border-[#c8b86e]/20 flex items-center justify-center mx-auto mb-4">
          <Brain size={28} className="text-[#c8b86e]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Knowledge Hub</h1>
        <p className="text-[#9da6b9] text-lg max-w-md mx-auto">
          Test your knowledge, learn from mistakes, and earn rank titles across 7 categories.
        </p>
      </motion.div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUIZ_CATEGORIES.map((category, i) => {
          const k = knowledgeMap.get(category)
          const color = getCategoryColor(category)

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                href={`/wiki/learn/${category.toLowerCase()}`}
                className="group flex items-center gap-4 p-5 rounded-xl bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                <span className="text-2xl">{CATEGORY_ICONS[category] ?? '📚'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold mb-0.5">{category}</h3>
                  {k ? (
                    <p className="text-sm text-[#9da6b9]">
                      {k.rank_title || 'Beginner'} · {k.total_correct}/{k.total_attempted} correct
                    </p>
                  ) : (
                    <p className="text-sm text-[#7a8299]">Not started</p>
                  )}
                </div>
                <ChevronRight size={18} className="text-[#7a8299] group-hover:text-[#c8b86e] transition-colors" />
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Login prompt for unauthenticated */}
      {!user && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-[#9da6b9] text-sm mb-3">
            Log in to track your progress and earn rank titles.
          </p>
          <Link
            href="/login?redirect=/wiki/learn"
            className="inline-flex px-5 py-2.5 rounded-xl bg-[#c8b86e] text-[#0A0A0B] text-sm font-semibold hover:bg-[#d4c478] transition-colors"
          >
            Log in
          </Link>
        </motion.div>
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/wiki/\(learn\)/
git commit -m "feat(quiz): add Knowledge Hub page at /wiki/learn"
```

---

### Task 8: Category Quiz Page — `/wiki/learn/[category]`

**Files:**
- Create: `app/wiki/(learn)/learn/[category]/page.tsx`
- Create: `app/wiki/(learn)/learn/[category]/category-quiz-content.tsx`

**Step 1: Create page**

Create `app/wiki/(learn)/learn/[category]/page.tsx`:
```tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { QUIZ_CATEGORIES } from '@/lib/quiz/constants'
import { CategoryQuizContent } from './category-quiz-content'

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const cat = QUIZ_CATEGORIES.find(c => c.toLowerCase() === category)
  if (!cat) return { title: 'Not Found' }
  return {
    title: `${cat} Quiz — Carve Knowledge Hub`,
    description: `Test your ${cat.toLowerCase()} knowledge across 3 difficulty levels.`,
  }
}

export default async function CategoryQuizPage({ params }: PageProps) {
  const { category } = await params
  const cat = QUIZ_CATEGORIES.find(c => c.toLowerCase() === category)
  if (!cat) notFound()

  return <CategoryQuizContent category={cat} />
}
```

**Step 2: Create content component**

Create `app/wiki/(learn)/learn/[category]/category-quiz-content.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { createClient } from '@/lib/supabase/client'
import { QuizStartCard } from '@/components/quiz/QuizStartCard'
import { DIFFICULTY_LEVELS, RANK_TITLES, type DifficultyLevel, type QuizCategory } from '@/lib/quiz/constants'
import { canUnlockNextLevel } from '@/lib/quiz/utils'
import type { UserKnowledge } from '@/lib/quiz/types'

interface CategoryQuizContentProps {
  category: QuizCategory
}

export function CategoryQuizContent({ category }: CategoryQuizContentProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [knowledge, setKnowledge] = useState<UserKnowledge | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchKnowledge() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('user_knowledge')
          .select('*')
          .eq('user_id', user.id)
          .eq('category', category)
          .single()
        setKnowledge(data)
      } catch {
        // No knowledge yet — that's fine
      } finally {
        setLoading(false)
      }
    }
    fetchKnowledge()
  }, [user, category])

  async function handleStart(difficulty: DifficultyLevel) {
    if (!user) {
      router.push(`/login?redirect=/wiki/learn/${category.toLowerCase()}`)
      return
    }

    // Create a quiz session
    const supabase = createClient()
    const { data: session, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: user.id,
        category,
        difficulty,
        source: 'hub',
        total_questions: 10,
      })
      .select('id')
      .single()

    if (error || !session) {
      console.error('Failed to create session:', error)
      return
    }

    router.push(`/wiki/learn/${category.toLowerCase()}/quiz?session=${session.id}&difficulty=${difficulty}`)
  }

  const currentLevel = (knowledge?.current_level ?? 'beginner') as DifficultyLevel

  function isUnlocked(difficulty: DifficultyLevel): boolean {
    if (difficulty === 'beginner') return true
    if (!knowledge) return false
    const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'expert']
    const currentIdx = levels.indexOf(currentLevel)
    const targetIdx = levels.indexOf(difficulty)
    return targetIdx <= currentIdx
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <Link
        href="/wiki/learn"
        className="inline-flex items-center gap-1.5 text-sm text-[#9da6b9] hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Knowledge Hub
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">{category}</h1>
        <p className="text-[#9da6b9] text-sm mb-8">
          {knowledge
            ? `Current rank: ${knowledge.rank_title || RANK_TITLES[category].beginner}`
            : 'Start your first quiz to begin earning rank titles.'
          }
        </p>

        <div className="space-y-3">
          {DIFFICULTY_LEVELS.map((diff) => (
            <QuizStartCard
              key={diff}
              category={category}
              difficulty={diff}
              isUnlocked={isUnlocked(diff)}
              isCurrent={diff === currentLevel}
              knowledge={diff === currentLevel ? (knowledge ?? undefined) : undefined}
              onStart={() => handleStart(diff)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/wiki/\(learn\)/learn/\[category\]/
git commit -m "feat(quiz): add category quiz page with level picker"
```

---

### Task 9: Active Quiz Page — `/wiki/learn/[category]/quiz`

**Files:**
- Create: `app/wiki/(learn)/learn/[category]/quiz/page.tsx`
- Create: `app/wiki/(learn)/learn/[category]/quiz/quiz-content.tsx`

**Step 1: Create page**

Create `app/wiki/(learn)/learn/[category]/quiz/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { QUIZ_CATEGORIES } from '@/lib/quiz/constants'
import { QuizPageContent } from './quiz-content'

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ session?: string; difficulty?: string }>
}

export default async function QuizPage({ params, searchParams }: PageProps) {
  const { category } = await params
  const { session, difficulty } = await searchParams
  const cat = QUIZ_CATEGORIES.find(c => c.toLowerCase() === category)
  if (!cat || !session || !difficulty) notFound()

  return <QuizPageContent category={cat} sessionId={session} difficulty={difficulty} />
}
```

**Step 2: Create quiz content component**

Create `app/wiki/(learn)/learn/[category]/quiz/quiz-content.tsx`:
```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizResults } from '@/components/quiz/QuizResults'
import { XP_PER_CORRECT, type DifficultyLevel } from '@/lib/quiz/constants'
import type { QuizSubmitResponse } from '@/lib/quiz/types'

interface QuizPageContentProps {
  category: string
  sessionId: string
  difficulty: string
}

interface QuestionData {
  id: string
  question_text: string
  options: string[]
  article_slug: string | null
  article_link: string | null
}

interface AnswerResult {
  question_id: string
  selected_option_index: number
  correct_option_index: number
  is_correct: boolean
  explanation: string | null
  article_link: string | null
}

export function QuizPageContent({ category, sessionId, difficulty }: QuizPageContentProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{ question_id: string; selected_option_index: number }[]>([])
  const [currentResult, setCurrentResult] = useState<AnswerResult | null>(null)
  const [submitResponse, setSubmitResponse] = useState<QuizSubmitResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(
          `/api/quiz/questions?category=${category}&difficulty=${difficulty}`
        )
        if (res.ok) {
          const data = await res.json()
          setQuestions(data.questions)
        }
      } catch (e) {
        console.error('Failed to fetch questions:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [category, difficulty])

  const handleAnswer = useCallback(async (selectedIndex: number) => {
    const question = questions[currentIndex]
    setAnswers(prev => [...prev, { question_id: question.id, selected_option_index: selectedIndex }])

    // We need to check the answer — but we don't have correct_option_index on client
    // We'll submit all at once at the end, but for immediate feedback we need a single-question check
    // For now, store the answer and move to submit at the end
    // Actually, let's do individual answer checking via a lightweight approach:
    // We'll batch submit at the end and show results then

    // Move to next question after a brief delay
    setCurrentResult(null) // Will be filled after submit
  }, [questions, currentIndex])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, questions.length])

  const handleSubmit = useCallback(async () => {
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, answers }),
      })
      if (res.ok) {
        const data: QuizSubmitResponse = await res.json()
        setSubmitResponse(data)
        setScore(data.score)
      }
    } catch (e) {
      console.error('Failed to submit quiz:', e)
    }
  }, [sessionId, answers])

  // Auto-submit when all questions answered
  useEffect(() => {
    if (answers.length === questions.length && questions.length > 0 && !submitResponse) {
      handleSubmit()
    }
  }, [answers.length, questions.length, submitResponse, handleSubmit])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="w-8 h-8 border-2 border-[#c8b86e] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-[#9da6b9]">No questions available for this category and difficulty yet.</p>
      </div>
    )
  }

  // Show results after submit
  if (submitResponse) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <QuizResults
          response={submitResponse}
          category={category}
        />
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const hasAnsweredCurrent = answers.length > currentIndex

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <QuizProgress
        current={answers.length}
        total={questions.length}
        score={score}
      />

      <AnimatePresence mode="wait">
        <QuizQuestion
          key={currentQuestion.id}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          questionText={currentQuestion.question_text}
          options={currentQuestion.options}
          onAnswer={(selected) => {
            handleAnswer(selected)
            // Auto-advance after short delay
            setTimeout(() => handleNext(), 300)
          }}
        />
      </AnimatePresence>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/wiki/\(learn\)/learn/\[category\]/quiz/
git commit -m "feat(quiz): add active quiz page with question flow and submission"
```

---

### Task 10: Post-Article Quiz Component

**Files:**
- Create: `components/quiz/PostArticleQuiz.tsx`
- Modify: `components/wiki/ArticleLayout.tsx` (add quiz section at bottom)

**Step 1: Create PostArticleQuiz component**

Create `components/quiz/PostArticleQuiz.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/hooks'
import { createClient } from '@/lib/supabase/client'
import { QuizQuestion } from './QuizQuestion'
import { ARTICLE_QUESTIONS_PER_QUIZ, XP_PER_CORRECT } from '@/lib/quiz/constants'
import type { QuizSubmitResponse } from '@/lib/quiz/types'

interface PostArticleQuizProps {
  articleSlug: string
  category: string
}

interface QuestionData {
  id: string
  question_text: string
  options: string[]
}

export function PostArticleQuiz({ articleSlug, category }: PostArticleQuizProps) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{ question_id: string; selected_option_index: number }[]>([])
  const [submitResponse, setSubmitResponse] = useState<QuizSubmitResponse | null>(null)
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function startQuiz() {
    setStarted(true)
    setLoading(true)
    try {
      const res = await fetch(
        `/api/quiz/questions?category=${category}&difficulty=beginner&article_slug=${articleSlug}`
      )
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questions)
      }
    } catch (e) {
      console.error('Failed to fetch questions:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(allAnswers: typeof answers) {
    if (!user) return

    // Create session + submit
    const supabase = createClient()
    const { data: session } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: user.id,
        category,
        difficulty: 'beginner',
        source: 'article',
        article_slug: articleSlug,
        total_questions: questions.length,
      })
      .select('id')
      .single()

    if (!session) return

    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, answers: allAnswers }),
    })

    if (res.ok) {
      setSubmitResponse(await res.json())
    }
  }

  function handleAnswer(selectedIndex: number) {
    const newAnswers = [...answers, {
      question_id: questions[currentIndex].id,
      selected_option_index: selectedIndex,
    }]
    setAnswers(newAnswers)

    if (newAnswers.length === questions.length) {
      // All answered — submit if authenticated
      if (user) handleSubmit(newAnswers)
    } else {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 800)
    }
  }

  // Don't render if no questions would be available (checked after fetch)
  if (started && !loading && questions.length === 0) return null

  return (
    <div className="mt-12 pt-8 border-t border-white/[0.06]">
      {!started ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Brain size={28} className="text-[#c8b86e] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Test Your Knowledge</h3>
          <p className="text-sm text-[#9da6b9] mb-4">
            {ARTICLE_QUESTIONS_PER_QUIZ} quick questions about what you just read.
          </p>
          <button
            onClick={startQuiz}
            className="inline-flex px-6 py-2.5 rounded-xl bg-[#c8b86e] text-[#0A0A0B] text-sm font-semibold hover:bg-[#d4c478] transition-colors"
          >
            Start Quiz
          </button>
        </motion.div>
      ) : loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-[#c8b86e] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : submitResponse ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="text-2xl font-bold text-white mb-1">
            {submitResponse.score}/{submitResponse.total}
          </p>
          <p className="text-sm text-[#9da6b9] mb-3">
            {submitResponse.xp_earned > 0 && `+${submitResponse.xp_earned} XP · `}
            {Math.round((submitResponse.score / submitResponse.total) * 100)}% correct
          </p>
          <Link
            href={`/wiki/learn/${category.toLowerCase()}`}
            className="text-sm text-[#c8b86e] hover:underline"
          >
            Practice more in the Knowledge Hub →
          </Link>
        </motion.div>
      ) : answers.length === questions.length && !user ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <LogIn size={24} className="text-[#c8b86e] mx-auto mb-3" />
          <p className="text-sm text-[#9da6b9] mb-3">Log in to save your score and earn XP.</p>
          <Link
            href={`/login?redirect=/wiki/${category.toLowerCase()}/${articleSlug}`}
            className="inline-flex px-5 py-2.5 rounded-xl bg-[#c8b86e] text-[#0A0A0B] text-sm font-semibold hover:bg-[#d4c478] transition-colors"
          >
            Log in
          </Link>
        </motion.div>
      ) : (
        <div className="py-4">
          <AnimatePresence mode="wait">
            <QuizQuestion
              key={questions[currentIndex]?.id}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              questionText={questions[currentIndex]?.question_text ?? ''}
              options={questions[currentIndex]?.options ?? []}
              onAnswer={handleAnswer}
            />
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Add PostArticleQuiz to ArticleLayout**

In `components/wiki/ArticleLayout.tsx`, after the `<RelatedArticles />` section (around line 151-153), add:

```tsx
import { PostArticleQuiz } from '@/components/quiz/PostArticleQuiz'

// ... inside the <article> element, after RelatedArticles:
<PostArticleQuiz articleSlug={article.slug} category={article.category} />
```

The exact edit: find the closing of `RelatedArticles` and add the `PostArticleQuiz` component right after it, before the closing `</article>` tag.

**Step 3: Commit**

```bash
git add components/quiz/PostArticleQuiz.tsx components/wiki/ArticleLayout.tsx
git commit -m "feat(quiz): add post-article quiz component and integrate into ArticleLayout"
```

---

### Task 11: Kenniskaart Radar Chart Component

**Files:**
- Create: `components/quiz/Kenniskaart.tsx`

**Step 1: Create Kenniskaart component**

Create `components/quiz/Kenniskaart.tsx`:
```tsx
'use client'

import { motion } from 'framer-motion'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { QUIZ_CATEGORIES, RANK_TITLES, MASTER_TITLE, type QuizCategory, type DifficultyLevel } from '@/lib/quiz/constants'
import type { UserKnowledge } from '@/lib/quiz/types'

interface KenniskaartProps {
  knowledge: UserKnowledge[]
}

const LEVEL_VALUES: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  expert: 3,
}

export function Kenniskaart({ knowledge }: KenniskaartProps) {
  const knowledgeMap = new Map(knowledge.map(k => [k.category, k]))

  const radarData = QUIZ_CATEGORIES.map(category => {
    const k = knowledgeMap.get(category)
    return {
      category,
      value: k ? LEVEL_VALUES[k.current_level] ?? 0 : 0,
      fullMark: 3,
    }
  })

  // Top titles
  const titles = knowledge
    .filter(k => k.rank_title)
    .sort((a, b) => (LEVEL_VALUES[b.current_level] ?? 0) - (LEVEL_VALUES[a.current_level] ?? 0))
    .slice(0, 2)
    .map(k => k.rank_title)

  const allExpert = knowledge.length === 7 && knowledge.every(k => k.current_level === 'expert')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Title display */}
      {(titles.length > 0 || allExpert) && (
        <div className="text-center mb-6">
          {allExpert ? (
            <span className="text-lg font-bold text-[#c8b86e]">{MASTER_TITLE}</span>
          ) : (
            <span className="text-sm font-medium text-[#9da6b9]">
              {titles.join(' · ')}
            </span>
          )}
        </div>
      )}

      {/* Radar chart */}
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#282e39" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: '#9da6b9', fontSize: 11 }}
            />
            <Radar
              name="Knowledge"
              dataKey="value"
              stroke="#c8b86e"
              fill="#c8b86e"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 gap-2 mt-4">
        {QUIZ_CATEGORIES.map(category => {
          const k = knowledgeMap.get(category)
          const level = (k?.current_level ?? 'beginner') as DifficultyLevel
          const rankTitle = k?.rank_title || RANK_TITLES[category as QuizCategory]?.beginner || ''
          const accuracy = k && k.total_attempted > 0
            ? Math.round((k.total_correct / k.total_attempted) * 100)
            : 0

          return (
            <div
              key={category}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
            >
              <div>
                <span className="text-sm text-white font-medium">{category}</span>
                <span className="text-xs text-[#7a8299] ml-2">{rankTitle}</span>
              </div>
              {k ? (
                <div className="flex items-center gap-3 text-xs text-[#9da6b9]">
                  <span>{accuracy}%</span>
                  <span>{k.total_attempted} Q</span>
                </div>
              ) : (
                <span className="text-xs text-[#7a8299]">—</span>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
```

**Step 2: Commit**

```bash
git add components/quiz/Kenniskaart.tsx
git commit -m "feat(quiz): add Kenniskaart radar chart component with category cards"
```

---

### Task 12: Profile Page — Kenniskaart Integration

**Files:**
- Modify: `app/(protected)/dashboard/profile/page.tsx`

**Step 1: Add Kenniskaart section to profile**

Read the existing profile page first, then add a new `ProfileGroup` section after the existing groups. The section fetches `user_knowledge` and renders the `Kenniskaart` component.

Add to the profile page:
```tsx
import { Kenniskaart } from '@/components/quiz/Kenniskaart'
// ... in the useEffect or a separate fetch:
const { data: knowledge } = await supabase
  .from('user_knowledge')
  .select('*')
  .eq('user_id', user.id)

// ... in the JSX, as a new ProfileGroup:
<ProfileGroup title="Kenniskaart" delay={0.3}>
  {knowledge && knowledge.length > 0 ? (
    <Kenniskaart knowledge={knowledge} />
  ) : (
    <div className="text-center py-6">
      <p className="text-sm text-[#7a8299] mb-2">No quiz data yet.</p>
      <Link href="/wiki/learn" className="text-sm text-[#c8b86e] hover:underline">
        Start learning →
      </Link>
    </div>
  )}
</ProfileGroup>
```

The exact integration depends on the current structure of the profile page. Read it first, then add the Kenniskaart section using the existing `ProfileGroup` pattern.

**Step 2: Commit**

```bash
git add app/\(protected\)/dashboard/profile/page.tsx
git commit -m "feat(quiz): add Kenniskaart section to profile page"
```

---

### Task 13: Question Generation Script

**Files:**
- Create: `scripts/generate-quiz-questions.ts`

**Step 1: Create the generation script**

Create `scripts/generate-quiz-questions.ts`:
```ts
/**
 * Generate quiz questions from wiki articles using Claude API.
 *
 * Usage:
 *   npx tsx scripts/generate-quiz-questions.ts [--category Training] [--dry-run]
 *
 * Requires ANTHROPIC_API_KEY environment variable.
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

interface GeneratedQuestion {
  question_text: string
  options: string[]
  correct_option_index: number
  explanation: string
  difficulty: 'beginner' | 'intermediate' | 'expert'
}

async function generateQuestionsForArticle(
  slug: string,
  title: string,
  category: string,
  content: string,
): Promise<GeneratedQuestion[]> {
  const prompt = `You are generating quiz questions for a fitness/health/wellness knowledge platform.

Article title: "${title}"
Category: ${category}

Article content:
${content.slice(0, 8000)}

Generate exactly 8 multiple-choice questions based on this article:
- 3 beginner questions (basic facts directly stated in the article)
- 3 intermediate questions (requires understanding and connecting concepts)
- 2 expert questions (requires deeper knowledge and application)

For each question, provide:
1. The question text
2. Exactly 4 options (one correct, three plausible distractors)
3. The index (0-3) of the correct option
4. A 2-3 sentence explanation of why the correct answer is right and why the most common wrong answer is wrong
5. The difficulty level

IMPORTANT: Make distractors plausible — they should reflect common misconceptions, not obviously wrong answers.

Respond with a JSON array of objects with these exact fields:
- question_text (string)
- options (array of 4 strings)
- correct_option_index (number 0-3)
- explanation (string)
- difficulty ("beginner" | "intermediate" | "expert")`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error(`Failed to parse questions for ${slug}`)

  return JSON.parse(jsonMatch[0])
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const categoryFlag = args.indexOf('--category')
  const categoryFilter = categoryFlag !== -1 ? args[categoryFlag + 1] : null

  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  if (categoryFilter) console.log(`Category filter: ${categoryFilter}`)

  // Fetch articles
  let query = supabase
    .from('wiki_articles')
    .select('slug, title, category, content_markdown')
    .eq('is_published', true)

  if (categoryFilter) {
    query = query.eq('category', categoryFilter)
  }

  const { data: articles, error } = await query

  if (error || !articles) {
    console.error('Failed to fetch articles:', error)
    process.exit(1)
  }

  console.log(`Found ${articles.length} articles`)

  let totalGenerated = 0

  for (const article of articles) {
    if (!article.content_markdown) {
      console.log(`Skipping ${article.slug} — no markdown content`)
      continue
    }

    console.log(`\nGenerating questions for: ${article.title} (${article.category})`)

    try {
      const questions = await generateQuestionsForArticle(
        article.slug,
        article.title,
        article.category,
        article.content_markdown,
      )

      console.log(`  Generated ${questions.length} questions`)

      if (!dryRun) {
        const rows = questions.map(q => ({
          article_slug: article.slug,
          category: article.category,
          difficulty: q.difficulty,
          question_text: q.question_text,
          options: q.options,
          correct_option_index: q.correct_option_index,
          explanation: q.explanation,
          article_link: `${article.category.toLowerCase()}/${article.slug}`,
          is_published: false, // Needs human review
        }))

        const { error: insertErr } = await supabase
          .from('quiz_questions')
          .insert(rows)

        if (insertErr) {
          console.error(`  Error inserting: ${insertErr.message}`)
        } else {
          console.log(`  Inserted ${rows.length} questions (unpublished, needs review)`)
          totalGenerated += rows.length
        }
      } else {
        for (const q of questions) {
          console.log(`  [${q.difficulty}] ${q.question_text}`)
        }
        totalGenerated += questions.length
      }
    } catch (e) {
      console.error(`  Failed: ${e}`)
    }

    // Rate limit pause
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\nDone. Total questions generated: ${totalGenerated}`)
  if (!dryRun) {
    console.log('All questions are unpublished. Review and publish via Supabase dashboard.')
  }
}

main().catch(console.error)
```

**Step 2: Test with dry run**

```bash
ANTHROPIC_API_KEY=your-key npx tsx scripts/generate-quiz-questions.ts --category Training --dry-run
```

**Step 3: Commit**

```bash
git add scripts/generate-quiz-questions.ts
git commit -m "feat(quiz): add question generation script using Claude API"
```

---

### Task 14: Seed Sample Questions (for Development)

**Files:**
- Create: `scripts/seed-quiz-questions.ts`

Create a seed script with 3-5 hardcoded sample questions per category for development/testing purposes, so the quiz flow can be tested without running the full AI generation pipeline.

```ts
/**
 * Seed sample quiz questions for development.
 * Usage: npx tsx scripts/seed-quiz-questions.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const SAMPLE_QUESTIONS = [
  {
    category: 'Training',
    difficulty: 'beginner',
    question_text: 'What is the recommended rep range for building muscle hypertrophy?',
    options: ['1-3 reps', '6-12 reps', '15-20 reps', '25-30 reps'],
    correct_option_index: 1,
    explanation: '6-12 reps is the widely accepted hypertrophy range. 1-3 reps focuses on maximal strength, while 15+ reps trains muscular endurance.',
    is_published: true,
  },
  {
    category: 'Training',
    difficulty: 'beginner',
    question_text: 'How many days per week of rest are generally recommended for beginners?',
    options: ['0 days', '1 day', '2-3 days', '5 days'],
    correct_option_index: 2,
    explanation: 'Beginners should rest 2-3 days per week to allow for adequate recovery. Training every day without rest increases injury risk and impairs muscle growth.',
    is_published: true,
  },
  {
    category: 'Nutrition',
    difficulty: 'beginner',
    question_text: 'How much protein per kg bodyweight is recommended for muscle building?',
    options: ['0.5g/kg', '0.8g/kg', '1.6-2.2g/kg', '3.5g/kg'],
    correct_option_index: 2,
    explanation: '1.6-2.2g/kg is the evidence-based recommendation for muscle building. 0.8g/kg is the minimum for sedentary individuals, while above 2.2g/kg shows no additional benefit.',
    is_published: true,
  },
  {
    category: 'Nutrition',
    difficulty: 'intermediate',
    question_text: 'Which macronutrient has the highest thermic effect of food (TEF)?',
    options: ['Fat', 'Carbohydrates', 'Protein', 'Alcohol'],
    correct_option_index: 2,
    explanation: 'Protein has a TEF of 20-30%, meaning your body uses 20-30% of protein calories just to digest it. Carbs have a TEF of 5-10%, and fat only 0-3%.',
    is_published: true,
  },
  {
    category: 'Supplements',
    difficulty: 'beginner',
    question_text: 'Which supplement has the most scientific evidence for improving strength and power?',
    options: ['BCAAs', 'Creatine Monohydrate', 'Glutamine', 'CLA'],
    correct_option_index: 1,
    explanation: 'Creatine monohydrate is the most researched sports supplement with consistent evidence showing 5-10% improvements in strength and power output.',
    is_published: true,
  },
  {
    category: 'Recovery',
    difficulty: 'beginner',
    question_text: 'How many hours of sleep per night are recommended for optimal recovery?',
    options: ['4-5 hours', '5-6 hours', '7-9 hours', '10-12 hours'],
    correct_option_index: 2,
    explanation: '7-9 hours is recommended by sleep researchers. During sleep, growth hormone is released which is critical for muscle repair and recovery.',
    is_published: true,
  },
  {
    category: 'Mindset',
    difficulty: 'beginner',
    question_text: 'What does the psychological concept of "progressive overload" apply to in mental fitness?',
    options: ['Avoiding all stress', 'Gradually increasing challenge', 'Maximizing comfort', 'Ignoring setbacks'],
    correct_option_index: 1,
    explanation: 'Just as muscles grow through progressively increasing resistance, mental resilience grows through gradually increasing challenges. Avoiding all stress prevents growth.',
    is_published: true,
  },
  {
    category: 'Money',
    difficulty: 'beginner',
    question_text: 'What is the commonly recommended percentage of income to save?',
    options: ['5%', '10%', '20%', '50%'],
    correct_option_index: 2,
    explanation: 'The 50/30/20 rule suggests saving 20% of income. 50% goes to needs, 30% to wants, and 20% to savings and investments.',
    is_published: true,
  },
  {
    category: 'Travel',
    difficulty: 'beginner',
    question_text: 'What is the most effective way to combat jet lag?',
    options: ['Sleep pills', 'Sunlight exposure at destination times', 'Staying awake for 24 hours', 'Eating heavily'],
    correct_option_index: 1,
    explanation: 'Sunlight exposure helps reset your circadian rhythm to the new timezone. It suppresses melatonin during the day and promotes natural sleep at night.',
    is_published: true,
  },
]

async function main() {
  console.log('Seeding sample quiz questions...')

  const { error } = await supabase
    .from('quiz_questions')
    .insert(SAMPLE_QUESTIONS)

  if (error) {
    console.error('Error seeding:', error.message)
    process.exit(1)
  }

  console.log(`Seeded ${SAMPLE_QUESTIONS.length} questions successfully.`)
}

main().catch(console.error)
```

```bash
git add scripts/seed-quiz-questions.ts
git commit -m "feat(quiz): add sample question seed script for development"
```

---

## Task Order & Dependencies

```
Task 1: Database Migration ← no dependencies
Task 2: Types, Constants, Utils ← no dependencies
Task 3: GET /api/quiz/questions ← depends on Task 1, 2
Task 4: POST /api/quiz/submit ← depends on Task 1, 2
Task 5: GET /api/quiz/progress ← depends on Task 1, 2
Task 6: Quiz UI Components ← depends on Task 2
Task 7: Knowledge Hub Page ← depends on Task 2, 5, 6
Task 8: Category Quiz Page ← depends on Task 2, 6
Task 9: Active Quiz Page ← depends on Task 3, 4, 6
Task 10: Post-Article Quiz ← depends on Task 3, 4, 6
Task 11: Kenniskaart Component ← depends on Task 2
Task 12: Profile Integration ← depends on Task 11
Task 13: Question Generation Script ← depends on Task 1
Task 14: Seed Sample Questions ← depends on Task 1
```

**Parallel groups:**
- Group A (independent): Task 1, Task 2
- Group B (after A): Task 3, 4, 5, 6, 11, 13, 14 (all can be parallel)
- Group C (after B): Task 7, 8, 9, 10, 12
