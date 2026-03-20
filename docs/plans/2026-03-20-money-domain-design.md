# Phase 3.1 — Money Domain

> Doel: Tweede domein live. Gebruiker logt handmatig financiële data. Coach krijgt money context. Cards tonen echte data.

Last updated: 2026-03-20

---

## Uitgangspunten

- **Handmatige invoer eerst** — geen bank API, geen CSV import (later)
- **Zelfde patroon als health** — Supabase tabellen → hook → cards → coach context
- **Shared backend** — edge function uitbreiden, niet vervangen
- **iOS heeft money nog niet** — web is first mover, iOS kan later dezelfde tabellen consumeren

---

## Stap 0: Edge function uitbreiden

### Probleem
`buildSystemPrompt()` in `coach-chat/index.ts` is 100% health. Money context wordt genegeerd als we het meesturen.

### Oplossing
Conditioneel money context sectie injecteren wanneer `context.activeDomains` `'money'` bevat of wanneer money velden aanwezig zijn.

**Toevoegen aan `buildSystemPrompt()`** (na het health CONTEXT blok, rond regel 385):

```
${context.monthlySpending != null ? `
FINANCIEEL OVERZICHT ${context.userName}:
- Uitgaven deze maand: €${context.monthlySpending}${context.monthlyBudget ? ` / €${context.monthlyBudget} budget` : ''}
- Top categorieën: ${context.topSpendingCategories || 'geen data'}
${context.subscriptionTotal ? `- Abonnementen: €${context.subscriptionTotal}/maand (${context.activeSubscriptionCount} actief)` : ''}
${context.savingsGoal ? `- Spaardoel: €${context.savingsGoal}` : ''}
${context.monthlyIncome ? `- Inkomen: €${context.monthlyIncome}/maand` : ''}` : ''}
```

**Toevoegen aan `buildThinkingSteps()`:**
```typescript
if (context.monthlySpending != null) {
  steps.push(`Uitgaven: €${context.monthlySpending} deze maand`);
}
if (context.subscriptionTotal) {
  steps.push(`Abonnementen: €${context.subscriptionTotal}/maand`);
}
```

**GEDRAG sectie uitbreiden** met:
```
5. FINANCIEEL — als money context aanwezig is.
- Benoem uitgavenpatronen: "€180 aan bezorgeten — dat is 3x zoveel als vorige maand."
- Koppel aan health als relevant: "Je bestelt veel eten — impact op voedingsdoelen?"
- Budget overschrijdingen feitelijk benoemen, niet moraliseren.
- Bij vragen over geld: concrete getallen, geen vage tips.
```

### Impact
- Backward compatible: zonder money velden verandert er niks
- iOS stuurt geen money context → geen effect op iOS
- Web stuurt money context wanneer activeApp === 'money' of wanneer money data beschikbaar is

---

## Stap 1: Supabase migratie

### Nieuwe tabellen

**`money_transactions`**
```sql
CREATE TABLE money_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  currency TEXT NOT NULL DEFAULT 'EUR',
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_money_txn_user_date
  ON money_transactions(user_id, transaction_date DESC);

ALTER TABLE money_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own transactions" ON money_transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_money_transactions_updated_at
  BEFORE UPDATE ON money_transactions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

**`money_budgets`**
```sql
CREATE TABLE money_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  monthly_limit NUMERIC(10,2) NOT NULL CHECK (monthly_limit > 0),
  month DATE NOT NULL, -- first day of month: '2026-03-01'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category, month)
);

ALTER TABLE money_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budgets" ON money_budgets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_money_budgets_updated_at
  BEFORE UPDATE ON money_budgets
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

**`money_subscriptions`**
```sql
CREATE TABLE money_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cost NUMERIC(10,2) NOT NULL CHECK (cost > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'yearly')),
  category TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  billing_day INTEGER CHECK (billing_day BETWEEN 1 AND 28),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_money_sub_user_active
  ON money_subscriptions(user_id) WHERE is_active = true;

ALTER TABLE money_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscriptions" ON money_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_money_subscriptions_updated_at
  BEFORE UPDATE ON money_subscriptions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### Profiles uitbreiden
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS monthly_income NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS savings_goal NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
```

### Categorieën
Canonical lijst (CHECK constraint niet op DB-level — houden we flexibel voor toekomstige uitbreiding):

