import { redirect } from "next/navigation"

// @ai-why: /dashboard now redirects to /chat. All user-facing pages moved to top-level routes.
// /dashboard is reserved for admin use only.
export default function DashboardPage() {
  redirect("/chat")
}
