-- Het advertentiejournaal.
--
-- TDR-0006 beslissing 3 koos voor live ophalen zonder eigen opslag, en dat blijft staan
-- voor cijfers. Maar waarnemen, testen en ingrijpen hebben geheugen nodig: je kunt geen
-- drift zien, geen test uitlezen en geen ingreep verantwoorden zonder vast te leggen wat
-- er wanneer gebeurde. Deze migratie slaat daarom precies één ding op: gebeurtenissen die
-- geen enkele bron je kan teruggeven. Alle cijfers blijven live, want Meta bewaart ~37
-- maanden en GA4 zijn eigen historie.
--
-- Wat hier bewust NIET in zit: Apple's dagcijfers. Die hebben wél een harde vervaldatum
-- van 365 dagen, en TDR-0006 noemt dat de bewuste prijs van live ophalen en de meest
-- waarschijnlijke reden voor een opvolger-TDR. Er stond een `appstore_daily`-tabel in een
-- eerdere versie van deze migratie; die is eruit gehaald omdat geen enkele code hem las of
-- schreef, en omdat het een omkering is van een besliste TDR. Zo'n omkering hoort in een
-- TDR te staan, niet in een SQL-commentaar.
--
-- Append-only. Er is bewust geen UPDATE- en geen DELETE-policy: een logboek dat je
-- achteraf kunt bijstellen is precies zoveel waard als je geheugen, en dat is nul. De
-- levenscyclus loopt via `ref` -- een test die afloopt krijgt een tweede regel van soort
-- 'afsluiting' die naar de eerste wijst. Er is dus geen statuskolom die uit de pas kan
-- lopen met de werkelijkheid; lib/admin/journal.ts leidt de stand af uit de regels.
--
-- Waarom één tabel met een `kind` en niet vier tabellen: je wilt deze dingen door elkaar
-- lezen. "Op 12 september verhoogden we het budget, op 13 september stond de controle
-- rood, op 15 september sloot de test af" is één tijdlijn, en dat is precies de vorm
-- waarin je later ziet waardoor een cijfer bewoog. Vier tabellen zouden voor elke echte
-- vraag een join opleveren.
--
-- Waarom `body` jsonb en niet kolommen per soort: de vijf soorten delen bijna geen
-- velden. Kolommen zouden betekenen dat elke rij grotendeels NULL is en dat elke nieuwe
-- soort een migratie kost. De vorm wordt afgedwongen met zod in lib/admin/journal.ts,
-- aan de schrijfkant.

CREATE TABLE IF NOT EXISTS public.ads_journal (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Wanneer het gebeurde, niet wanneer je het vastlegde. Een budgetwijziging die je
  -- gisteren in Ads Manager deed en vandaag noteert, hoort op gisteren te staan, anders
  -- ligt hij naast de cijfers waar hij bij hoort.
  at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  kind         TEXT NOT NULL CHECK (kind IN ('wijziging', 'test', 'controle', 'voorstel', 'afsluiting')),

  -- Meta's campagne-ID, dezelfde sleutel als `utm_id` uit TDR-0009 beslissing 4. TEXT en
  -- geen bigint: het is een ondoorzichtige sleutel van een derde partij en er valt niets
  -- mee te rekenen. NULL betekent dat het het hele account raakt, zoals een controle die
  -- over alle campagnes tegelijk gaat.
  campaign_id  TEXT,

  body         JSONB NOT NULL,

  -- Alleen gevuld bij 'afsluiting'. ON DELETE RESTRICT is er voor de volledigheid; er is
  -- geen DELETE-policy, dus in de praktijk verwijdert niemand hier iets.
  ref          UUID REFERENCES public.ads_journal(id) ON DELETE RESTRICT,

  -- NULL betekent: het systeem schreef dit, geen mens. Dat onderscheid gaat ertoe doen
  -- zodra er voorstellen automatisch worden weggeschreven.
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- De regel uit validateEvent(), hier nog een keer. De applicatie is de eerste poort,
  -- maar een journaal waar via de SQL-editor een halve regel in kan glippen is geen
  -- journaal. Een afsluiting zonder ref sluit niets af en laat de test eeuwig openstaan.
  CONSTRAINT afsluiting_verwijst CHECK (
    (kind = 'afsluiting' AND ref IS NOT NULL) OR
    (kind <> 'afsluiting' AND ref IS NULL)
  )
);

-- De tijdlijn wordt bijna altijd nieuwste-eerst gelezen, en meestal per campagne.
CREATE INDEX IF NOT EXISTS ads_journal_at_idx ON public.ads_journal (at DESC);
CREATE INDEX IF NOT EXISTS ads_journal_campaign_idx ON public.ads_journal (campaign_id, at DESC);

-- Eén afsluiting per gebeurtenis. Twee conclusies over dezelfde test is geen geschiedenis
-- maar een tegenspraak, en openTests() zou er stilzwijgend één van negeren. Deze index
-- bedient meteen de lookup die openTests() doet ("welke afsluitingen bestaan er"), dus er
-- staat er bewust geen tweede op ref.
CREATE UNIQUE INDEX IF NOT EXISTS ads_journal_een_afsluiting_idx
  ON public.ads_journal (ref) WHERE ref IS NOT NULL;

ALTER TABLE public.ads_journal ENABLE ROW LEVEL SECURITY;

-- Admin-only, via dezelfde helper als de rest van het dashboard
-- (public.is_admin(), zie 20260303000002_admin_rls_policies.sql).
--
-- Alleen SELECT en INSERT. Het ontbreken van een UPDATE- en DELETE-policy is hier de
-- functionaliteit, niet een omissie: RLS weigert standaard, dus deze tabel is
-- append-only zolang niemand er een policy bij zet.
CREATE POLICY "admin_read_ads_journal" ON public.ads_journal
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_append_ads_journal" ON public.ads_journal
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

COMMENT ON TABLE public.ads_journal IS
  'Append-only tijdlijn van wat er met de advertenties gebeurde: wijzigingen met hun verwachting, lopende tests, uitkomsten van de tracking-controle en voorstellen. Geen UPDATE/DELETE-policy, dat is opzet.';

COMMENT ON COLUMN public.ads_journal.ref IS
  'Alleen bij kind = afsluiting: de gebeurtenis die hiermee wordt afgesloten. De stand van een test wordt hieruit afgeleid, niet opgeslagen.';
