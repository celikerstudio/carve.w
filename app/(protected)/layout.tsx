export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is handled by middleware.ts — it redirects unauthenticated users to /login
  return <>{children}</>
}
