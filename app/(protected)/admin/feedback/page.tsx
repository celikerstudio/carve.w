import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { StatusBadge, TypeBadge } from "@/components/admin/status-badge";
import { FeatureRequestActions } from "./feature-request-actions";

interface SearchParams {
  status?: string;
  sort?: string;
  page?: string;
}

interface AdminFeedbackPageProps {
  searchParams: Promise<SearchParams>;
}

const ITEMS_PER_PAGE = 20;

const STATUSES = ["all", "new", "reviewed", "planned", "completed"] as const;
const SORT_OPTIONS = [
  { value: "vote_count", label: "Most Voted" },
  { value: "created_at", label: "Newest" },
] as const;

export default async function AdminFeedbackPage({
  searchParams,
}: AdminFeedbackPageProps) {
  const params = await searchParams;
  const statusFilter = params.status || "all";
  const sortBy = params.sort || "vote_count";
  const page = parseInt(params.page || "1");

  const supabase = await createClient();

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from("feature_requests")
    .select(
      "id, title, description, status, vote_count, is_visible, type, created_at, user_id",
      { count: "exact" }
    )
    .range(from, to)
    .order(sortBy, { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: requests, count } = await query;

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  // Build URL helper
  function buildUrl(overrides: Record<string, string>) {
    const merged: Record<string, string> = {
      status: statusFilter,
      sort: sortBy,
      page: page.toString(),
      ...overrides,
    };
    // Remove defaults to keep URL clean
    if (merged.status === "all") delete merged.status;
    if (merged.sort === "vote_count") delete merged.sort;
    if (merged.page === "1") delete merged.page;
    const sp = new URLSearchParams(merged);
    const qs = sp.toString();
    return qs ? `?${qs}` : "?";
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-white/[0.06] pb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Feature Requests
          </h1>
          <p className="text-[#9da6b9] mt-1">
            Review, prioritize, and manage user feature requests
          </p>
        </div>

        {/* Filters & Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-[#1c1f27] p-4 rounded-xl border border-white/[0.06]">
          {/* Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[#9da6b9] mr-1">Status:</span>
            {STATUSES.map((s) => (
              <Link
                key={s}
                href={buildUrl({ status: s, page: "1" })}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  statusFilter === s
                    ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                    : "border-white/[0.06] text-[#9da6b9] hover:bg-white/5"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Link>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#9da6b9] mr-1">Sort:</span>
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={buildUrl({ sort: opt.value, page: "1" })}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  sortBy === opt.value
                    ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                    : "border-white/[0.06] text-[#9da6b9] hover:bg-white/5"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-[#9da6b9]">
          <div>
            {(count || 0) > 0
              ? `Showing ${from + 1}-${Math.min(to + 1, count || 0)} of ${count} requests`
              : "No requests found"}
          </div>
          {totalPages > 1 && (
            <div>
              Page {page} of {totalPages}
            </div>
          )}
        </div>

        {/* Feature Request Cards */}
        <div className="space-y-4">
          {requests && requests.length > 0 ? (
            requests.map((item) => (
              <div
                key={item.id}
                className="bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5"
              >
                {/* Top row: badges + vote count */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {item.type && <TypeBadge type={item.type} />}
                    <StatusBadge variant={item.status}>
                      {item.status}
                    </StatusBadge>
                    {!item.is_visible && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                    <svg
                      className="h-4 w-4 text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 10.5 12 3l7.5 7.5m-15 0V21h15V10.5"
                      />
                    </svg>
                    <span>{item.vote_count ?? 0} votes</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-1">
                  {item.title}
                </h3>

                {/* Description */}
                {item.description && (
                  <p className="text-[#9da6b9] text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>
                )}

                {/* Actions row */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <FeatureRequestActions
                    id={item.id}
                    currentStatus={item.status}
                    isVisible={item.is_visible ?? true}
                  />
                  <div className="text-sm text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500">
              No feature requests found
              {statusFilter !== "all" && (
                <span>
                  {" "}
                  with status &quot;{statusFilter}&quot;.{" "}
                  <Link href="?" className="text-purple-400 hover:underline">
                    Clear filters
                  </Link>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Link
              href={buildUrl({ page: Math.max(1, page - 1).toString() })}
              className={`px-4 py-2 rounded-lg border border-white/[0.06] text-white transition-colors ${
                page === 1
                  ? "opacity-50 pointer-events-none"
                  : "hover:bg-white/5"
              }`}
            >
              Previous
            </Link>

            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = page - 2 + i;
              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <Link
                  key={pageNum}
                  href={buildUrl({ page: pageNum.toString() })}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    pageNum === page
                      ? "bg-purple-500 border-purple-500 text-white"
                      : "border-white/[0.06] text-white hover:bg-white/5"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}

            <Link
              href={buildUrl({
                page: Math.min(totalPages, page + 1).toString(),
              })}
              className={`px-4 py-2 rounded-lg border border-white/[0.06] text-white transition-colors ${
                page === totalPages
                  ? "opacity-50 pointer-events-none"
                  : "hover:bg-white/5"
              }`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
