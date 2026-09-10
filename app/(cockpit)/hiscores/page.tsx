/**
 * @ai-todo: Leeg op verzoek van Furkan; de ingang staat er zodat de plek vastligt. De
 * oude route /hiscores is verwijderd in TDR-0010 en is het startpunt voor de inhoud:
 * `git show 586df5e^:app/hiscores/page.tsx`, samen met de RPC uit
 * supabase/migrations/20251112000004_create_leaderboard_function.sql
 * (monthly_leaderboard_snapshots, 1696 rijen).
 */
export default function HiscoresPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[13px] text-white/25">Hiscores — nog leeg</p>
    </div>
  )
}
