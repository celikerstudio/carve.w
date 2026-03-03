"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  format?: "number" | "percentage";
  icon: LucideIcon;
  description?: string;
  index?: number;
}

function calculateTrend(current: number, previous: number): { value: number; isPositive: boolean } | null {
  if (previous === 0) return current > 0 ? { value: 100, isPositive: true } : null;
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
}

export function StatsCard({
  title,
  value,
  previousValue,
  format = "number",
  icon: Icon,
  description,
  index = 0,
}: StatsCardProps) {
  const trend = typeof value === "number" && previousValue !== undefined
    ? calculateTrend(value, previousValue)
    : null;

  const displayValue = typeof value === "number"
    ? format === "percentage"
      ? `${value}%`
      : value.toLocaleString()
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02] transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-500" />
          <p className="text-xs uppercase tracking-wider text-slate-500">{title}</p>
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{displayValue}</p>
      {description && (
        <p className="text-[#9da6b9] text-sm mt-1">{description}</p>
      )}
    </motion.div>
  );
}
