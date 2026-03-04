'use client';

// @ai-why: Wiki homepage content — hero, categories grid, latest articles, trending.
// Uses semantic tokens (renders inside .wiki-light wrapper).

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { SearchBar } from '@/components/wiki/SearchBar';
import { getCategoryColor } from '@/lib/wiki/category-colors';
import { estimateReadTime } from '@/lib/wiki/read-time';
import { SPRING_GENTLE, STAGGER } from '@/lib/motion-config';

interface WikiArticle {
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  image_url: string | null;
  evidence_rating: string;
  view_count: number;
  created_at: string;
  content_html: string | null;
}

interface WikiHomeContentProps {
  counts: Record<string, number>;
  latestArticles: WikiArticle[];
  popularToday: ReactNode;
}

const categories = [
  { title: "Training", slug: "training", description: "Strength training, hypertrophy, programming, and exercise techniques" },
  { title: "Nutrition", slug: "nutrition", description: "Macronutrients, meal timing, dieting strategies, and food science" },
  { title: "Supplements", slug: "supplements", description: "Evidence-based supplement guides, dosages, and effectiveness" },
  { title: "Recovery", slug: "recovery", description: "Sleep, mobility, injury prevention, and recovery protocols" },
  { title: "Mindset", slug: "mindset", description: "Goal setting, discipline, habits, and mental performance" },
  { title: "Money", slug: "money", description: "Personal finance, investing, budgeting, and financial independence" },
  { title: "Travel", slug: "travel", description: "Travel planning, destinations, tips, and experiences" },
];

export function WikiHomeContent({ counts, latestArticles, popularToday }: WikiHomeContentProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-8 pb-12">
        <motion.div
          initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_GENTLE}
          className="relative rounded-2xl overflow-hidden h-[300px] md:h-[400px]"
        >
          {/* Gradient fallback — always visible behind image */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Carve Wiki</h1>
            <p className="text-base text-white/70 mb-10">Evidence-based fitness knowledge</p>
            <div className="w-full max-w-xl">
              <SearchBar />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="pb-12">
        <p className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-4">Browse by topic</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((category, i) => {
            const colors = getCategoryColor(category.slug);
            return (
              <motion.div
                key={category.slug}
                initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_GENTLE, delay: i * STAGGER }}
              >
                <Link
                  href={`/wiki/${category.slug}`}
                  className="group flex items-start gap-3 rounded-xl p-4 bg-surface-raised border border-subtle shadow-card hover:shadow-card-hover transition-all"
                >
                  <span
                    className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: colors.hex }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-sm font-medium text-ink group-hover:text-ink-secondary">
                        {category.title}
                      </h3>
                      <span className="text-xs text-ink-tertiary">
                        {counts[category.slug] || 0}
                      </span>
                    </div>
                    <p className="text-xs text-ink-secondary mt-0.5 line-clamp-1">
                      {category.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section className="pb-12">
          <p className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-4">Latest articles</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestArticles.map((article, i) => {
              const colors = getCategoryColor(article.category);
              const readTime = article.content_html ? estimateReadTime(article.content_html) : null;
              return (
                <motion.div
                  key={article.slug}
                  initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING_GENTLE, delay: i * STAGGER }}
                >
                  <Link
                    href={`/wiki/${article.category.toLowerCase()}/${article.slug}`}
                    className="group bg-surface-raised rounded-xl border border-subtle overflow-hidden shadow-card hover:shadow-card-hover transition-all block"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                      {article.image_url && (
                        <Image src={article.image_url} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium ${colors.textLight}`}>
                          {article.category}
                        </span>
                        {readTime && (
                          <>
                            <span className="text-xs text-ink-tertiary">·</span>
                            <span className="text-xs text-ink-tertiary">{readTime} min read</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-semibold text-ink group-hover:text-ink-secondary mb-1 line-clamp-2">
                        {article.title}
                      </h3>
                      {article.summary && (
                        <p className="text-sm text-ink-secondary line-clamp-2">{article.summary}</p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Trending */}
      <section className="pb-20">
        <p className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-4">Trending today</p>
        {popularToday}
      </section>
    </div>
  );
}
