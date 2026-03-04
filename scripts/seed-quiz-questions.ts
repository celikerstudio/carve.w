#!/usr/bin/env tsx

/**
 * Seed Sample Quiz Questions
 *
 * Inserts hardcoded sample questions into quiz_questions for development testing.
 * All questions are inserted with is_published: true so they are immediately usable.
 *
 * Usage:
 *   npx tsx scripts/seed-quiz-questions.ts
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Config & validation
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Sample questions — 9 total, covering all categories and difficulties
// ---------------------------------------------------------------------------

const SAMPLE_QUESTIONS = [
  // 1. Training — beginner
  {
    category: 'Training',
    difficulty: 'beginner',
    question_text: 'What does the acronym "RPE" stand for in strength training?',
    options: [
      'Rate of Perceived Exertion',
      'Repetitions Per Exercise',
      'Resistance Performance Evaluation',
      'Recovery Period Estimate',
    ],
    correct_option_index: 0,
    explanation:
      'RPE stands for Rate of Perceived Exertion. It is a subjective scale (typically 1-10) used to measure how hard an exercise feels. It was originally developed by Gunnar Borg and is widely used in both research and practical training to autoregulate intensity.',
    article_link: null,
    article_slug: null,
  },

  // 2. Nutrition — intermediate
  {
    category: 'Nutrition',
    difficulty: 'intermediate',
    question_text:
      'What is the approximate daily protein intake recommended by most sports nutrition guidelines for individuals engaged in resistance training?',
    options: [
      '0.4-0.6 g per kg of body weight',
      '0.8-1.0 g per kg of body weight',
      '1.6-2.2 g per kg of body weight',
      '3.0-4.0 g per kg of body weight',
    ],
    correct_option_index: 2,
    explanation:
      'Current sports nutrition research, including meta-analyses by Morton et al. (2018), recommends approximately 1.6-2.2 g of protein per kilogram of body weight per day for individuals doing resistance training. Intakes below 1.6 g/kg may be suboptimal for muscle protein synthesis, while intakes above 2.2 g/kg offer diminishing returns.',
    article_link: null,
    article_slug: null,
  },

  // 3. Supplements — expert
  {
    category: 'Supplements',
    difficulty: 'expert',
    question_text:
      'Which mechanism best explains how creatine monohydrate enhances high-intensity exercise performance?',
    options: [
      'It increases aerobic mitochondrial density',
      'It replenishes phosphocreatine stores, allowing faster ATP regeneration during short bursts of effort',
      'It directly increases blood testosterone levels',
      'It reduces lactic acid production by buffering hydrogen ions',
    ],
    correct_option_index: 1,
    explanation:
      'Creatine monohydrate works primarily by increasing intramuscular phosphocreatine stores. During high-intensity exercise, phosphocreatine donates a phosphate group to ADP, rapidly regenerating ATP. This mechanism is most beneficial for efforts lasting under 30 seconds, such as sprints and heavy lifts. Creatine does not directly affect testosterone levels or mitochondrial density.',
    article_link: null,
    article_slug: null,
  },

  // 4. Recovery — beginner
  {
    category: 'Recovery',
    difficulty: 'beginner',
    question_text: 'How many hours of sleep per night do most sleep guidelines recommend for adults to support recovery?',
    options: [
      '4-5 hours',
      '5-6 hours',
      '7-9 hours',
      '10-12 hours',
    ],
    correct_option_index: 2,
    explanation:
      'The National Sleep Foundation and the American Academy of Sleep Medicine recommend 7-9 hours of sleep per night for adults (ages 18-64). Sleep is critical for muscle recovery, hormone regulation (including growth hormone release), and cognitive function. Consistently sleeping fewer than 7 hours is associated with impaired recovery and increased injury risk.',
    article_link: null,
    article_slug: null,
  },

  // 5. Mindset — intermediate
  {
    category: 'Mindset',
    difficulty: 'intermediate',
    question_text:
      'According to self-determination theory, which three basic psychological needs must be satisfied for intrinsic motivation to flourish?',
    options: [
      'Power, status, and recognition',
      'Autonomy, competence, and relatedness',
      'Goal-setting, feedback, and reward',
      'Discipline, habit, and accountability',
    ],
    correct_option_index: 1,
    explanation:
      'Self-determination theory (Deci & Ryan, 2000) identifies autonomy (feeling in control of one\'s actions), competence (feeling effective), and relatedness (feeling connected to others) as the three basic psychological needs. When these needs are met, people are more likely to be intrinsically motivated, which leads to more sustainable behavior change compared to extrinsic motivation.',
    article_link: null,
    article_slug: null,
  },

  // 6. Money — beginner
  {
    category: 'Money',
    difficulty: 'beginner',
    question_text: 'What is the "50/30/20" budgeting rule?',
    options: [
      '50% savings, 30% needs, 20% wants',
      '50% needs, 30% wants, 20% savings and debt repayment',
      '50% investments, 30% savings, 20% spending',
      '50% wants, 30% needs, 20% emergency fund',
    ],
    correct_option_index: 1,
    explanation:
      'The 50/30/20 rule, popularized by Senator Elizabeth Warren, suggests allocating 50% of after-tax income to needs (housing, food, utilities), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment. It provides a simple framework for personal budgeting, though individual circumstances may require adjustments.',
    article_link: null,
    article_slug: null,
  },

  // 7. Travel — intermediate
  {
    category: 'Travel',
    difficulty: 'intermediate',
    question_text:
      'Which strategy is most effective for minimizing jet lag when traveling eastward across multiple time zones?',
    options: [
      'Sleep as much as possible on the plane regardless of destination time',
      'Gradually shift your sleep schedule earlier by 1-2 hours per day before departure and seek morning light upon arrival',
      'Take melatonin every 4 hours during the flight',
      'Stay awake for 24 hours before the flight to ensure exhaustion',
    ],
    correct_option_index: 1,
    explanation:
      'Research on circadian rhythm adjustment shows that gradually advancing your sleep schedule before eastward travel and seeking bright morning light at your destination helps reset your internal clock. Eastward travel requires a phase advance (earlier sleep/wake), which the body finds harder than phase delay. Strategic light exposure is the most potent zeitgeber (time cue) for circadian adjustment.',
    article_link: null,
    article_slug: null,
  },

  // 8. Training — expert
  {
    category: 'Training',
    difficulty: 'expert',
    question_text:
      'In periodization theory, what distinguishes undulating (daily undulating periodization) from linear periodization in terms of training variable manipulation?',
    options: [
      'Undulating periodization only varies rest periods, while linear varies load',
      'Linear periodization changes volume and intensity in a single progressive direction over weeks, while undulating periodization varies them on a session-to-session or weekly basis',
      'Undulating periodization uses higher volume throughout, while linear uses lower volume',
      'There is no meaningful difference; both produce identical outcomes in all populations',
    ],
    correct_option_index: 1,
    explanation:
      'Linear periodization progressively increases intensity while decreasing volume over mesocycles (e.g., hypertrophy phase to strength phase to peaking). Daily undulating periodization (DUP) varies intensity and volume within the same week (e.g., heavy Monday, light Wednesday, moderate Friday). Meta-analyses suggest DUP may offer slight advantages for trained individuals due to more frequent exposure to different stimuli, though both approaches are effective.',
    article_link: null,
    article_slug: null,
  },

  // 9. Recovery — expert
  {
    category: 'Recovery',
    difficulty: 'expert',
    question_text:
      'What is the primary physiological mechanism by which cold water immersion (ice baths) may blunt long-term hypertrophy adaptations when used chronically after resistance training?',
    options: [
      'It causes excessive cortisol release that breaks down muscle tissue',
      'It attenuates the post-exercise inflammatory signaling and satellite cell activity necessary for muscle remodeling',
      'It permanently reduces blood flow to muscles, causing atrophy',
      'It depletes glycogen stores faster than warm recovery methods',
    ],
    correct_option_index: 1,
    explanation:
      'Research by Roberts et al. (2015) demonstrated that regular cold water immersion after resistance training attenuated satellite cell activity and the acute inflammatory response (including key signaling pathways like p70S6K). While acute inflammation after exercise may feel undesirable, it is a necessary part of the muscle remodeling process. This is why cold water immersion may be useful for acute recovery in competition settings but counterproductive when the goal is maximizing long-term hypertrophy.',
    article_link: null,
    article_slug: null,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('=== Seeding Sample Quiz Questions ===\n');

  // Prepare rows with is_published: true and JSON-stringified options
  const rows = SAMPLE_QUESTIONS.map((q) => ({
    ...q,
    options: JSON.stringify(q.options),
    is_published: true,
  }));

  const { data, error } = await supabase
    .from('quiz_questions')
    .insert(rows)
    .select('id, category, difficulty, question_text');

  if (error) {
    console.error('Failed to insert seed questions:', error.message);
    process.exit(1);
  }

  console.log(`Inserted ${data.length} sample question(s):\n`);

  for (const q of data) {
    console.log(`  [${q.difficulty.padEnd(12)}] (${q.category.padEnd(11)}) ${q.question_text.slice(0, 80)}...`);
  }

  console.log('\nAll questions inserted with is_published: true.');
  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
