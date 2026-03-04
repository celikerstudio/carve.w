'use client';

// @ai-why: Scroll-triggered reveal animations for marketing/landing pages.
// Supports fade-up, fade, slide-left, slide-right, scale variants.
// Uses IntersectionObserver for in/out/exit states.

import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { useRef, ReactNode, useEffect, useState } from 'react';
import { EASE } from '@/lib/motion-config';

type AnimationType = 'fade-up' | 'fade' | 'slide-left' | 'slide-right' | 'scale';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
}

const animations: Record<AnimationType, Variants> = {
  'fade-up': {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  'fade': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  },
  'scale': {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
};

export function ScrollReveal({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  duration = 0.6,
  once = false,
  threshold = 0.15,
}: ScrollRevealProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'hidden' | 'visible' | 'exit'>('hidden');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState('visible');
          } else {
            const rect = entry.boundingClientRect;
            if (rect.top > 0) {
              setState('exit');
            } else {
              setState('hidden');
            }
          }
        });
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once]);

  if (prefersReduced) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={state}
      variants={animations[animation]}
      transition={{
        duration: state === 'exit' ? duration * 0.5 : duration,
        delay: state === 'visible' ? delay : 0,
        ease: EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.1 });

  if (prefersReduced) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  animation = 'fade-up',
}: {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
}) {
  return (
    <motion.div
      variants={animations[animation]}
      transition={{
        duration: 0.5,
        ease: EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
