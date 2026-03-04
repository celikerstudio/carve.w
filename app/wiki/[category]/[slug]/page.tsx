import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient, createBuildClient } from '@/lib/supabase/server';
import { ArticleLayout } from '@/components/wiki/ArticleLayout';
import { ViewTracker } from '@/components/wiki/ViewTracker';
import { remark } from 'remark';
import html from 'remark-html';

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Fetch article from database
async function getArticle(slug: string) {
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from('wiki_articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !article) {
    return null;
  }

  return article;
}

// Fetch citations for article
async function getCitations(slug: string) {
  const supabase = await createClient();

  const { data: citations } = await supabase
    .from('wiki_citations')
    .select('*')
    .eq('article_slug', slug)
    .order('citation_number', { ascending: true });

  return citations || [];
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | Carve Wiki`,
    description: article.summary || `Learn about ${article.title} in the Carve fitness encyclopedia`,
    keywords: article.tags?.join(', '),
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      authors: [article.author],
      tags: article.tags,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { category, slug } = await params;

  // Fetch article and citations
  const [article, citations] = await Promise.all([
    getArticle(slug),
    getCitations(slug),
  ]);

  if (!article) {
    notFound();
  }

  // Use pre-rendered HTML from database, or convert markdown on the fly
  let articleHtml = article.content_html || '';
  if (!articleHtml && article.content_markdown) {
    const result = await remark().use(html).process(article.content_markdown);
    articleHtml = result.toString();
  }

  return (
    <>
      {/* Track view (client-side, privacy-friendly) */}
      <ViewTracker slug={slug} />

      {/* Article layout with TOC, content, citations */}
      <ArticleLayout
        article={article}
        citations={citations}
        html={articleHtml}
        category={category}
      />
    </>
  );
}

// Generate static params for all published articles (ISR)
export async function generateStaticParams() {
  const supabase = createBuildClient();

  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('slug, category')
    .eq('is_published', true);

  if (!articles) return [];

  return articles.map((article) => ({
    category: article.category.toLowerCase(),
    slug: article.slug,
  }));
}

// Revalidate every hour (ISR)
export const revalidate = 3600;
