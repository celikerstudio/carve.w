import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getArticle, listArticles } from '@/lib/wiki/articles';
import { WIKI_CATEGORIES, categoryBySlug } from '@/lib/wiki/catalog';
import { wikiMetadata } from '@/lib/wiki/seo';

export const revalidate = 3600;
export const dynamicParams = true;

type Params = { category: string };

export function generateStaticParams(): Params[] {
  return WIKI_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  const cat = categoryBySlug(category);
  if (!cat) return {};
  return wikiMetadata({ title: cat.name, description: `Everything about ${cat.name.toLowerCase()} for people who lift, rated by evidence.`, path: `/wiki/${cat.slug}` });
}

/**
 * Een categorie, of een kort adres naar een artikel.
 *
 * @ai-why: `/wiki/<artikel>` stuurt permanent door naar `/wiki/<categorie>/<artikel>`
 *   (TDR-0016 §1). De chat en gedeelde korte links kennen alleen de slug, en zo hoeft niemand
 *   de categorie te weten. Een categorie en een artikel kunnen niet dezelfde slug hebben zolang
 *   er geen artikel "nutrition" of "training" heet; de categorie wint.
 * @ai-sync: components/chat/CockpitShell.tsx (`handleArticleClick` linkt naar `/wiki/<slug>`)
 */
export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const cat = categoryBySlug(category);
  if (!cat) {
    const article = await getArticle(category);
    if (article) permanentRedirect(article.href);
    notFound();
  }
  const articles = (await listArticles()).filter((a) => a.category === cat.name);

  return (
    <>
      <SiteHeader current={cat.name} />
      <main className="wiki-index">
        <div className="wiki-crumb"><Link href="/wiki">Wiki</Link> › {cat.name}</div>
        <h1>{cat.name}</h1>
        <p className="intro">{articles.length} articles, each rated by how strong the evidence is.</p>
        <div className="wiki-list" style={{ marginTop: 32 }}>
          {articles.map((a) => (
            <Link key={a.slug} href={a.href}>
              {a.title}
              <span />
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
