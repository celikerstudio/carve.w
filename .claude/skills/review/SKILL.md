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
```bash
# Find the plan file (most recently modified)
PLAN_FILE=$(ls -t docs/plans/*.md 2>/dev/null | head -1)
```
Read the plan file. Identify:
- `{PLAN_FILE}` — path to the plan
- `{PLAN_SUMMARY}` — 1-2 sentence summary of what the plan proposes

**For Code Review:**
```bash
# Get the diff range
BASE_SHA=$(git merge-base HEAD origin/main 2>/dev/null || git rev-parse HEAD~3)
HEAD_SHA=$(git rev-parse HEAD)
```
Identify:
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
4. Ask: "Wil je dat ik de gevonden issues fix, of pak je ze zelf op?"

## Principles

- **Independence**: The reviewer subagent has no context from your current session. Fresh eyes. Don't pre-bias it with explanations or excuses.
- **Honesty > politeness**: A review that says "looks great!" when there are problems is useless.
- **Actionable**: Every issue has a specific reference and a fix suggestion.
- **Severity discipline**: Not everything is critical. Proper categorization prevents alert fatigue.
