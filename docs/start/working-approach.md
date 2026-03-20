# How We Work

## Principle

Product architect who builds. Not CEO planning, not code monkey executing.
One feature per session, fully complete. Real data, not mock.

## Per Session

1. **Define** — What are we building? One concrete thing.
2. **Reference** — Check iOS implementation if relevant (~/Developer/carve-ai)
3. **Design** — Quick discussion if non-trivial. Trade-offs, not essays.
4. **Build** — Code it. Real data from Supabase, not mock.
5. **Verify** — Does it work? Does it match iOS quality?

## Best Questions to Ask

- "Dit is hoe X werkt op iOS. Wat is de web-equivalent?"
- "Ik twijfel tussen A en B. Wat zijn de trade-offs?"
- "Hier is mijn schets/idee. Waar zie je gaten?"
- "Bouw dit. Hier is exact wat ik wil." (when you know)

## Rules

- Web app consumes existing Supabase data — no new backend unless necessary
- Use semantic design tokens, not hardcoded colors
- iOS is the reference for data/behavior, not for UI (web has different strengths)
- One domain at a time. Health first (it's already built on iOS).
- Ship real features, not new mock-first work. Existing money/life placeholders stay temporary until those phases start.
- If docs drift from implementation, fix the docs in the same session.

## Web vs iOS: Different Strengths

| Web | iOS |
|-----|-----|
| Multi-panel layout (3 columns) | Single-focus screens |
| Keyboard-first interaction | Touch + gestures |
| Bigger screen = more data visible | Compact, progressive disclosure |
| Wiki/knowledge base (reading) | Tracking + logging (doing) |
| Dashboard overview | In-the-moment coaching |

The web app should lean into these strengths, not clone the iOS UI.
