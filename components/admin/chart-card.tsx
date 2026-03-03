"use client";

import { motion } from "framer-motion";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function ChartCard({
  title,
  description,
  children,
  className = "",
  index = 0,
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06] ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}
