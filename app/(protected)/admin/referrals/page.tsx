import { createClient } from "@/lib/supabase/server";
import { getReferralStats, getReferralsList, getPromoCodesList } from "@/lib/admin/queries";
import { ReferralStatsCards } from "./stats-cards";

export default async function AdminReferralsPage() {
  const supabase = await createClient();

  const [stats, referrals, promoCodes] = await Promise.all([
    getReferralStats(supabase),
    getReferralsList(supabase),
    getPromoCodesList(supabase),
  ]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-white/[0.06] pb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Referrals & Promo Codes
          </h1>
          <p className="text-[#9da6b9] mt-1">
            Track referrals, promo code usage, and Pro days granted
          </p>
        </div>

        {/* Stats Cards */}
        <ReferralStatsCards stats={stats} />

        {/* Referrals Table */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Referrals</h2>
          <div className="bg-[#1c1f27] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/[0.06]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Referrer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      New User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {referrals && referrals.length > 0 ? (
                    referrals.map((r: any) => (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">
                            {r.referrer_name || r.referrer_username}
                          </div>
                          <div className="text-sm text-[#9da6b9]">
                            @{r.referrer_username}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">
                            {r.referred_name || r.referred_username}
                          </div>
                          <div className="text-sm text-[#9da6b9]">
                            @{r.referred_username}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              r.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {r.status === "completed" ? "Completed" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9da6b9]">
                          {r.active_days_count}/3 days
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9da6b9]">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#9da6b9]">
                        No referrals yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Promo Codes Table */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Promo Codes</h2>
          <div className="bg-[#1c1f27] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/[0.06]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Influencer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Uses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Picker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {promoCodes && promoCodes.length > 0 ? (
                    promoCodes.map((pc: any) => (
                      <tr key={pc.code} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono font-medium text-white">
                            {pc.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9da6b9]">
                          {pc.influencer_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {pc.current_redemptions}
                          {pc.max_redemptions ? ` / ${pc.max_redemptions}` : ""}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9da6b9]">
                          {pc.days_granted}d
                        </td>
                        <td className="px-6 py-4">
                          {pc.show_in_picker ? (
                            <span className="text-emerald-400 text-xs">Visible</span>
                          ) : (
                            <span className="text-[#9da6b9] text-xs">Hidden</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              pc.is_active
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {pc.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#9da6b9]">
                        No promo codes yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
