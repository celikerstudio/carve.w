import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCategoryColor } from '@/lib/wiki/category-colors';

interface PopularArticle {
  slug: string;
  title: string;
  category: string;
  view_count: number;
}

async function getPopularArticles() {
  const supabase = await createClient();

  // Try to get today's popular articles
  const { data } = await supabase.rpc('get_popular_today', {
    limit_count: 5,
  });

  // If no views today, fall back to all-time popular
  if (!data || data.length === 0) {
    const { data: allTimeData } = await supabase
      .from('wiki_articles')
      .select('slug, title, category, view_count')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(5);

    return allTimeData || [];
  }

  return data;
}

export async function PopularToday() {
  const articles = await getPopularArticles();

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="divide-y divide-subtle">
      {articles.map((article: any, index: number) => {
        const colors = getCategoryColor(article.category);
        return (
          <Link
            key={article.slug}
            href={`/wiki/${article.category.toLowerCase()}/${article.slug}`}
            className="group flex items-center gap-4 py-3 hover:bg-surface -mx-2 px-2 rounded-lg transition-colors"
          >
            <span className="text-xs font-medium text-ink-tertiary w-5 text-right">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-sm text-ink group-hover:text-ink">
                {article.title}
              </span>
            </div>
            <span className={`text-xs ${colors.text}`}>
              {article.category.replace(/-/g, ' ')}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
