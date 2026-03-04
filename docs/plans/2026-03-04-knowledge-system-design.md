# Carve Knowledge System — Design Document

**Date:** 2026-03-04
**Status:** Approved
**Author:** Furkan + Claude

## Summary

A quiz-based knowledge system for carve.wiki that tests users across 7 categories with 3 difficulty levels, provides AI-powered explanations on wrong answers, and displays progress as thematic rank titles on user profiles.

Core loop: **Read → Test → Learn from mistakes → Level up → Show off**

---

## Two Entry Points

### 1. Post-Article Quiz

After reading a wiki article, a "Test je kennis" section appears at the bottom with 3-5 questions about that article's content.

- Contextual — questions directly tied to what the user just read
- Low friction — they're already engaged with the topic
- Serves as a comprehension check and gateway to the Knowledge Hub

### 2. Knowledge Hub (`/wiki/learn`)

Standalone quiz experience, independent from articles.

- User picks a category (Training, Nutrition, etc.)
- Picks a difficulty level (unlocked progressively)
- Takes a 10-question quiz
- This is the primary practice space for leveling up

---

## Quiz Format

### Question Type

Multiple choice with 4 options. Proven, fast, easy to grade, gamifiable.

### Difficulty Levels

Three levels per category, unlocked progressively:

| Level | Unlock Condition | XP per Correct |
|-------|-----------------|----------------|
| Beginner | Available immediately | 10 XP |
| Intermediate | 80% accuracy on 20+ Beginner questions | 25 XP |
| Expert | 80% accuracy on 20+ Intermediate questions | 50 XP |

### Wrong Answer Flow

When a user answers incorrectly:

1. Show the correct answer highlighted
2. Display a short AI-generated explanation (2-3 sentences)
3. Link to the relevant wiki article for deeper reading
4. The explanation is contextual — it addresses WHY the chosen answer is wrong, not just what the right answer is

Example:

> **Q:** Hoeveel gram eiwit per kg lichaamsgewicht wordt aanbevolen voor spieropbouw?
>
> A) 0.5g/kg &nbsp; **B) 0.8g/kg** (selected) &nbsp; C) 1.6-2.2g/kg &nbsp; D) 3.0g/kg
>
> **Fout.** Het correcte antwoord is **C) 1.6-2.2g/kg**.
>
> *0.8g/kg is de minimale aanbeveling voor sedentaire mensen. Voor spieropbouw toont onderzoek dat 1.6-2.2g/kg optimaal is — hogere inname levert geen extra voordeel op.*
> → Lees meer: [Protein Intake for Muscle Growth](/wiki/nutrition/protein-intake)

### Correct Answer Flow

1. Show confirmation with a brief reinforcement fact (optional)
2. Award XP
3. Continue to next question

### Quiz Completion

After finishing a quiz, show:

- Score (e.g., 8/10)
- XP earned
- Progress toward next rank title
- Option to retry missed questions
- Option to start next quiz

---

## Knowledge Ranks

Instead of generic "Level 1/2/3", users earn **thematic titles** per category:

| Category | Beginner | Intermediate | Expert |
|----------|----------|--------------|--------|
| **Training** | Rookie | Coach | Personal Trainer |
| **Nutrition** | Foodie | Nutritionist | Dietitian |
| **Supplements** | Curious | Informed | Specialist |
| **Recovery** | Starter | Practitioner | Recovery Pro |
| **Mindset** | Learner | Mentor | Psychologist |
| **Money** | Saver | Advisor | Financial Planner |
| **Travel** | Tourist | Explorer | World Traveler |

**Master title:** Achieving Expert in all 7 categories earns the title **"Carve Master"**.

---

## Profile: Kenniskaart

### Display Elements

1. **Primary title** — Displayed under username. Shows top 1-2 achieved titles (e.g., "Personal Trainer · Nutritionist")

2. **Radar chart** — Spider/web chart with 7 axes (one per category). Values 0-3 representing level. Instant visual overview of where someone is strong. Uses existing Recharts in the stack.

3. **Category cards** — Below the radar chart, one card per category:
   - Rank title + badge icon
   - Questions answered count
   - Accuracy percentage
   - Progress bar toward next rank

4. **Achievements** — Special badges for milestones:
   - "Perfect Score" — 10/10 on any quiz
   - "Streak: 7 Days" — quiz streak
   - "Quick Learner" — passed Intermediate within first week
   - "Carve Master" — all 7 Expert ranks achieved
   - Category-specific badges (e.g., "Protein Pro", "Budget Boss")

