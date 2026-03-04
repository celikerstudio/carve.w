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
    explanation: string | null
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
