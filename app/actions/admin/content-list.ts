'use server'

import { requireAdmin } from '@/lib/admin/auth'
import {
  PER_PAGE,
  type ArticleRow,
  type ArticlesResult,
  type FeedbackResult,
  type FeedbackRow,
} from '@/lib/admin/list-types'

/**
 * Wiki-artikelen en feedback voor de Admin-modus in de chat.
 *
 * @ai-context: De artikelen zijn productie-inhoud, geen archief: de Encyclopedie-tab in
 * de iOS-app leest `wiki_articles` rechtstreeks. Een artikel hier op concept zetten haalt
 * het uit de app én van de publieke wiki op /wiki (TDR-0016).
 *
 * @ai-sync: lib/wiki/articles.ts (de publieke wiki leest dezelfde `is_published`)
 * @ai-sync: components/admin/chat/AdminContentPane.tsx
 */

export async function fetchArticles(
  status: 'all' | 'published' | 'draft' = 'all',
  page = 1,
): Promise<ArticlesResult> {
  const { supabase } = await requireAdmin()

  const veilig = Math.max(1, page)
  const from = (veilig - 1) * PER_PAGE

  let query = supabase
    .from('wiki_articles')
    .select('id, title, slug, category, view_count, is_published, updated_at', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, from + PER_PAGE - 1)

  if (status === 'published') query = query.eq('is_published', true)
  if (status === 'draft') query = query.eq('is_published', false)

  const [{ data, count, error }, gepubliceerd, concepten] = await Promise.all([
    query,
    supabase
      .from('wiki_articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('wiki_articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', false),
  ])

  if (error) throw new Error(`Artikelen ophalen mislukte: ${error.message}`)

  return {
    articles: (data ?? []) as ArticleRow[],
    count: count ?? 0,
    page: veilig,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PER_PAGE)),
    published: gepubliceerd.count ?? 0,
    drafts: concepten.count ?? 0,
  }
}

/**
 * @ai-gotcha: Dit raakt de iOS-app direct. Op concept zetten verwijdert het artikel uit
 * de Encyclopedie-tab van iedereen die de app open heeft; er is geen tussenstap en geen
 * bevestiging verderop.
 */
export async function setArticlePublished(id: string, published: boolean): Promise<void> {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('wiki_articles')
    .update({ is_published: published })
    .eq('id', id)

  if (error) throw new Error(`Opslaan mislukte: ${error.message}`)
}

/**
 * @ai-gotcha: Geen kolom `type` in de select. `app/(protected)/admin/feedback/page.tsx`
 * selecteert die wel, maar hij bestaat niet in de database en die pagina faalt er dus op.
 * De migraties in deze repo lopen achter op wat er live staat; ga hier op de database af
 * en niet op de migratiebestanden.
 */
export async function fetchFeedback(
  status = 'all',
  sort: 'vote_count' | 'created_at' = 'vote_count',
  page = 1,
): Promise<FeedbackResult> {
  const { supabase } = await requireAdmin()

  const veilig = Math.max(1, page)
  const from = (veilig - 1) * PER_PAGE

  let query = supabase
    .from('feature_requests')
    .select('id, title, description, status, vote_count, is_visible, created_at', { count: 'exact' })
    .order(sort, { ascending: false })
    .range(from, from + PER_PAGE - 1)

  if (status !== 'all') query = query.eq('status', status)

  const { data, count, error } = await query
  if (error) throw new Error(`Feedback ophalen mislukte: ${error.message}`)

  return {
    items: (data ?? []) as FeedbackRow[],
    count: count ?? 0,
    page: veilig,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PER_PAGE)),
  }
}

export async function setFeedbackStatus(id: string, status: string): Promise<void> {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('feature_requests').update({ status }).eq('id', id)
  if (error) throw new Error(`Opslaan mislukte: ${error.message}`)
}
