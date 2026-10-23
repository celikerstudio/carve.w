import fs from 'node:fs';
import matter from 'gray-matter';
import path from 'node:path';
import { categoryByName } from '../../lib/wiki/catalog';
import { parseArticleFile, serializeArticleFile, type ArticleFile } from '../../lib/wiki/source-file';
import { parseTipFile, type TipFile } from '../../lib/wiki/tips';

/**
 * Lezen en schrijven van `content/wiki/<categorie>/<slug>.md` (TDR-0017 §3).
 * Gedeeld door export, check en sync, zodat er één plek is die weet waar een artikel staat.
 */
export const CONTENT_DIR = path.join(process.cwd(), 'content/wiki');

/** De tips van de dag, één bestand per artikel (Carve-AI ADR-104). */
export const TIPS_DIR = path.join(process.cwd(), 'content/tips');

/**
 * @ai-why: Een bestand dat geen geldige YAML is, komt terug met `error` in plaats van het hele
 *   script te laten crashen. Anders zie je bij de eerste dubbele punt in een zin een stacktrace van
 *   js-yaml en niet welk bestand het is.
 */
export function readTipFiles(): { file: TipFile; slug: string; path: string; error?: string }[] {
  if (!fs.existsSync(TIPS_DIR)) return [];
  return fs
    .readdirSync(TIPS_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .sort()
    .map((f) => {
      const p = path.join(TIPS_DIR, f);
      const slug = f.replace(/\.yaml$/, '');
      try {
        return { file: parseTipFile(fs.readFileSync(p, 'utf8')), slug, path: p };
      } catch (e) {
        const reason = e instanceof Error ? e.message.split('\n')[0] : String(e);
        return { file: { article: slug, tips: [] }, slug, path: p, error: `geen geldige YAML: ${reason}` };
      }
    });
}

export function articlePath(a: Pick<ArticleFile, 'slug' | 'category'>): string {
  const cat = categoryByName(a.category);
  if (!cat) throw new Error(`${a.slug}: onbekende categorie "${a.category}"`);
  return path.join(CONTENT_DIR, cat.slug, `${a.slug}.md`);
}

export function readArticleFiles(): { file: ArticleFile; path: string }[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) =>
      fs
        .readdirSync(path.join(CONTENT_DIR, d.name))
        .filter((f) => f.endsWith('.md'))
        .map((f) => {
          const p = path.join(CONTENT_DIR, d.name, f);
          return { file: parseArticleFile(f.replace(/\.md$/, ''), fs.readFileSync(p, 'utf8')), path: p };
        }),
    )
    .sort((a, b) => a.file.slug.localeCompare(b.file.slug));
}

export function writeArticleFile(a: ArticleFile): string {
  const p = articlePath(a);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, serializeArticleFile(a));
  return p;
}

/**
 * De url's van de bronnen in `content/wiki/bronnen/` die handmatig geciteerd zijn. Alleen die mogen
 * als bron zonder DOI onder een artikel (`lintArticle`).
 */
export function readManualSourceUrls(): Set<string> {
  const urls = new Set<string>();
  for (const sub of ['richtlijnen', 'studies']) {
    const dir = path.join(CONTENT_DIR, 'bronnen', sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.md'))) {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'), {});
      if (data.url && content.includes('## Passages (handmatig geciteerd)')) urls.add(String(data.url));
    }
  }
  return urls;
}
