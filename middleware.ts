import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { SHOW_WEB_APP } from '@/lib/flags'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/chat') || pathname.startsWith('/money') || pathname.startsWith('/travel') || pathname.startsWith('/workouts') || pathname.startsWith('/food') || pathname.startsWith('/social') || pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/health') || pathname.startsWith('/inbox')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // @ai-why: Geen nieuwe web-accounts zolang het platform uit staat. Inloggen blijft
  // wél werken: een bestaand account moet erin kunnen en /admin hangt eraan.
  // @ai-sync: lib/flags.ts (SHOW_WEB_APP)
  if (pathname === '/signup' && !SHOW_WEB_APP) {
    return NextResponse.redirect(new URL('/carve', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/signup') {
    if (user) {
      // @ai-why: Met het platform uit is /chat een 404, dus stuur ingelogde bezoekers
      // naar de marketingpagina in plaats van tegen een muur.
      return NextResponse.redirect(new URL(SHOW_WEB_APP ? '/chat' : '/carve', request.url))
    }
  }

  // @ai-why: Deze redirect stuurde ingelogde bezoekers van de marketingpagina naar de
  // chat. Sinds carve.wiki een marketingsite is, is dat precies verkeerd om: jij bent
  // ingelogd en zou je eigen pagina nooit meer zien. Alleen nog van kracht als het
  // platform aanstaat.
  if (pathname === '/carve' && SHOW_WEB_APP) {
    if (user) {
      return NextResponse.redirect(new URL('/chat', request.url))
    }
  }

  // Zelfde reden als hierboven: met het platform uit blijft de homepage de homepage.
  if (pathname === '/' && SHOW_WEB_APP) {
    if (user) {
      return NextResponse.redirect(new URL('/chat', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
