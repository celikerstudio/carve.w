"use client";

import { Users, UserPlus, Clock, Activity } from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";

interface ReferralStatsProps {
  stats: {
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalPromoRedemptions: number;
    totalProDaysGranted: number;
  };
}

export function ReferralStatsCards({ stats }: ReferralStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Referrals"
        value={stats.totalReferrals}
        icon={Users}
        index={0}
      />
      <StatsCard
        title="Completed"
        value={stats.completedReferrals}
        icon={UserPlus}
        description={`${stats.pendingReferrals} pending`}
        index={1}
      />
      <StatsCard
        title="Promo Redemptions"
        value={stats.totalPromoRedemptions}
        icon={Activity}
        index={2}
      />
      <StatsCard
        title="Pro Days Granted"
        value={stats.totalProDaysGranted}
        icon={Clock}
        description="Total across all sources"
        index={3}
      />
    </div>
  );
}
