import { AASA } from '@/lib/uitnodiging'

// @ai-why: Een route en geen bestand in `public/`. Een bestand zonder extensie krijgt van
// Vercel `application/octet-stream`, en Apple wil JSON. Zo zetten we het type zelf.
// @ai-why: Statisch: de inhoud verandert alleen met een deploy, en Apple's CDN haalt hem op.
// @ai-sync: lib/uitnodiging.ts (AASA)
// @ai-sync: middleware.ts (de matcher slaat /.well-known over, zodat er geen sessie of
//   omleiding tussen kan komen)
export const dynamic = 'force-static'

export function GET() {
  return new Response(JSON.stringify(AASA), {
    headers: { 'Content-Type': 'application/json' },
  })
}
