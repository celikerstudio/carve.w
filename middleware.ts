import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Een omleiding die de sessiecookies van `updateSession` meeneemt.
 *
 * @ai-why: `updateSession` ververst een verlopen access token en zet het nieuwe token
 * op zijn eigen response. Een kale `NextResponse.redirect()` draagt die Set-Cookie-
 * headers niet, dus dan houdt de browser het oude token. Bij het volgende verzoek is
 * dat token verlopen én is de refresh token al verbruikt: `getUser()` geeft null, en
 * je wordt opnieuw omgeleid. Wie op / staat wordt dan telkens naar /app gestuurd
 * terwijl hij gewoon is ingelogd, en aan de code van de pagina is niets te zien.
 *
 * @ai-gotcha: Elke `return` hieronder die niet `response` is, moet hier langs. Een
 * nieuwe omleiding erbij zetten zonder deze helper brengt het lek meteen terug.
 *
 * @ai-sync: lib/supabase/middleware.ts (zet de cookies op `response`)
 * @ai-sync: middleware.test.ts (legt dit per omleiding vast)
 */
function redirectMetSessie(url: URL, response: NextResponse) {
  const redirect = NextResponse.redirect(url)
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // @ai-why: De wortel is sinds TDR-0008 de cockpit. Zonder sessie ga je naar /app en
  // niet naar /login: `carve.wiki` is het adres in advertenties, in de App Store-listing
  // en in de bio-link, en een bezoeker die daar een formulier ziet is weg.
  //
  // @ai-gotcha: 307 en niet 308. Een permanente redirect blijft in de browsercache staan,
  // en dan komt dezelfde persoon ná het inloggen nog steeds op /app uit. Dat is niet te
  // debuggen zonder de cache te legen, want er is niets aan de code te zien. Dat is op
  // 2026-09-09 ook echt gebeurd: `next.config.ts` heeft die dag een half uur een 308 van
  // / naar /app gehad. Browsers die daar toen langskwamen sloegen hem op en gingen ook
  // daarna naar /app, zonder de server nog aan te raken. Alleen de cache legen hielp.
  //
  // @ai-sync: app/page.tsx
  // @ai-sync: next.config.ts (geen config-redirect op /, die zou hier vóór komen)
  // @ai-sync: docs/tdr/0008-de-cockpit-is-de-homepage.md
  if (pathname === '/' && !user) {
    return redirectMetSessie(new URL('/app', request.url), response)
  }

  // @ai-why: Hier stond een lijst van tien beschermde paden. Sinds TDR-0010 bestaan die
  // routes niet meer; wat overblijft is de wortel, en die heeft zijn eigen tak hierboven.
  // @ai-sync: docs/tdr/0010-het-web-platform-gaat-weg.md

  // @ai-why: Signup blijft dicht. De vlag die dit stuurde is met het platform verdwenen
  // (TDR-0010), maar de reden niet: er komen geen nieuwe web-accounts bij. Inloggen blijft
  // wel werken, anders komt een bestaand account er niet meer in.
  // @ai-sync: docs/tdr/0010-het-web-platform-gaat-weg.md
  if (pathname === '/signup') {
    return redirectMetSessie(new URL('/app', request.url), response)
  }

  // Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/signup') {
    if (user) {
      // @ai-why: Naar de wortel, want daar zit sinds TDR-0008 de cockpit. De grens is
      // hier de sessie die we net hebben vastgesteld.
      // @ai-sync: docs/tdr/0008-de-cockpit-is-de-homepage.md
      return redirectMetSessie(new URL('/', request.url), response)
    }
  }

  // @ai-why: Hier stond tot 2026-09-09 een redirect van / naar /chat voor ingelogde
  // bezoekers. Die is weg omdat `next.config.ts` sinds TDR-0007 / permanent naar /app
  // stuurt, en config-redirects komen vóór de middleware. De regel zou dus nooit meer
  // vuren, en een redirect die er wel staat maar nooit werkt is erger dan geen: hij
  // leest als een garantie. Wil je ingelogde bezoekers weghouden van de marketingpagina,
  // dan is /app de plek en niet /.
  // @ai-sync: next.config.ts (redirects)

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
