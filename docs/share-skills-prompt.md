# Skills Setup Prompt

Copy everything below the line and paste it into a new Claude Code session in any project.

---

Create two Claude Code skills in my project: `/review` and `/summary`. Create the directories and files exactly as specified.

## Skill 1: /review

Create `.claude/skills/review/SKILL.md` with this content:

```markdown
---
name: review
description: Dispatch an independent senior-level review of a plan or code changes using specialized subagents
---

# /review — Independent Senior Review

Dispatch a thorough, independent review using the right subagent for the job.

## Step 1: Determine Review Type

Ask yourself: **what is being reviewed?**

| Signal | Review Type |
|--------|-------------|
| User says "review the plan", a `docs/plans/*.md` was recently discussed, or you just finished writing a plan | **Plan Review** |
| User says "review the code", there are uncommitted/pushed changes, or a feature branch has commits ahead of main | **Code Review** |
| Ambiguous | Ask the user: "Should I review the plan or the code changes?" |

## Step 2: Gather Context

**For Plan Review:**
Find the most recently modified plan file in docs/plans/. Read it and identify:
- `{PLAN_FILE}` — path to the plan
- `{PLAN_SUMMARY}` — 1-2 sentence summary of what the plan proposes

**For Code Review:**
Get the diff range using git merge-base HEAD origin/main as BASE_SHA and HEAD as HEAD_SHA. Identify:
- `{WHAT_CHANGED}` — summary of what was implemented
- `{BASE_SHA}` / `{HEAD_SHA}` — commit range
- `{REQUIREMENTS}` — the plan or task description this code implements

## Step 3: Dispatch Subagent

### Plan Review → `plan-reviewer` subagent

Use the **Agent tool** with `subagent_type: "plan-reviewer"` and this prompt:

~~~
You are a skeptical, experienced senior developer reviewing a plan BEFORE any code is written.
Your job is to find the holes, risks, and bad decisions — not to validate the author's work.
Think adversarially. What will go wrong? What's missing? What's overcomplicated?

## The Plan
File: {PLAN_FILE}

{PASTE FULL PLAN CONTENT HERE}

## Review Dimensions

### 1. Feasibility & Risk
- Is this actually buildable as described? What's underestimated?
- Top 3 risks that could derail this
- Hidden dependencies or ordering constraints
- What happens if a key assumption is wrong?

### 2. Architecture & Design
- Are technology choices justified? Alternatives dismissed too quickly?
- Does the data model support all described features?
- Scalability bottlenecks baked into the design?
- Is separation of concerns clean?

### 3. Completeness
- Missing use cases or edge cases?
- Error states and failure modes addressed?
- Migration/rollback strategy?
- Security, auth, rate limiting, data validation?

### 4. Scope & Complexity
- Is this trying to do too much at once?
- What can be deferred without losing core value?
- Are task breakdowns actually independent or secretly coupled?
- Is estimated complexity realistic?

### 5. Clarity
- Could another developer implement this without asking questions?
- Ambiguous requirements that will cause different interpretations?
- Are acceptance criteria specific and testable?

## Required Output Format

### Verdict: [APPROVE / REVISE / REJECT]

### Critical Issues (block implementation until resolved)
[numbered, with specific references to plan sections]

### Important Concerns (address before or during implementation)
[numbered]

### Suggestions (would improve the plan)
[numbered]

### What's Good
[brief — only genuinely strong aspects]

### Recommended Changes
[specific, actionable edits — not vague advice]
~~~

### Code Review → `superpowers:code-reviewer` subagent

Use the **Agent tool** with `subagent_type: "superpowers:code-reviewer"` and this prompt:

~~~
You are a senior developer doing a real code review — not a rubber stamp.
Your job is to catch bugs, bad patterns, and missed requirements BEFORE this ships.
Be direct. If something is wrong, say it plainly. Don't soften critical feedback.

## What Was Implemented
{WHAT_CHANGED}

## Requirements / Plan
{REQUIREMENTS}

## Git Range
Base: {BASE_SHA}
Head: {HEAD_SHA}

Start by running:
git diff --stat {BASE_SHA}..{HEAD_SHA}
git diff {BASE_SHA}..{HEAD_SHA}

Then read any files that need deeper inspection.

## Review Dimensions

### 1. Correctness
- Does the code do what requirements say?
- Logic errors, off-by-one bugs, race conditions?
- Empty inputs, null values, edge cases?
- Error paths tested and handled?

### 2. Security
- SQL injection, XSS, CSRF, auth bypass?
- Secrets hardcoded or exposed?
- User input validated and sanitized?
- Permissions checked correctly?

### 3. Architecture
- Fits cleanly into existing codebase or fights the patterns?
- Unnecessary coupling or hidden state?
- Maintainable in 6 months by someone who didn't write it?
- Performance implications (N+1 queries, unnecessary re-renders, large payloads)?

### 4. Testing
- Tests verify behavior or just check that code runs?
- Edge cases and error paths covered?
- Would a bug actually cause a test failure?
- Integration tests where needed?

### 5. Requirements Coverage
- Everything from plan/spec implemented?
- Scope creep (things added that weren't asked for)?
- Breaking changes documented?

## Required Output Format

### Verdict: [SHIP IT / FIX THEN SHIP / NEEDS REWORK]

### Critical (must fix — bugs, security, data loss)
[numbered, with file:line references]

### Important (should fix — architecture, missing features, bad patterns)
[numbered, with file:line references]

### Minor (nice to have — style, optimization)
[numbered, with file:line references]

### What's Done Well
[brief and genuine — only truly good work]

### Summary
[2-3 sentences: state of the code and what needs to happen next]
~~~

## Step 4: Report Results

1. Present the full review to the user
2. If there are Critical issues: **list them explicitly** and recommend fixing before proceeding
3. If verdict is negative: explain what needs to change
4. Ask: "Want me to fix the issues found, or do you want to address them yourself?"

## Principles

- **Independence**: The reviewer subagent has no context from your current session. Fresh eyes. Don't pre-bias it.
- **Honesty > politeness**: A review that says "looks great!" when there are problems is useless.
- **Actionable**: Every issue has a specific reference and a fix suggestion.
- **Severity discipline**: Not everything is critical. Proper categorization prevents alert fatigue.
```

## Skill 2: /summary

Create `.claude/skills/summary/SKILL.md` with this content:

```markdown
---
name: summary
description: Generate a structured handoff prompt for continuing work in a new session when context is full
---

# /summary — Session Handoff

Generate a structured handoff prompt that you print to the chat. The user copies it into their next session.

**No files. No memory writes. Just a clean prompt the next Claude can use to hit the ground running.**

## What To Do

Analyze the current session and generate a handoff prompt with this exact structure:

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
```

That's it. After creating both files, confirm they show up in the skills list.
