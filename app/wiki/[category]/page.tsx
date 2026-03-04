import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCategoryColor } from '@/lib/wiki/category-colors';
import { EvidenceRating } from '@/components/wiki/EvidenceRating';
import { Eye } from 'lucide-react';

// URL slug -> DB category name + metadata
const VALID_CATEGORIES: Record<string, { title: string; dbName: string; description: string }> = {
  'training': {
    title: 'Training',
    dbName: 'Training',
    description: 'Strength training, hypertrophy, programming, and exercise techniques',
  },
  'nutrition': {
    title: 'Nutrition',
    dbName: 'Nutrition',
    description: 'Macronutrients, meal timing, dieting strategies, and food science',
  },
  'supplements': {
    title: 'Supplements',
    dbName: 'Supplements',
    description: 'Evidence-based supplement guides, dosages, and effectiveness',
  },
  'recovery': {
    title: 'Recovery',
    dbName: 'Recovery',
    description: 'Sleep, mobility, injury prevention, and recovery protocols',
  },
  'mindset': {
    title: 'Mindset',
    dbName: 'Mindset',
    description: 'Goal setting, discipline, habits, and mental performance',
  },
  'money': {
    title: 'Money',
    dbName: 'Money',
    description: 'Personal finance, investing, budgeting, and financial independence',
  },
  'travel': {
    title: 'Travel',
    dbName: 'Travel',
    description: 'Travel planning, destinations, tips, and experiences',
  },
};

const CATEGORY_IMAGES: Record<string, string> = {
  training: '/images/wiki/category-training.jpg',
  nutrition: '/images/wiki/category-nutrition.jpg',
  supplements: '/images/wiki/category-supplements.jpg',
  recovery: '/images/wiki/category-recovery.jpg',
  mindset: '/images/wiki/category-mindset.jpg',
  money: '/images/wiki/category-money.jpg',
  travel: '/images/wiki/category-travel.jpg',
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const cat = VALID_CATEGORIES[category];
  if (!cat) return { title: 'Category Not Found' };
  return {
    title: `${cat.title} | Carve Wiki`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = VALID_CATEGORIES[category];
  if (!cat) notFound();

  const colors = getCategoryColor(cat.dbName);

  const supabase = await createClient();
  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('slug, title, summary, evidence_rating, view_count, updated_at, tags, image_url')
    .eq('category', cat.dbName)
    .eq('is_published', true)
    .order('view_count', { ascending: false });

  return (
    <div>
      {/* Category Hero */}
      <div className="relative h-[200px] md:h-[250px] rounded-2xl overflow-hidden mx-4 md:mx-6 mt-4">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-10">
          <nav className="mb-3 text-sm text-white/50">
            <Link href="/" className="hover:text-white/70 transition-colors">Wiki</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">{cat.title}</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{cat.title}</h1>
          <p className="text-sm text-white/60">{cat.description}</p>
          <p className="text-xs text-white/40 mt-1">{articles?.length || 0} articles</p>
        </div>
      </div>

      {/* Articles Grid */}
      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-6 mt-8 pb-12">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/wiki/${category}/${article.slug}`}
              className="group bg-surface-raised rounded-xl border border-subtle overflow-hidden shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200">
                {article.image_url && (
                  <Image src={article.image_url} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="p-4">
                <div className="mb-2">
                  <EvidenceRating rating={article.evidence_rating} />
                </div>
                <h2 className="font-semibold text-ink group-hover:text-ink-secondary mb-1 line-clamp-2">
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="text-sm text-ink-secondary line-clamp-2">{article.summary}</p>
                )}
                <div className="flex items-center gap-1 mt-2 text-xs text-ink-tertiary">
                  <Eye className="w-3 h-3" />
                  {article.view_count}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-ink-tertiary">No articles yet in this category.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-ink-secondary hover:text-ink">
            Back to Wiki
          </Link>
        </div>
      )}
    </div>
  );
}

export const revalidate = 3600;
