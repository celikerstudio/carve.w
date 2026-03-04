-- ============================================================================
-- QUIZ / KNOWLEDGE SYSTEM - Database Migration
-- Creates quiz_questions, quiz_sessions, quiz_attempts, user_knowledge tables,
-- the award_quiz_xp function, and RLS policies.
-- Uses IF NOT EXISTS / CREATE OR REPLACE for safety against production divergence.
-- ============================================================================

-- ============================================================================
-- 1. quiz_questions - question bank for the knowledge quiz system
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  article_link TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT quiz_questions_category_check
    CHECK (category IN ('Training', 'Nutrition', 'Supplements', 'Recovery', 'Mindset', 'Money', 'Travel')),
  CONSTRAINT quiz_questions_difficulty_check
    CHECK (difficulty IN ('beginner', 'intermediate', 'expert')),
  CONSTRAINT quiz_questions_options_length
    CHECK (jsonb_array_length(options) = 4),
  CONSTRAINT quiz_questions_correct_option_range
    CHECK (correct_option_index BETWEEN 0 AND 3)
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_cat_diff_pub
  ON public.quiz_questions (category, difficulty, is_published);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_article_slug
  ON public.quiz_questions (article_slug);

-- ============================================================================
-- 2. quiz_sessions - tracks a user's quiz session (one per quiz attempt)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quiz_sessions (
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

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_created
  ON public.quiz_sessions (user_id, started_at);

-- ============================================================================
-- 3. quiz_attempts - individual question answers within a session
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_option_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  is_first_attempt BOOLEAN NOT NULL DEFAULT true,
  personalized_explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_question
  ON public.quiz_attempts (user_id, question_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_created
  ON public.quiz_attempts (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session
  ON public.quiz_attempts (session_id);

-- ============================================================================
-- 4. user_knowledge - per-category knowledge tracking for each user
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_knowledge (
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
  ON public.user_knowledge (user_id);

-- ============================================================================
-- 5. award_quiz_xp function
--    Reads/updates profiles.total_xp and profiles.level (NOT user_stats).
--    Uses existing calculate_level() function to recalculate level.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.award_quiz_xp(
  p_user_id UUID,
  p_xp_amount INTEGER
)
RETURNS TABLE (
  new_total_xp INTEGER,
  old_level INTEGER,
  new_level INTEGER,
  leveled_up BOOLEAN
) AS $$
DECLARE
  v_old_xp INTEGER;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Read current XP and level from profiles
  SELECT p.total_xp, p.level
    INTO v_old_xp, v_old_level
    FROM public.profiles p
   WHERE p.id = p_user_id;

  -- Calculate new totals
  v_new_xp    := COALESCE(v_old_xp, 0) + p_xp_amount;
  v_new_level := public.calculate_level(v_new_xp);

  -- Persist back to profiles
  UPDATE public.profiles
     SET total_xp = v_new_xp,
         level    = v_new_level
   WHERE id = p_user_id;

  -- Return the result set
  RETURN QUERY SELECT
    v_new_xp    AS new_total_xp,
    COALESCE(v_old_level, 1) AS old_level,
    v_new_level AS new_level,
    (v_new_level > COALESCE(v_old_level, 1)) AS leveled_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.award_quiz_xp IS 'Award quiz XP to a user, update profiles.total_xp and profiles.level, return level-up info';

-- ============================================================================
-- 6. Enable Row Level Security
-- ============================================================================

ALTER TABLE public.quiz_questions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_knowledge  ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. RLS Policies
-- ============================================================================

-- ---------- quiz_questions ----------

-- Anyone (including anon) can read published questions
DROP POLICY IF EXISTS "quiz_questions_select_published" ON public.quiz_questions;
CREATE POLICY "quiz_questions_select_published"
  ON public.quiz_questions
  FOR SELECT
  USING (is_published = true);

-- Admins can do everything
DROP POLICY IF EXISTS "quiz_questions_admin_all" ON public.quiz_questions;
CREATE POLICY "quiz_questions_admin_all"
  ON public.quiz_questions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------- quiz_sessions ----------

DROP POLICY IF EXISTS "quiz_sessions_select_own" ON public.quiz_sessions;
CREATE POLICY "quiz_sessions_select_own"
  ON public.quiz_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_sessions_insert_own" ON public.quiz_sessions;
CREATE POLICY "quiz_sessions_insert_own"
  ON public.quiz_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_sessions_update_own" ON public.quiz_sessions;
CREATE POLICY "quiz_sessions_update_own"
  ON public.quiz_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- quiz_attempts ----------

DROP POLICY IF EXISTS "quiz_attempts_select_own" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_select_own"
  ON public.quiz_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_attempts_insert_own" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_insert_own"
  ON public.quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ---------- user_knowledge ----------

-- Public SELECT for profile viewing (anyone can see knowledge stats)
DROP POLICY IF EXISTS "user_knowledge_select_public" ON public.user_knowledge;
CREATE POLICY "user_knowledge_select_public"
  ON public.user_knowledge
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "user_knowledge_insert_own" ON public.user_knowledge;
CREATE POLICY "user_knowledge_insert_own"
  ON public.user_knowledge
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_knowledge_update_own" ON public.user_knowledge;
CREATE POLICY "user_knowledge_update_own"
  ON public.user_knowledge
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 8. Comments
-- ============================================================================

COMMENT ON TABLE public.quiz_questions  IS 'Question bank for the knowledge quiz system';
COMMENT ON TABLE public.quiz_sessions   IS 'Tracks individual quiz sessions per user';
COMMENT ON TABLE public.quiz_attempts   IS 'Individual question answers within a quiz session (immutable)';
COMMENT ON TABLE public.user_knowledge  IS 'Per-category knowledge tracking and progression for each user';
