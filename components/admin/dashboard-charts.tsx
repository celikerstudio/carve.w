"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartCard } from "@/components/admin/chart-card";

// ─── Shared chart styling ─────────────────────────────────

const CHART_COLORS = {
  amber: "#f59e0b",
  blue: "#3b82f6",
  purple: "#a855f7",
  emerald: "#10b981",
};

const PIE_COLORS = [
  CHART_COLORS.amber,
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.emerald,
  "#ef4444",
  "#06b6d4",
];

function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-[#1c1f27] border border-white/[0.06] px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-500 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#9da6b9] capitalize">{entry.name}:</span>
          <span className="text-white font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── User Growth Area Chart ────────────────────────────────

interface UserGrowthChartProps {
  data: Array<{ date: string; count: number }>;
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ChartCard
      title="User Growth"
      description="New signups over the last 30 days"
      index={0}
    >
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={formatted} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="gradientAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.amber} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#282e39" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#282e39" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="count"
            name="signups"
            stroke={CHART_COLORS.amber}
            strokeWidth={2}
            fill="url(#gradientAmber)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── Daily Activity Bar Chart ──────────────────────────────

interface ActivityChartProps {
  data: Array<{ date: string; workouts: number; meals: number }>;
}

export function ActivityChart({ data }: ActivityChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ChartCard
      title="Daily Activity"
      description="Workouts and meals logged per day"
      index={1}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={formatted} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#282e39" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#282e39" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 8 }}
          />
          <Bar
            dataKey="workouts"
            name="workouts"
            stackId="a"
            fill={CHART_COLORS.blue}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="meals"
            name="meals"
            stackId="a"
            fill={CHART_COLORS.emerald}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── Role Distribution Pie Chart ───────────────────────────

interface RoleChartProps {
  data: Array<{ role: string; count: number }>;
}

export function RoleDistributionChart({ data }: RoleChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <ChartCard
      title="Role Distribution"
      description="User roles breakdown"
      index={2}
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="role"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const entry = payload[0];
              return (
                <div className="rounded-lg bg-[#1c1f27] border border-white/[0.06] px-3 py-2 text-xs shadow-xl">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: entry.payload?.fill }}
                    />
                    <span className="text-[#9da6b9] capitalize">{String(entry.name)}:</span>
                    <span className="text-white font-medium">{String(entry.value)}</span>
                  </div>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {data.map((entry, i) => (
          <div key={entry.role} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="text-[#9da6b9] capitalize">{entry.role}</span>
            <span className="text-slate-500">
              ({total > 0 ? Math.round((entry.count / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

// ─── Level Distribution Bar Chart ──────────────────────────

interface LevelChartProps {
  data: Array<{ range: string; count: number }>;
  avgLevel: number;
}

export function LevelDistributionChart({ data, avgLevel }: LevelChartProps) {
  return (
    <ChartCard
      title="Level Distribution"
      description={`Average level: ${avgLevel}`}
      index={3}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#282e39" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#282e39" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="count"
            name="users"
            fill={CHART_COLORS.purple}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
