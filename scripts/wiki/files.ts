import fs from 'node:fs';
import path from 'node:path';
import { categoryByName } from '../../lib/wiki/catalog';
import { parseArticleFile, serializeArticleFile, type ArticleFile } from '../../lib/wiki/source-file';

/**
 * Lezen en schrijven van `content/wiki/<categorie>/<slug>.md` (TDR-0017 §3).
 * Gedeeld door export, check en sync, zodat er één plek is die weet waar een artikel staat.
 */
export const CONTENT_DIR = path.join(process.cwd(), 'content/wiki');

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
