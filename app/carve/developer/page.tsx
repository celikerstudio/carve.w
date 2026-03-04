'use client';

import { motion } from 'framer-motion';
import {
  Github,
  Linkedin,
  Mail,
  Coffee,
  Gamepad2,
  Users,
  BookOpen,
  Rocket,
  Heart,
  Minimize2,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { CarveFooter } from '@/components/carve/CarveFooter';

const SOCIALS = [
  { icon: Github, href: '#' },
  { icon: Linkedin, href: '#' },
  { icon: Mail, href: 'mailto:hello@carve.wiki' },
];

const MOTIVATIONS = [
  {
    icon: Gamepad2,
    color: '#D4A843',
    title: 'Gamification Done Right',
    description:
      'Most fitness apps add points as an afterthought. I want a true RPG experience where every workout makes you stronger — in the app and in real life.',
  },
  {
    icon: Users,
    color: '#3B82F6',
    title: 'Community First',
    description:
      'Fitness is better with friends. A platform where people motivate each other, compete healthily, and celebrate wins together.',
  },
  {
    icon: BookOpen,
    color: '#22C55E',
    title: 'Education Matters',
    description:
      "There's so much misinformation in fitness. The Wiki provides evidence-based knowledge to help people make informed decisions.",
  },
  {
    icon: Rocket,
    color: '#A855F7',
    title: 'Building in Public',
    description:
      'Developing transparently — sharing progress, listening to feedback, and involving the community in shaping the product.',
  },
];

const TECH_STACK = [
  { name: 'Next.js', role: 'Framework', span: 2 },
  { name: 'Supabase', role: 'Backend & Database', span: 2 },
  { name: 'React Native', role: 'Mobile App', span: 2 },
  { name: 'React', role: 'UI Library', span: 1 },
  { name: 'TypeScript', role: 'Language', span: 1 },
  { name: 'Tailwind CSS', role: 'Styling', span: 1 },
  { name: 'Framer Motion', role: 'Animation', span: 1 },
  { name: 'Vercel', role: 'Hosting', span: 1 },
  { name: 'Cloudflare', role: 'CDN', span: 1 },
];

const PHILOSOPHY = [
  {
    icon: Heart,
    title: 'User First',
    description: 'Every feature decision is based on what makes the user experience better.',
  },
  {
    icon: Rocket,
    title: 'Ship Fast',
    description: 'Iterate quickly based on real feedback rather than building in isolation.',
  },
  {
    icon: Minimize2,
    title: 'Stay Lean',
    description: 'Simple solutions over complex ones. No feature bloat.',
  },
];

export default function DeveloperPage() {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white overflow-y-auto">
      {/* Hero Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            className="text-white/40 text-lg"
          >
            Built by
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mt-3"
          >
            Furkan Celiker
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/40 mt-4"
          >
            Independent developer · Amsterdam
          </motion.p>
        </div>
      </section>

      {/* About Card */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8">
              <p className="text-white/50 leading-relaxed mb-4">
                Passionate about fitness, technology, and creating products that make a real
                difference. After years of training and trying countless fitness apps, I wanted
                something different: an app that makes tracking fun, celebrates progress, and brings
                people together.
              </p>
              <p className="text-white/50 leading-relaxed">
                So I decided to build it myself. Carve is my answer to the question:{' '}
                <span className="text-white font-medium">
                  &quot;What if self-improvement felt like leveling up in a game?&quot;
                </span>
              </p>

              {/* Social links */}
              <div className="mt-8 flex gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    className="w-10 h-10 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why I'm Building Carve */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-white mb-8">Why I&apos;m Building Carve</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-4">
            {MOTIVATIONS.map((motivation, index) => {
              const Icon = motivation.icon;
              return (
                <ScrollReveal key={motivation.title} animation="fade-up" delay={index * 0.1}>
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
                      style={{ backgroundColor: `${motivation.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: motivation.color }} />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{motivation.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {motivation.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Bento Grid */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-white mb-8">Tech Stack</h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TECH_STACK.map((tech, index) => (
              <ScrollReveal
                key={tech.name}
                animation="fade-up"
                delay={index * 0.05}
                className={tech.span === 2 ? 'col-span-2' : 'col-span-1'}
              >
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-5 h-full">
                  <p
                    className={`text-white font-semibold ${
                      tech.span === 2 ? 'text-xl' : 'text-lg'
                    }`}
                  >
                    {tech.name}
                  </p>
                  <p className="text-white/40 text-sm">{tech.role}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Development Philosophy */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-white mb-8">Development Philosophy</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-4">
            {PHILOSOPHY.map((item, index) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} animation="fade-up" delay={index * 0.1}>
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 text-center">
                    <Icon className="w-6 h-6 text-white/30 mx-auto mb-4" />
                    <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-12 text-center">
              <Coffee className="w-10 h-10 text-white/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Support Development</h3>
              <p className="text-white/50 mb-6">
                Carve is an independent project. Your support helps keep it alive.
              </p>
              <p className="text-white/30 text-sm">Support options coming soon</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <CarveFooter />
        </div>
      </footer>
    </div>
  );
}
