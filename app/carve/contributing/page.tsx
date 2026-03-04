'use client';

import { motion } from 'framer-motion';
import { Bug, Lightbulb, FileEdit, MessageSquare, Check } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { CarveFooter } from '@/components/carve/CarveFooter';
import { ContactForm } from '@/components/carve/ContactForm';

const CONTRIBUTIONS = [
  {
    icon: Bug,
    color: '#EF4444',
    title: 'Report Bugs',
    description:
      'Found something broken? Let us know. Include steps to reproduce, expected behavior, and screenshots if possible.',
  },
  {
    icon: Lightbulb,
    color: '#D4A843',
    title: 'Suggest Features',
    description:
      "Have an idea for a new feature? We'd love to hear it. Explain the problem it solves and how it would work.",
  },
  {
    icon: FileEdit,
    color: '#3B82F6',
    title: 'Improve the Wiki',
    description:
      'Know your stuff about fitness or nutrition? Contribute articles, fix errors, or suggest new topics.',
  },
  {
    icon: MessageSquare,
    color: '#A855F7',
    title: 'General Feedback',
    description:
      "Thoughts on the app? UX suggestions? Questions about the project? All feedback is welcome.",
  },
];

const GUIDELINES = [
  {
    title: 'Be Specific',
    description: 'The more details you provide, the better we can address your feedback.',
  },
  {
    title: 'Be Constructive',
    description: 'Criticism is welcome, but please keep it constructive and respectful.',
  },
  {
    title: 'Search First',
    description: 'Check the FAQ and updates to see if your question has already been answered.',
  },
  {
    title: 'One Issue Per Submission',
    description: 'Multiple bugs or suggestions? Please submit them separately.',
  },
];

export default function ContributingPage() {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white overflow-y-auto">
      {/* Hero Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <ScrollReveal animation="fade-up">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
              Contribute to Carve
            </h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={0.15}>
            <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-2xl mx-auto mt-6">
              Help shape the future of Carve. Every piece of feedback matters.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Ways to Contribute */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-12 tracking-tight">
              Ways to Contribute
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-4">
            {CONTRIBUTIONS.map((item, index) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} animation="fade-up" delay={index * 0.1}>
                  <div
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-6 border-l-2"
                    style={{ borderLeftColor: item.color }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guidelines */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-12 tracking-tight">
              Guidelines
            </h2>
          </ScrollReveal>
          <div className="space-y-6">
            {GUIDELINES.map((guideline, index) => (
              <ScrollReveal key={guideline.title} animation="fade-up" delay={index * 0.1}>
                <div className="flex items-start gap-4">
                  <Check className="w-4 h-4 text-white/30 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">{guideline.title}</h4>
                    <p className="text-white/40 text-sm">{guideline.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-12 tracking-tight">
            Submit Your Feedback
          </h2>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={0.1}>
          <div className="max-w-2xl mx-auto rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8">
            <ContactForm />
          </div>
        </ScrollReveal>
      </section>

      {/* Thank You */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="max-w-3xl mx-auto rounded-2xl border border-white/[0.08] bg-white/[0.04] p-10 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Thank You</h3>
              <p className="text-white/50">
                Every piece of feedback helps make Carve better. We read and consider every
                submission.
              </p>
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
