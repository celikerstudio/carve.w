#!/usr/bin/env tsx

/**
 * Quiz Question Generation Script
 *
 * Generates quiz questions from wiki articles using Claude API.
 * Questions are inserted into the quiz_questions table.
 *
 * Usage:
 *   npx tsx scripts/generate-quiz-questions.ts [--category Training] [--dry-run]
 *
 * Options:
 *   --category <name>   Only generate questions for articles in this quiz category
 *   --dry-run           Print generated questions to console without inserting
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Config & validation
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY!;

const REQUIRED_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey,
  ANTHROPIC_API_KEY: anthropicApiKey,
};

for (const [name, value] of Object.entries(REQUIRED_ENV)) {
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const CLAUDE_MODEL = 'claude-sonnet-4-6';

// Map wiki_articles.category (slug) -> quiz_questions.category (capitalized)
const ARTICLE_TO_QUIZ_CATEGORY: Record<string, string> = {
  'nutrition': 'Nutrition',
  'exercise-science': 'Training',
  'training-methods': 'Training',
  'physiology': 'Recovery',
  'psychology': 'Mindset',
  'injury-health': 'Recovery',
  'supplements': 'Supplements',
  'money': 'Money',
  'travel': 'Travel',
};

const VALID_QUIZ_CATEGORIES = [
  'Training', 'Nutrition', 'Supplements', 'Recovery', 'Mindset', 'Money', 'Travel',
];

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): { category: string | null; dryRun: boolean } {
  const args = process.argv.slice(2);
  let category: string | null = null;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) {
      category = args[i + 1];
      i++;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  if (category && !VALID_QUIZ_CATEGORIES.includes(category)) {
    console.error(`Invalid category: "${category}"`);
    console.error(`Valid categories: ${VALID_QUIZ_CATEGORIES.join(', ')}`);
    process.exit(1);
  }

  return { category, dryRun };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GeneratedQuestion {
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
}

interface WikiArticle {
  slug: string;
  title: string;
  category: string;
  content_markdown: string;
}

// ---------------------------------------------------------------------------
// Claude API call (direct fetch — no extra SDK needed)
// ---------------------------------------------------------------------------

async function generateQuestionsFromArticle(
  article: WikiArticle,
  quizCategory: string,
): Promise<GeneratedQuestion[]> {
  // Truncate very long articles to stay within context limits
  const maxContentLength = 12_000;
  const content = article.content_markdown.length > maxContentLength
    ? article.content_markdown.slice(0, maxContentLength) + '\n\n[... content truncated ...]'
    : article.content_markdown;

  const prompt = `You are an expert quiz question writer for an educational health & fitness wiki called Carve.

Given the following wiki article, generate exactly 8 multiple-choice quiz questions:
- 3 beginner-level questions (test basic recall and understanding)
- 3 intermediate-level questions (test application and analysis)
- 2 expert-level questions (test synthesis and evaluation, may require combining concepts)

The quiz category for these questions is: "${quizCategory}"

ARTICLE TITLE: ${article.title}
ARTICLE CATEGORY: ${article.category}

ARTICLE CONTENT:
${content}

For each question, provide:
- question_text: A clear, concise question (1-2 sentences)
- options: Exactly 4 answer choices (array of strings). Make distractors plausible but clearly wrong to someone who knows the material.
- correct_option_index: The 0-based index of the correct answer (0-3)
- explanation: A 2-3 sentence explanation of why the correct answer is right and why common wrong answers are wrong.
- difficulty: One of "beginner", "intermediate", or "expert"

IMPORTANT:
- Questions must be factually accurate based on the article content
- Avoid "all of the above" or "none of the above" options
- Each question should test a different concept from the article
- Explanations should be educational and help the learner understand

Respond with ONLY a JSON array of 8 question objects, no additional text or markdown formatting.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // Extract text from the response
  const textBlock = data.content?.find((block: any) => block.type === 'text');
  if (!textBlock?.text) {
    throw new Error('No text content in Claude response');
  }

  // Parse JSON — handle potential markdown code fences
  let jsonText = textBlock.text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const questions: GeneratedQuestion[] = JSON.parse(jsonText);

  // Validate structure
  if (!Array.isArray(questions)) {
    throw new Error('Response is not an array');
  }

  for (const q of questions) {
    if (
      !q.question_text ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      typeof q.correct_option_index !== 'number' ||
      q.correct_option_index < 0 ||
      q.correct_option_index > 3 ||
      !q.explanation ||
      !['beginner', 'intermediate', 'expert'].includes(q.difficulty)
    ) {
      throw new Error(`Invalid question structure: ${JSON.stringify(q).slice(0, 200)}`);
    }
  }

  return questions;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { category, dryRun } = parseArgs();
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('=== Quiz Question Generator ===');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no database writes)' : 'LIVE'}`);
  if (category) console.log(`Category filter: ${category}`);
  console.log();

  // Fetch published articles with content
  let query = supabase
    .from('wiki_articles')
    .select('slug, title, category, content_markdown')
    .eq('is_published', true)
    .not('content_markdown', 'is', null);

  // If category filter is set, find matching article categories
  if (category) {
    const matchingArticleCategories = Object.entries(ARTICLE_TO_QUIZ_CATEGORY)
      .filter(([, quizCat]) => quizCat === category)
      .map(([articleCat]) => articleCat);

    if (matchingArticleCategories.length === 0) {
      console.error(`No article categories map to quiz category "${category}"`);
      process.exit(1);
    }

    query = query.in('category', matchingArticleCategories);
  }

  const { data: articles, error } = await query;

  if (error) {
    console.error('Failed to fetch articles:', error.message);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('No articles found matching criteria.');
    return;
  }

  console.log(`Found ${articles.length} article(s) to process.\n`);

  let totalGenerated = 0;
  let totalInserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i] as WikiArticle;
    const quizCategory = ARTICLE_TO_QUIZ_CATEGORY[article.category];

    if (!quizCategory) {
      console.log(`  Skipping "${article.title}" — no quiz category mapping for "${article.category}"`);
      continue;
    }

    console.log(`[${i + 1}/${articles.length}] Processing: "${article.title}" (${article.category} -> ${quizCategory})`);

    try {
      const questions = await generateQuestionsFromArticle(article, quizCategory);
      totalGenerated += questions.length;

      if (dryRun) {
        // Print questions to console
        for (const q of questions) {
          console.log(`  [${q.difficulty}] ${q.question_text}`);
          q.options.forEach((opt, idx) => {
            const marker = idx === q.correct_option_index ? '*' : ' ';
            console.log(`    ${marker} ${idx}) ${opt}`);
          });
          console.log(`    Explanation: ${q.explanation}`);
          console.log();
        }
      } else {
        // Insert into database
        const rows = questions.map((q) => ({
          article_slug: article.slug,
          category: quizCategory,
          difficulty: q.difficulty,
          question_text: q.question_text,
          options: JSON.stringify(q.options),
          correct_option_index: q.correct_option_index,
          explanation: q.explanation,
          article_link: `/wiki/${article.category}/${article.slug}`,
          is_published: false,
        }));

        const { error: insertError } = await supabase
          .from('quiz_questions')
          .insert(rows);

        if (insertError) {
          console.error(`  Failed to insert questions: ${insertError.message}`);
          totalErrors++;
        } else {
          totalInserted += questions.length;
          console.log(`  Inserted ${questions.length} questions (is_published: false)`);
        }
      }
    } catch (err) {
      console.error(`  Error generating questions: ${err instanceof Error ? err.message : err}`);
      totalErrors++;
    }

    // Rate limit: 1 second pause between articles
    if (i < articles.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Report summary
  console.log('\n=== Summary ===');
  console.log(`Articles processed: ${articles.length}`);
  console.log(`Questions generated: ${totalGenerated}`);
  if (!dryRun) {
    console.log(`Questions inserted: ${totalInserted}`);
  }
  if (totalErrors > 0) {
    console.log(`Errors: ${totalErrors}`);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
