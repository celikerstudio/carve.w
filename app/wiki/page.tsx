import { WikiHomeContent } from './wiki-home-content';
import { PopularToday } from '@/components/wiki/PopularToday';
import { createClient } from '@/lib/supabase/server';

async function getCategoryCounts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('wiki_articles')
    .select('category')
    .eq('is_published', true);

  const counts: Record<string, number> = {};
  data?.forEach((article) => {
    // Map DB category names to lowercase slugs for URL matching
    const slug = article.category.toLowerCase();
    counts[slug] = (counts[slug] || 0) + 1;
  });
  return counts;
}

async function getLatestArticles() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('wiki_articles')
    .select('slug, title, category, summary, image_url, evidence_rating, view_count, created_at, content_html')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6);
  return data || [];
}

export const metadata = {
  title: 'Carve Wiki - Self-Improvement Knowledge Base',
  description: 'Evidence-based knowledge on health, fitness, finance, and personal growth.',
  openGraph: {
    title: 'Carve Wiki - Self-Improvement Knowledge Base',
    description: 'Evidence-based knowledge on health, fitness, finance, and personal growth.',
  }
};

export default async function WikiPage() {
  const [counts, latestArticles] = await Promise.all([
    getCategoryCounts(),
    getLatestArticles(),
  ]);

  return (
    <WikiHomeContent
      counts={counts}
      latestArticles={latestArticles}
      popularToday={<PopularToday />}
    />
  );
}

export const revalidate = 3600;
