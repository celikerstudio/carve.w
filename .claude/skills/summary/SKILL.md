---
name: summary
description: Generate a structured handoff prompt for continuing work in a new session when context is full
---

# /summary — Session Handoff

Generate a structured handoff prompt that you print to the chat. The user copies it into their next session.

**No files. No memory writes. Just a clean prompt the next Claude can use to hit the ground running.**

## What To Do

Analyze the current session and generate a handoff prompt with this exact structure:

```
## Context
[1-2 sentences: what project/feature is being worked on]

## What Was Done This Session
[bulleted list — completed work only, no fluff]
- [concrete action + result]
- [concrete action + result]

## Key Decisions Made
[only decisions that affect future work — skip obvious ones]
- [decision]: [why]

## Current State
- Branch: [branch name]
- Last commit: [SHA + message]
- Uncommitted changes: [yes/no, what]
- Build status: [passing/failing/unknown]

## Open Issues / Blockers
[anything that's broken, stuck, or needs attention]
- [issue]: [context needed to understand it]

## Next Steps (in order)
1. [specific actionable step]
2. [specific actionable step]
3. [specific actionable step]

## Key Files
[files the next session will likely need to touch — max 10]
- `path/to/file.ts` — [why it matters]

## Relevant Plan
[if there's a plan file, reference it]
Read: `docs/plans/[plan-file].md`
```

## How To Gather This

Run these commands to get the facts:

```bash
# Branch and recent commits
git branch --show-current
git log --oneline -10

# What's changed
git status
git diff --stat

# Last commit detail
git log -1 --format="%H %s"
```

Then combine with what you know from the conversation:
- What the user asked for
- What you built or changed
- What decisions were discussed
- Where you left off

## Rules

1. **Be specific, not generic.** "Implement auth" is useless. "Add JWT middleware to /api routes, token validation in lib/auth.ts" is useful.
2. **Only include what matters.** If a decision was trivial, skip it. If a file won't be touched again, skip it.
3. **Next steps are the most important part.** The new session should know exactly what to do first.
4. **Print it directly to chat.** Don't write files. The user will copy-paste it.
5. **Keep it under 50 lines.** Dense > comprehensive. The new session can explore if it needs more.
6. **Use git state as ground truth.** Don't rely on your memory of what happened — check git.