### Social Aspect

- Kenniskaart is visible on public profile
- Other users can see your rank titles and radar chart
- Feeds into existing hiscores/leaderboard system

---

## Question Generation Strategy

### Phase 1: AI-Generated, Human-Reviewed

1. Build a script that takes wiki article content and generates 5-10 questions per article using Claude API
2. Questions are generated with: question text, 4 options, correct answer, difficulty tag, explanation text, linked article slug
3. Human review pass before publishing to ensure quality and accuracy
4. Target: 50-100 questions per category at launch (350-700 total)

### Phase 2: Data-Driven Refinement

- Track which questions are too easy (>95% correct) or too hard (<20% correct)
- Adjust difficulty tags based on real performance data
- Add new questions for underrepresented topics
- Retire stale or poor-performing questions

---

## Technical Design

### New Supabase Tables

**`quiz_questions`**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| article_slug | text | Linked wiki article (nullable for standalone questions) |
| category | text | One of 7 wiki categories |
| difficulty | text | beginner / intermediate / expert |
| question_text | text | The question |
| options | jsonb | Array of 4 option strings |
| correct_option_index | int | Index (0-3) of correct answer |
| explanation | text | Pre-written explanation for wrong answers |
| article_link | text | Slug to link for "read more" |
| is_published | boolean | Default false, true after review |
| created_at | timestamptz | |

**`quiz_attempts`**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| question_id | uuid | FK to quiz_questions |
| selected_option_index | int | What the user picked |
| is_correct | boolean | |
| ai_explanation | text | AI-generated contextual explanation (nullable, only for wrong answers) |
| created_at | timestamptz | |

**`user_knowledge`**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| category | text | Category name |
| current_level | text | beginner / intermediate / expert |
| rank_title | text | Current rank title |
| total_correct | int | Lifetime correct answers in category |
| total_attempted | int | Lifetime attempts in category |
| level_correct | int | Correct at current level |
| level_attempted | int | Attempts at current level |
| streak | int | Current daily quiz streak |
| best_streak | int | All-time best streak |
| xp_earned | int | Total XP from this category |
| updated_at | timestamptz | |

### Key Technical Decisions

- **Quiz UI is fully client-side** — No page reloads between questions. Smooth transitions, instant feedback. Submit answers via API route.
- **AI explanations** — Pre-written explanations stored in `quiz_questions.explanation` for Phase 1. AI-generated personalized explanations via Vercel AI SDK as a Phase 2 enhancement for wrong answers (stored in `quiz_attempts.ai_explanation`).
- **Radar chart** — Recharts `RadarChart` component, already in the dependency tree.
- **XP integration** — Quiz XP feeds into existing Carve XP/Rank system.
- **RLS policies** — Users can read all published questions, but only read/write their own attempts and knowledge records.

### New Routes

| Route | Purpose |
|-------|---------|
| `/wiki/learn` | Knowledge Hub — category picker, level selection |
| `/wiki/learn/[category]` | Category quiz page — level picker, start quiz |
| `/wiki/learn/[category]/quiz` | Active quiz experience |
| `/wiki/learn/[category]/results` | Quiz results + AI explanations review |
| `/dashboard/profile` (updated) | Add Kenniskaart section |

### API Routes

| Route | Purpose |
|-------|---------|
| `POST /api/quiz/submit` | Submit a quiz attempt, return results + AI explanations |
| `GET /api/quiz/questions` | Fetch questions by category + difficulty |
| `GET /api/quiz/progress` | Get user's knowledge state across categories |

---

## Integration Points

- **Wiki articles** — Post-article quiz component at bottom of `ArticleLayout`
- **Dashboard profile** — Kenniskaart radar chart + rank cards
- **XP system** — Quiz XP adds to existing user XP
- **Hiscores** — Knowledge leaderboard tab (most XP from quizzes, most Expert ranks)
- **Coach chat** — AI coach can reference quiz performance ("Je scoort laag op Recovery — wil je daar mee oefenen?")

---

## What This Does NOT Include (YAGNI)

- Multiplayer/versus quiz mode (future consideration)
- Open-ended/essay questions (complexity, hard to grade)
- User-submitted questions (moderation burden)
- Timed quizzes (adds stress, reduces learning)
- Paid/premium quiz content (all free for now)
