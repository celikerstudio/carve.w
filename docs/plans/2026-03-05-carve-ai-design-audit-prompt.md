# Carve AI — Design System Consistency Audit Prompt

> Kopieer onderstaand blok en plak het in een Claude sessie in de carve-ai repo.

---

**Repo:** `/Users/furkanceliker/Developer/carve-ai`
**Platform:** Native iOS/SwiftUI

## Context

Carve AI heeft al een goed opgezet twee-laags design token systeem:
- **Primitives:** `Carve AI/App/Design/Tokens/ColorPrimitives.swift`
- **Semantics:** `Carve AI/App/Design/Tokens/ColorSemantics.swift`
- **Theme modifiers:** `Carve AI/App/Design/Tokens/ThemeModifiers.swift` (`.carveBackground()`, `.carveForeground()`, `.carveCard()`, `.carveGlassCard()`)
- **Legacy tokens:** `App/Views/Shared/CarveColors.swift`, `Typography.swift`, `Spacing.swift`, `Elevation.swift`
- **Design docs:** `Carve AI/.serena/memories/design_system.md`

Het probleem is niet het systeem zelf, maar **consistente toepassing**. Uit een eerste scan blijkt dat ~30 view bestanden directe `.foregroundColor()`, `.background()`, `.foregroundStyle()`, of `.tint()` modifiers gebruiken die mogelijk niet via het theme systeem gaan.

## Opdracht

### Fase 1: Audit (geen code wijzigen)

1. **Lees het design system:** `ColorPrimitives.swift`, `ColorSemantics.swift`, `ThemeModifiers.swift`, en `design_system.md`
2. **Vind alle views die styling buiten het token systeem gebruiken:**
   - Zoek naar `Color.gray`, `Color.white`, `Color.black`, `Color(hex:` buiten de Design/ en Shared/ mappen
   - Zoek naar `.foregroundColor()` en `.background()` die NIET `theme.` of `CarveColors.` gebruiken
   - Zoek naar hardcoded opacities, font sizes, padding/spacing waarden die niet via `Spacing.` tokens gaan
   - Zoek naar directe `Color(red:green:blue:)` constructors
3. **Rapporteer per bestand:**
   - Bestandsnaam
   - Regel(s) met het probleem
   - Wat het zou moeten zijn (welke token)
   - Ernst: hoog (zichtbaar voor user) / laag (intern/debug)

### Fase 2: Legacy vs Modern tokens

Er zijn twee sets tokens:
- **Legacy:** `CarveColors.swift` in `App/Views/Shared/` — static color constants
- **Modern:** `ColorPrimitives.swift` + `ColorSemantics.swift` in `Carve AI/App/Design/Tokens/` — environment-injected theme

**Vraag om te beantwoorden:** Welke views gebruiken nog de legacy `CarveColors.` tokens in plaats van het moderne `theme.` systeem? Welke migratie is nodig?

### Fase 3: Consistentie checks

1. **Spacing:** Wordt `Spacing.` overal gebruikt, of zijn er hardcoded `16`, `24`, `32` etc. padding values?
2. **Typography:** Worden `.system(size:)` calls consistent via de Typography tokens gedaan?
3. **Corner radius:** Is er een consistente radius token, of zijn er hardcoded `12`, `16`, `20` etc.?
4. **Shadows:** Wordt `Elevation.` gebruikt, of zijn er handmatige `.shadow()` calls?

### Fase 4: Aanbevelingen

Na de audit:
1. **Prioriteer** de gevonden issues op impact (user-facing > intern)
2. **Groepeer** per aanpak (bulk find-replace vs. per-view refactor)
3. **Schat** de omvang (hoeveel bestanden, hoeveel wijzigingen)
4. Geef een **migratieplan** vergelijkbaar met wat we voor carve-wiki hebben gedaan

## Principes

- Premium = restraint. Minder is meer.
- Apple HIG als referentie
- Dark canvas, monochrome + single accent > rainbow
- Elke animatie communiceert — geen decoratie
- `@ai-why` comments bij niet-voor-de-hand-liggende keuzes
- Geen code wijzigen tot na bespreking en akkoord
