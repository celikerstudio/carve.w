import type { Metadata } from 'next'
import { KnowledgeHubContent } from './knowledge-hub-content'

export const metadata: Metadata = {
  title: 'Knowledge Hub | Carve Wiki',
  description: 'Test your knowledge across 7 categories. Earn XP, unlock ranks, and level up.',
}

export default function KnowledgeHubPage() {
  return <KnowledgeHubContent />
}
