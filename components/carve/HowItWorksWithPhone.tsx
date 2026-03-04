"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dumbbell, TrendingUp, Trophy, Users, CheckCircle2, Play, Flame, Target } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Log your workout",
    description: "Track exercises, sets, reps, and weight with our intuitive interface.",
    icon: Dumbbell,
  },
  {
    number: "02",
    title: "Earn XP & level up",
    description: "Every workout earns you experience points. Watch your character grow stronger.",
    icon: TrendingUp,
  },
  {
    number: "03",
    title: "Unlock achievements",
    description: "Hit milestones, break PRs, and collect badges for your accomplishments.",
    icon: Trophy,
  },
  {
    number: "04",
    title: "Compete with friends",
    description: "Join leaderboards, challenge friends, and climb the ranks together.",
    icon: Users,
  },
];

export default function HowItWorksWithPhone() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // IntersectionObserver to track which step is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveStep(index);
            }
          });
        },
        {
          rootMargin: "-40% 0px -40% 0px",
          threshold: 0,
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
            How it works
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Your fitness journey, gamified
          </h2>
        </div>

        {/* Main content: Timeline + Phone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gray-700" />

            {/* Animated progress line */}
            <motion.div
              className="absolute left-4 md:left-6 top-0 w-px bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 origin-top"
              animate={{
                scaleY: (activeStep + 1) / STEPS.length,
              }}
              transition={{ duration: 0.4 }}
              style={{
                height: "100%",
              }}
            />

            {/* Steps */}
            <div className="space-y-32 md:space-y-48 lg:space-y-64">
              {STEPS.map((step, index) => (
                <div
                  key={step.number}
                  ref={(el) => { stepRefs.current[index] = el; }}
                >
                  <TimelineStep
                    step={step}
                    index={index}
                    activeStep={activeStep}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sticky Phone */}
          <div className="hidden lg:block">
            <div className="sticky top-1/4">
              <PhoneMockup activeStep={activeStep} />
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-32 md:h-48" />

        {/* Mobile: Phone below steps */}
        <div className="lg:hidden mt-12">
          <PhoneMockup activeStep={activeStep} isMobile />
        </div>
      </div>
    </section>
  );
}

interface TimelineStepProps {
  step: typeof STEPS[0];
  index: number;
  activeStep: number;
}

function TimelineStep({ step, index, activeStep }: TimelineStepProps) {
  const Icon = step.icon;
  const isActive = activeStep === index;
  const isPast = activeStep > index;

  return (
    <motion.div
      className="relative pl-12 md:pl-16"
      animate={{
        opacity: isActive ? 1 : isPast ? 0.7 : 0.4,
        scale: isActive ? 1 : 0.98,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Step indicator */}
      <div className={`absolute left-0 md:left-2 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300 ${
        isActive ? 'bg-blue-500 border-blue-400' : 'bg-gray-800 border-gray-600'
      }`}>
        <div className={`w-2 h-2 rounded-full transition-transform duration-300 ${
          isActive ? 'bg-white scale-150' : 'bg-blue-500 scale-100'
        }`} />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-mono transition-colors duration-300 ${
            isActive ? 'text-blue-400' : 'text-gray-500'
          }`}>{step.number}</span>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
            isActive ? 'bg-blue-500/20' : 'bg-gray-800/50'
          }`}>
            <Icon className={`h-4 w-4 transition-colors duration-300 ${
              isActive ? 'text-blue-400' : 'text-gray-500'
            }`} />
          </div>
        </div>
        <h3 className={`text-xl md:text-2xl font-semibold transition-colors duration-300 ${
          isActive ? 'text-white' : 'text-gray-400'
        }`}>
          {step.title}
        </h3>
        <p className={`text-base md:text-lg max-w-md transition-colors duration-300 ${
          isActive ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

interface PhoneMockupProps {
  activeStep: number;
  isMobile?: boolean;
}

function PhoneMockup({ activeStep, isMobile }: PhoneMockupProps) {
  return (
    <div className={`relative ${isMobile ? 'w-full max-w-xs mx-auto' : 'w-full max-w-xs mx-auto'}`}>
      {/* iPhone Frame */}
      <div className="relative bg-gray-900 rounded-[3rem] p-[0.35rem] shadow-2xl shadow-black/50 ring-1 ring-gray-700">
        {/* Screen */}
        <div className="bg-black rounded-[2.6rem] overflow-hidden aspect-[9/19.5] relative">
          {/* Screen content layers */}
          {[0, 1, 2, 3].map((step) => (
            <PhoneScreen key={step} step={step} activeStep={activeStep} />
          ))}

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
            <div className="w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute -left-[3px] top-28 w-[3px] h-8 bg-gray-700 rounded-l-sm" />
        <div className="absolute -left-[3px] top-44 w-[3px] h-16 bg-gray-700 rounded-l-sm" />
        <div className="absolute -left-[3px] top-64 w-[3px] h-16 bg-gray-700 rounded-l-sm" />
        <div className="absolute -right-[3px] top-36 w-[3px] h-20 bg-gray-700 rounded-r-sm" />
      </div>
    </div>
  );
}

interface PhoneScreenProps {
  step: number;
  activeStep: number;
}

function PhoneScreen({ step, activeStep }: PhoneScreenProps) {
  const isActive = activeStep === step;

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      {step === 0 && <ScreenWorkoutLog />}
      {step === 1 && <ScreenXPProgress />}
      {step === 2 && <ScreenAchievements />}
      {step === 3 && <ScreenLeaderboard />}
    </motion.div>
  );
}

function ScreenWorkoutLog() {
  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-black p-4 pt-12">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Today's Workout</p>
      <h4 className="text-white font-semibold text-lg mb-4">Push Day 💪</h4>

      <div className="space-y-3">
        {[
          { name: "Bench Press", sets: "4x8", weight: "80kg", done: true },
          { name: "Shoulder Press", sets: "3x10", weight: "25kg", done: true },
          { name: "Incline Dumbbell", sets: "3x12", weight: "22kg", done: false, active: true },
          { name: "Lateral Raises", sets: "3x15", weight: "10kg", done: false },
        ].map((exercise, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl ${exercise.active ? 'bg-blue-500/20 ring-1 ring-blue-500/50' : exercise.done ? 'bg-gray-800/50' : 'bg-gray-800/30'}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {exercise.done ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <div className={`w-4 h-4 rounded-full border-2 ${exercise.active ? 'border-blue-400' : 'border-gray-600'}`} />
                )}
                <div>
                  <p className="text-white text-xs font-medium">{exercise.name}</p>
                  <p className="text-gray-400 text-[10px]">{exercise.sets} • {exercise.weight}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-white text-xs font-medium">+250 XP for this workout</span>
        </div>
      </div>
    </div>
  );
}

function ScreenXPProgress() {
  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-black p-4 pt-12">
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">24</span>
        </div>
        <p className="text-white font-semibold">Level 24</p>
        <p className="text-gray-400 text-xs">Iron Warrior</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Progress to Level 25</span>
          <span className="text-blue-400">2,450 / 3,000 XP</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full w-[82%] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>
      </div>

      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Today's XP</p>
      <div className="space-y-2">
        {[
          { label: "Push workout completed", xp: "+250", icon: Dumbbell },
          { label: "Daily login streak", xp: "+50", icon: Flame },
          { label: "New PR: Bench Press", xp: "+100", icon: Trophy },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <item.icon className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-300 text-xs">{item.label}</span>
            </div>
            <span className="text-green-400 text-xs font-medium">{item.xp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenAchievements() {
  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-black p-4 pt-12">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Achievements</p>
      <h4 className="text-white font-semibold text-lg mb-4">12 / 50 Unlocked 🏆</h4>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { emoji: "🔥", label: "7 Day Streak", unlocked: true },
          { emoji: "💪", label: "100 Workouts", unlocked: true },
          { emoji: "🏋️", label: "1000kg Lifted", unlocked: true },
          { emoji: "⚡", label: "Speed Demon", unlocked: false },
          { emoji: "🎯", label: "Perfect Week", unlocked: false },
          { emoji: "👑", label: "Top 10", unlocked: false },
        ].map((badge, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl text-center ${badge.unlocked ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20' : 'bg-gray-800/30 opacity-50'}`}
          >
            <div className="text-2xl mb-1">{badge.emoji}</div>
            <p className="text-[9px] text-gray-300">{badge.label}</p>
          </div>
        ))}
      </div>

      <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl ring-1 ring-yellow-500/30">
        <p className="text-[10px] text-yellow-400 uppercase tracking-wider mb-1">Just Unlocked!</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏋️</span>
          <div>
            <p className="text-white font-medium text-sm">1000kg Club</p>
            <p className="text-gray-400 text-[10px]">Lift 1000kg total in a single workout</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenLeaderboard() {
  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-black p-4 pt-12">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Leaderboard</p>
      <h4 className="text-white font-semibold text-lg mb-4">This Week 🏆</h4>

      <div className="space-y-2">
        {[
          { rank: 1, name: "Alex M.", xp: "4,250", avatar: "🥇", isYou: false },
          { rank: 2, name: "Sarah K.", xp: "3,890", avatar: "🥈", isYou: false },
          { rank: 3, name: "Mike R.", xp: "3,650", avatar: "🥉", isYou: false },
          { rank: 4, name: "You", xp: "3,400", avatar: "😎", isYou: true },
          { rank: 5, name: "Emma L.", xp: "3,200", avatar: "👤", isYou: false },
        ].map((user, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded-xl ${user.isYou ? 'bg-blue-500/20 ring-1 ring-blue-500/50' : 'bg-gray-800/50'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{user.avatar}</span>
              <div>
                <p className={`text-sm font-medium ${user.isYou ? 'text-blue-400' : 'text-white'}`}>{user.name}</p>
                <p className="text-gray-400 text-[10px]">#{user.rank} this week</p>
              </div>
            </div>
            <span className="text-gray-300 text-xs font-medium">{user.xp} XP</span>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg">
        Challenge a Friend
      </button>
    </div>
  );
}
