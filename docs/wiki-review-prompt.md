# Reviewprompt voor een wiki-artikel vóór publicatie

Draai deze prompt bij elk artikel voordat het op `status: reviewed` gaat (TDR-0018 §7). Gebruik een model **met internettoegang**. Zonder zoeken verzint een model de verificatie, en dat is erger dan geen controle. Overgenomen uit `~/Developer/naslagwerken/docs/review-prompt.md`.

Stuur mee:

1. `content/wiki/<categorie>/<slug>.md`: het artikel met zijn bronnen in de frontmatter
2. de bestanden uit `content/wiki/bronnen/studies/` van die bronnen, als ze er zijn
3. de leerdoelen uit `content/wiki/leerdoelen.yaml` met `artikel: <slug>`
4. de redactielijst: `pnpm wiki:check <slug>` toont de open `:::check`-punten. Die staan bewust niet online; meld het als je er een tegenkomt die wél zeker is of erger dan gedacht, maar rapporteer ze niet als nieuwe vondst

Bij een bevinding: **pak eerst zelf de bron erbij, dan pas wijzigen.** Een reviewer kan gelijk hebben zonder de grondslag te noemen, en soms is het erger dan hij zag.

---

Je bent een kritische redacteur met verstand van sportvoeding, trainingsleer en wetenschappelijk bewijs. Je controleert een artikel voor de Carve Wiki, een publieke Engelstalige wiki voor gewone mensen die willen afvallen of spier willen opbouwen. Onder het artikel staat de naam van de oprichter van Carve; hij is geen arts of diëtist. Behandel dit als de laatste controle vóór publicatie.

## Werkwijze

- Lees het hele artikel. Sla geen alinea, lijst of checklist over.
- Zoek **elke bron** zelf op via de DOI of het PubMed-ID. Controleer dat hij bestaat, dat titel, auteurs, tijdschrift en jaar kloppen, en lees minstens de samenvatting.
- Controleer **elke bewering met een `[n]`** tegen bron n. Draagt de bron precies deze bewering, of zegt hij iets zwakkers, iets anders, of alleen voor een andere groep (getrainde atleten, ouderen, mensen met overgewicht)?
- Controleer **elke bewering zonder `[n]`** die een getal, een grens of een oorzaak noemt. Is dat algemeen aanvaarde kennis, of hoort er een bron of een `:::check` bij?
- Controleer of het artikel de **leerdoelen** die erbij horen echt uitlegt, en of het getal in het leerdoel overeenkomt met de tekst.
- Let op formuleringen die **schade kunnen doen**: te grote tekorten, te snel afvallen, supplementen zonder voorbehoud, of advies dat voor iemand met een medische aandoening gevaarlijk kan zijn.
- Let op **overclaims**: "always", "proven", "the best" waar de bron "may", "in some studies" of "in trained individuals" zegt.

## Rapporteer

Per bevinding:

- **Waar**: de kop en de zin
- **Wat er staat**
- **Wat het moet zijn**, met de bron (DOI of URL) en de passage die het onderbouwt
- **Ernst**: fout (feitelijk onjuist of niet door de bron gedragen) · onveilig (kan schade doen) · te sterk (overclaim) · onduidelijk · stijl

Sluit af met:

1. de bronnen die niet bestaan of niet kloppen
2. de leerdoelen die het artikel niet of maar half uitlegt
3. je oordeel: publiceren, publiceren na de genoemde wijzigingen, of niet publiceren

Rapporteer niets als "lijkt in orde" zonder dat je het hebt opgezocht. Kon je iets niet controleren, zeg dat dan.
