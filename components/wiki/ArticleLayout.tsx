import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { getCategoryColor } from '@/lib/wiki/category-colors';
import { estimateReadTime } from '@/lib/wiki/read-time';
import { EvidenceRating } from './EvidenceRating';
import { TableOfContents } from './TableOfContents';
import { SourcesList } from './SourcesList';
import { RelatedArticles } from './RelatedArticles';
import { CitationEnhancer } from './CitationEnhancer';
import { ExpertReviewBadge } from './ExpertReviewBadge';
import { UpdateAlert } from './UpdateAlert';
import { ReadingProgress } from './ReadingProgress';
import { PostArticleQuiz } from '@/components/quiz/PostArticleQuiz';

interface Article {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  evidence_rating: string;
  author: string;
  reviewers?: string[];
  summary: string;
  view_count: number;
  needs_update?: boolean;
  created_at: string;
  updated_at: string;
  content_html: string;
  image_url?: string | null;
}

interface Citation {
  citation_number: number;
  authors: string;
  year: number | null;
  title: string;
  publication: string;
  url: string | null;
}

interface ArticleLayoutProps {
  article: Article;
  citations: Citation[];
  html: string;
  category: string;
}

export function ArticleLayout({ article, citations, html, category }: ArticleLayoutProps) {
  const updatedDate = new Date(article.updated_at);
  const timeAgo = formatDistanceToNow(updatedDate, { addSuffix: true });
  const colors = getCategoryColor(category);

  return (
    <div>
      <ReadingProgress color={colors.hex} />

      {/* Hero Image */}
      <div className="relative h-[350px] md:h-[450px] rounded-2xl overflow-hidden mx-4 md:mx-6 mt-4">
        {article.image_url ? (
          <Image src={article.image_url} alt="" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/20 capitalize">
              {category.replace(/-/g, ' ')}
            </span>
            <span className="text-sm text-white/70">{estimateReadTime(html)} min read</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/60">
            <EvidenceRating rating={article.evidence_rating} variant="hero" />
            <span>By {article.author}</span>
            <span>Updated {timeAgo}</span>
            <span>{article.view_count.toLocaleString()} views</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition-colors">Wiki</Link>
          <span className="mx-2">/</span>
          <Link href={`/wiki/${category}`} className="hover:text-gray-600 transition-colors capitalize">
            {category.replace(/-/g, ' ')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{article.title}</span>
        </nav>

        <div className="flex gap-16">
          {/* Main Content */}
          <article className="min-w-0 flex-1 max-w-[680px]">
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-500 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {article.needs_update && <UpdateAlert />}

            {article.reviewers && article.reviewers.length > 0 && (
              <div className="mb-8">
                <ExpertReviewBadge reviewers={article.reviewers} />
              </div>
            )}

            {article.summary && (
              <div className="mb-10 py-4 border-l-2 pl-5" style={{ borderLeftColor: colors.hex }}>
                <p className="text-gray-500 leading-relaxed">{article.summary}</p>
              </div>
            )}

            <div
              className="prose max-w-none
                prose-headings:text-gray-900 prose-headings:font-semibold
                prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
                prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-600 prose-p:leading-[1.8] prose-p:mb-5
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-800 prose-strong:font-medium
                prose-ul:my-4 prose-ol:my-4
                prose-li:text-gray-600 prose-li:leading-[1.8]
                prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-gray-200
                prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <CitationEnhancer citations={citations} />

            {citations.length > 0 && (
              <div className="mt-16 pt-8 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Sources</h2>
                <SourcesList citations={citations} />
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-gray-200">
              <RelatedArticles currentSlug={article.slug} category={category} />
            </div>

            <PostArticleQuiz articleSlug={article.slug} category={article.category} />
          </article>

          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-12">
              <TableOfContents html={html} category={category} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
