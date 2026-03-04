import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCategoryColor } from '@/lib/wiki/category-colors';

interface RelatedArticlesProps {
  currentSlug: string;
  category: string;
}

export async function RelatedArticles({ currentSlug, category }: RelatedArticlesProps) {
  const supabase = await createClient();

  // Get 3 related articles from same category
  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('slug, title, summary, category')
    .eq('category', category)
    .eq('is_published', true)
    .neq('slug', currentSlug)
    .order('view_count', { ascending: false })
    .limit(3);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink mb-4">Related</h2>
      <div className="space-y-2">
        {articles.map((article: any) => (
          <Link
            key={article.slug}
            href={`/wiki/${category}/${article.slug}`}
            className="group block py-2 hover:bg-surface -mx-2 px-2 rounded-lg transition-colors"
          >
            <span className="text-sm text-ink-secondary group-hover:text-ink">{article.title}</span>
            {article.summary && (
              <p className="text-xs text-ink-tertiary line-clamp-1 mt-0.5">{article.summary}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