| Category | Label NL | Icon |
|----------|----------|------|
| housing | Wonen | Home |
| dining | Eten & Drinken | UtensilsCrossed |
| shopping | Winkelen | ShoppingBag |
| transport | Vervoer | Car |
| travel | Reizen | Plane |
| entertainment | Entertainment | Gamepad2 |
| utilities | Vaste lasten | Zap |
| subscriptions | Abonnementen | CreditCard |
| health | Gezondheid | Heart |
| education | Opleiding | GraduationCap |
| personal | Persoonlijk | User |
| other | Overig | MoreHorizontal |

### Design keuzes
- **`amount` altijd positief** — richting via `type` ('expense'/'income'). Voorkomt ambiguïteit.
- **`month` als DATE** (eerste dag) — native date arithmetic, proper ordering, valideerbaar.
- **`billing_day` + `start_date`** ipv `next_bill_date` — next bill date wordt dynamisch berekend client-side. Geen stale data.
- **`currency` op transactie-level** — kost niks nu, voorkomt pijnlijke migratie bij multi-currency later. Default EUR.
- **`description NOT NULL DEFAULT ''`** — geen null/empty ambiguïteit.
- **`updated_at` op alle tabellen** — change detection, caching, realtime.
- **Geen category CHECK constraint** — categorieën worden frontend-side afgedwongen. Flexibeler voor toekomstige uitbreiding.

---

## Stap 2: `useMoneyData` hook

Zelfde patroon als `useHealthData`. Fetcht uit 3 tabellen + profile parallel.

```typescript
// hooks/useMoneyData.ts
interface MoneyData {
  transactions: MoneyTransaction[]
  budgets: MoneyBudget[]
  subscriptions: MoneySubscription[]
  profile: { monthlyIncome: number | null; savingsGoal: number | null; currency: string }
  summary: {
    monthlySpending: number
    monthlyIncome: number
    topCategories: { category: string; total: number }[]
    subscriptionTotal: number
    activeSubscriptionCount: number
    budgetStatus: { category: string; spent: number; limit: number }[]
  }
}

function useMoneyData(userId: string | null): {
  data: MoneyData | null
  loading: boolean
  error: Error | null
  refetch: () => void
}
```

### Queries
1. `money_transactions` — huidige maand (WHERE transaction_date >= first_of_month)
2. `money_budgets` — huidige maand
3. `money_subscriptions` — WHERE is_active = true
4. `profiles` — monthly_income, savings_goal, currency

### Summary berekening (client-side)
- `monthlySpending`: sum van expenses deze maand
- `monthlyIncome`: sum van income deze maand (of profile.monthly_income als fallback)
- `topCategories`: group by category, sorted by total desc
- `subscriptionTotal`: sum van actieve subscriptions (yearly / 12 voor monthly equivalent)
- `budgetStatus`: join transactions met budgets per category

### Verschil met useHealthData
- **Error state** — returned `{ data, loading, error }`. Try/catch rond Promise.all.
- **Refetch functie** — voor na het toevoegen van transacties.
- **Summary berekening** — afgeleide data berekend in de hook, niet in elke card apart.

---

## Stap 3: Mock cards → echte data

### BudgetCard
- Was: hardcoded €760/€2000
- Wordt: `summary.budgetStatus` per categorie, totaal budget vs totaal spent
- Progress bar per categorie
- Kleur: groen (< 80%), geel (80-100%), rood (> 100%)

### TransactionsCard
- Was: hardcoded 5 transacties
- Wordt: laatste 5 uit `transactions` (sorted by transaction_date desc)
- Merchant → description, bedrag, categorie icon
- Expense = rood, income = groen

### SubscriptionsCard
- Was: hardcoded Netflix, Spotify etc.
- Wordt: `subscriptions` (active), kosten, volgende billing date (berekend uit start_date + billing_day)
- Yearly subscriptions tonen maandelijks equivalent

### BillsCard
- Hernoemen naar **UpcomingCard** of mergen met SubscriptionsCard
- Toont subscriptions waarvan billing_day binnenkort is (komende 7 dagen)

### Alle cards
- Loading skeleton via bestaand `SkeletonCard` component
- Error state: subtiele error banner, niet de hele card breken
- Empty state: "Nog geen data — voeg je eerste transactie toe"

---

## Stap 4: Money context voor coach

### `buildMoneyContext()` in `lib/ai/money-context.ts`

