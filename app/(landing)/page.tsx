import { LandingPage } from '@/components/landing/LandingPage'

export const metadata = {
  title: 'Carve — Your AI Life Coach',
  description: 'One AI that manages your health, money, life, and inbox. ChatGPT knows everything. Carve knows you.',
  openGraph: {
    title: 'Carve — Your AI Life Coach',
    description: 'One AI that manages your health, money, life, and inbox.',
  },
}

export default function Landing() {
  return <LandingPage />
}
