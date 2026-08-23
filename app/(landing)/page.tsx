import { LandingPage } from '@/components/landing/LandingPage'

export const metadata = {
  title: 'Carve — Your AI Life Coach',
  description: 'One coach across your health, money and life. Pick a direction and start.',
  openGraph: {
    title: 'Carve — Your AI Life Coach',
    description: 'One coach across your health, money and life.',
  },
}

export default function Landing() {
  return <LandingPage />
}