```typescript
interface MoneyCoachContext {
  monthlySpending: number
  monthlyBudget: number | null
  topSpendingCategories: string  // "dining (€340), shopping (€210)"
  subscriptionTotal: number
  activeSubscriptionCount: number
  savingsGoal: number | null
  monthlyIncome: number | null
}
```

### Integratie in `app/api/carve-ai/chat/route.ts`

Naast `buildCoachContext()` (health) ook `buildMoneyContext()` aanroepen.
Money velden toevoegen aan het context object dat naar de edge function gaat.

```typescript
const healthContext = await buildCoachContext(userId, activeApp, userName)
const moneyContext = await buildMoneyContext(userId)
const context = { ...healthContext, ...moneyContext }
```

### Wanneer money context meesturen?
- **Altijd** — als de user money data heeft, krijgt de coach het mee
- Niet alleen bij activeApp === 'money', want cross-domein intelligence (Phase 3.2) heeft het nodig
- Edge function toont het conditioneel (zie Stap 0)

---

## Stap 5: Transactie invoer UI

### Waar
- **Quick add** — in context panel of via floating action button in money view
- **Modal/sheet** — niet een aparte pagina. Snelle invoer, terug naar chat.

### Velden
| Veld | Type | Required | Default |
|------|------|----------|---------|
| Bedrag | Number input | Ja | - |
| Type | Toggle: Uitgave / Inkomst | Ja | Uitgave |
| Categorie | Dropdown met icons | Ja | - |
| Beschrijving | Text input | Nee | '' |
| Datum | Date picker | Ja | Vandaag |
| Terugkerend | Toggle | Nee | false |

### UX
- Bedrag is het eerste en grootste veld — meteen typen
- Categorie icons matchen de canonical lijst
- Na submit: toast bevestiging, card refresht automatisch (via refetch)
- Keyboard shortcut overwegen voor power users

---

## Stap 6: Subscription management UI

### Waar
- Vanuit SubscriptionsCard → "Beheer" link
- Of als apart panel/modal

### Features
- Lijst actieve subscriptions met kosten
- Add subscription: naam, kosten, frequentie, categorie, start datum, billing dag
- Deactiveren (soft delete via is_active = false)
- Totaal maandelijkse kosten prominent zichtbaar

---

## Niet in scope (bewust geparkeerd)

| Feature | Waarom niet nu |
|---------|---------------|
| Bank API integratie | Complexiteit, afhankelijkheid van externe providers |
| CSV import | Nice-to-have maar niet MVP |
| Money-specifieke coach tools | Eerst basis context, tools later (zoals health tools) |
| iOS money features | iOS heeft feature flag, web gaat voor |
| Cross-domein intelligence | Phase 3.2 — eerst money standalone werkend |
| Recurring transaction auto-clone | Te complex voor MVP, handmatig markeren is genoeg |
| Multi-currency conversie | Currency kolom staat klaar, conversie later |

---

## Implementatie volgorde & afhankelijkheden

```
Stap 0: Edge function uitbreiden          ← GEEN dependency, kan parallel
Stap 1: Supabase migratie                 ← GEEN dependency, kan parallel met 0
Stap 2: useMoneyData hook                 ← Depends on: Stap 1
Stap 3: Cards op echte data              ← Depends on: Stap 2
Stap 4: Money context voor coach         ← Depends on: Stap 0 + Stap 1
Stap 5: Transactie invoer UI            ← Depends on: Stap 2 (hook moet refetch hebben)
Stap 6: Subscription management          ← Depends on: Stap 2
```

Stap 0 en 1 kunnen parallel. Stap 5 en 6 kunnen parallel. Stap 3 en 4 kunnen parallel na hun dependencies.

---

## Categorieën sync

Frontend `SpendingCategory` type updaten naar de canonical lijst van 12 categorieën.
`CATEGORY_CONFIG` en alle filter arrays synchroon bijwerken.
`SubscriptionCategory` mergen met `SpendingCategory` (één type).

---

## Acceptance criteria

- [ ] Gebruiker kan handmatig transacties toevoegen (bedrag, type, categorie, datum)
- [ ] BudgetCard toont echte budget vs spending per categorie
- [ ] TransactionsCard toont laatste 5 echte transacties
- [ ] SubscriptionsCard toont echte abonnementen met berekende next bill date
- [ ] Coach benoemt financiële patronen wanneer money data aanwezig is
- [ ] Data persistent in Supabase met RLS
- [ ] Loading states en error handling op alle cards
- [ ] Empty states voor nieuwe gebruikers zonder money data
