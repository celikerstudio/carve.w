import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site/SiteHeader';
import { AnswerCalculator } from '@/components/wiki/public/AnswerCalculator';
import { VisitorTease } from '@/components/wiki/public/VisitorTease';
import { OnThisPage } from '@/components/wiki/public/OnThisPage';
import { CharacterCard } from '@/components/wiki/public/CharacterCard';
import { SeeAlso, Sources, WikiSidebar } from '@/components/wiki/public/ArticleParts';
import { getArticle, getCitations, linkMap, listArticles, seeAlso } from '@/lib/wiki/articles';
import { CALCULATORS, EVIDENCE_LABEL, categoryBySlug, categoryByName, readMinutes } from '@/lib/wiki/catalog';
import { renderArticle, renderFragment, splitTakeaway } from '@/lib/wiki/render';
import { articleJsonLd, wikiMetadata } from '@/lib/wiki/seo';

// @ai-why: Statisch, een keer per uur ververst (TDR-0016 §2). Een nieuw artikel in de database
//   verschijnt dus binnen het uur zonder deploy; `dynamicParams` laat een artikel dat na de build
//   is toegevoegd ook meteen renderen.
export const revalidate = 3600;
export const dynamicParams = true;

type Params = { category: string; slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const all = await listArticles();
  return all.map((a) => ({ category: categoryByName(a.category)!.slug, slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return wikiMetadata({ title: article.title, description: article.summary, path: article.href });
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  // @ai-why: Een artikel onder de verkeerde categorie stuurt door naar zijn eigen adres, zodat er
  //   per artikel één adres in Google staat.
  if (categoryBySlug(category)?.name !== article.category) permanentRedirect(article.href);

  const [all, citations, links, also] = await Promise.all([listArticles(), getCitations(article.id), linkMap(), seeAlso(article)]);
  const { takeaway, rest } = splitTakeaway(article.markdown);
  const { html, toc } = await renderArticle(rest, links);
  const calc = CALCULATORS[slug];
  const answer = !calc && takeaway ? await renderFragment(takeaway, links) : null;
  const cat = categoryByName(article.category)!;

  return (
    <>
      <SiteHeader current={article.category} />
      <script
        type="application/ld+json"
        // JSON-LD uit onze eigen database, via JSON.stringify en met < ge-escapet.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd({ ...article, categoryHref: `/wiki/${cat.slug}` })).replace(/</g, '\\u003c'),
        }}
      />
      <div className="wiki-wrap">
        <WikiSidebar category={article.category} articles={all} current={slug} />

        <article>
          <div className="wiki-crumb">
            <Link href="/wiki">Wiki</Link> › <Link href={`/wiki/${cat.slug}`}>{cat.name}</Link> › {article.title}
          </div>
          <h1>{article.title}</h1>
          {article.summary && <div className="wiki-sum">{article.summary}</div>}
          <div className="wiki-meta">
            <span className="ev">{EVIDENCE_LABEL[article.evidence] ?? EVIDENCE_LABEL['expert-consensus']}</span>
            {citations.length > 0 && <span>{citations.length} {citations.length === 1 ? 'source' : 'sources'}</span>}
            <span>{readMinutes(article.markdown)} min read</span>
          </div>

          {(calc || answer) && (
            <div className="wiki-answer">
              {calc ? <AnswerCalculator calc={calc} /> : <div dangerouslySetInnerHTML={{ __html: answer! }} />}
            </div>
          )}
          <VisitorTease category={article.category} />

          <div className="wiki-prose" dangerouslySetInnerHTML={{ __html: html }} />

          <Sources citations={citations} />
          <SeeAlso articles={also} />
        </article>

        <aside className="wiki-right">
          <OnThisPage toc={toc} />
          <CharacterCard />
        </aside>
      </div>
    </>
  );
}
