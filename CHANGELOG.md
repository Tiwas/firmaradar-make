# Changelog

Alle merkbare endringer i `firmaradar-make` dokumenteres her.

Formatet følger [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) og prosjektet bruker [Semantic Versioning](https://semver.org/lang/no/).

---

## [Unreleased]

### Removed

- **Defekt KYC-scenariomal.** Den tidligere `templates/kyc-screening.json`
  kunne ikke importeres og kjøres som beskrevet: den sendte orgnr til en
  personmodul og forventet felt API-et ikke leverer. Importpåstandene er
  fjernet fra README og landingssiden. En ny mal må eksporteres fra et
  verifisert Make-scenario før den kan publiseres.

### Changed

- **Breaking — `Get recent changes` henter én side per action-kall.**
  Automatisk paginering er fjernet fra action-modulen i tråd med Makes
  modulregler. `items` og `next_cursor` beholdes i én responsbundle, og et
  nytt valgfritt `cursor`-input henter neste side. Scenarioer som tidligere
  stolte på automatisk innhenting av alle sider, må sende `next_cursor`
  videre i en løkke.
- **Breaking — `Get risk signals` har fått produsentens faktiske felt.**
  `kyc_signals.signals[].type`, `.kategori` og `.beskrivelse`,
  `interim_balance.has_interim_balance` og `.dato`, samt
  `aggregate.risk_level` og `.signal_count` er fjernet fra Make-mappingen.
  De fire FIV-feltene `distress.score`, `.as_of`, `.rules_fired` og
  `.confidence` er også fjernet: klassifikatoren produserer dem ikke. Oppdater
  eksisterende scenarioer til de faktiske kunngjøringsfeltene,
  `interim_balance`-kildens faktiske felter og `distress.status`,
  `distress.coverage` eller `distress.data_gaps`; bruk egen FIV-modul når du
  trenger den fulle vurderingen.
  `aggregate.has_distress` blir nå sant når FIV-statusen er `distressed`.
- **Breaking — universalmodulen kan ikke lenger kalle DPA-gatete AML-stier.**
  `Make an API call` merker egne kall og backend avviser
  `POST /api/v1/aml/check`, `/report` og `/score` med
  `DPA_UNIVERSAL_MODULE_FORBIDDEN`, også når den deprecerte score-ruten er i
  synkron rollback-modus. Migrer slike scenarioer til `Check AML / PEP` eller
  `Start AML report`; de dedikerte modulene samler formål og
  per-kall-bekreftelse eksplisitt i Make-grensesnittet.
- **Strukturell sti-inneslutning for universalmodulen.** En mappet verdi som
  normaliseres ut av `/api/` (for eksempel `../ext/...`) avvises nå med
  `MAKE_UNIVERSAL_PATH_FORBIDDEN` før den kan nå en utvidelsesmontering.

### Added

- **Valgfri `page_size` i tre søkemoduler.** `Search companies`,
  `Search announcements` og `List companies in NACE industry` kan nå hente
  API-sider i mindre bolker enn totalgrensen `limit`. Uten `page_size` brukes
  fortsatt `limit` som sidestørrelse.
- **Organisasjonsnummer i to svar.** `Get group public support` har nå `orgnr`
  på toppnivå; `Get recent changes` har `items[].orgnr` på hver hendelse.
- **`deliveryId` på «Watch an industry (NACE)».** NACE-levering er
  minst-én-gang (at-least-once): samme hendelse kan komme mer enn én gang.
  Webhook `nace_changes` sprer nå bodyen og legger til `deliveryId` fra den
  stabile `X-Firmaradar-Delivery-Id`-headeren (lik på alle nye forsøk;
  `null` når headeren mangler), og modulen deklarerer feltet i `interface`
  og `samples`. Additivt — eksisterende felter beholder navn og verdi.
  Dedupliser på Delivery ID før moduler med sideeffekter — bare når den
  finnes og ikke er tom; er den tom, behandle hver leveranse som en egen
  hendelse.
- **Universalmodul «Make an API call».** Når et endepunkt ikke dekkes av en
  dedikert modul, kan det nå kalles direkte. Stien er **relativ** — skråstreken
  ligger i modulmalen, ikke i verdien du oppgir, og ledende skråstrek,
  backslash og kontrolltegn avvises. Det er bevisst: en absolutt URL ville
  sendt `Authorization`-headeren til en server du selv velger.
- **Modulgrupper.** Modulvelgeren er delt i `Companies`, `People`,
  `Risk and signals`, `AML`, `Search` og `Other` i stedet for én lang liste.
- **Modulreferanse i selve appen.** Alle moduler med endepunkt, konvensjoner
  for datoer, paginering og feil, kvoter og tilgangsgater — tilgjengelig uten
  å slå opp eksternt.
- **Cursor-paginering** i selskaps- og kunngjøringssøket og NACE-listingen.
  `Get recent changes` har manuell cursor (se *Changed*). `Search persons` pagineres ikke: endepunktet har
  verken cursor, offset eller page, og 100 treff er et tak i APIet.
- **Output-samples** på `Find related companies`,
  `List companies in NACE industry` og `Search announcements`.
- **FIV-konsernvurdering (to-nivå-test).** `check_fiv` og `check_fiv_bulk`
  vurderer nå både selskaps- og konsernleddet, jf. GBER art. 2(18)
  (EU-forordning 651/2014). Nye felter i responsen: `company_status`
  (selskaps-leddet alene), `distress_basis` (`company`/`group`/
  `company_and_group`, null hvis ikke FIV), `group_assessment` (konsernets
  status/basis/medlemmer — `FivGroupAssessment`), `rescuable_by_group`
  (boolean) og `rescue_estimate` (hva konsernet må tilføre — nullable
  `FivRescueEstimate`). Kundevendt status kan nå bli **«Ja (konsern)»**
  (rødt, kun konsern-leddet trigget), **«Ja (!)»** (oransje, selskapet var
  allerede rødt men konsernet er verifisert friskt og kan reparere) eller
  **«Tvil»** (konsern-leddet kan ikke fastslås).
- **`get_regnskapsrapport`** («Get financial report (Excel/PDF)») — ny
  modul. Bestiller en ferdig formatert regnskapsrapport (Excel eller PDF)
  — til forskjell fra `get_financials`, som gir rå tall for egen
  beregning. `GET /api/v1/regnskapsrapport/{orgnr}` med `format`
  (xlsx/pdf), `regnskapstype` (SELSKAP/KONSERN) og `years` (1-5, default
  5). Svarer med metadata + et kortlevd (15 min), signert
  nedlastings-URL — filen leveres aldri inline i responsen. Krever
  `excel_feed`-tilgang (xlsx) eller `print_til_pdf`-tilgang (pdf) på
  kontoen, ellers `403`. Koster 1 kreditt per levert regnskapsår.
- **Terminologi-retting: NUES → GBER art. 2(18).** `check_fiv`- og
  `check_fiv_bulk`-modulenes `description`-felt og README.md refererte
  tidligere til «NUES a-e-reglene» — «NUES» er ikke en reell EU-forkortelse
  for dette regelverket. Rettet til korrekt referanse: EU-forordning
  651/2014 (gruppeunntaksforordningen/GBER) art. 2(18), kriteriene (a)-(e).
  Kriterie-betegnelsen «a-e» er uendret — det var kun «NUES»-navnet på selve
  regelverket som var feil.
- **Instant triggers (webhook-baserte).** Første triggere i appen — starter et
  scenario når noe skjer, i stedet for å polle:
  - `watch_company_changes` («Watch a company») + webhook `company_changes` —
    varsel ved kunngjøring, status-, eier- eller tilskuddsendring for ett orgnr
    (`POST /api/v1/monitoring/webhooks`).
  - `watch_nace_changes` («Watch an industry (NACE)») + webhook `nace_changes` —
    varsel når et selskap i en NACE-kode endrer seg, med hendelsestype-, geo-
    (fylke/kommune) og størrelses-filtre (`POST /api/v1/nace/subscriptions`).

  Webhookene `attach`-er scenariets Make-webhook-URL som callback ved oppretting
  og `detach`-er (DELETE) ved fjerning. Valgfri leverings-hemmelighet sendes som
  `Authorization: Bearer` — og verifiseres på mottak: webhook-kommunikasjonens
  `condition` ignorerer leveranser som mangler eller har feil hemmelighet.
  (NACE-leveranser kan i tillegg bære en `X-Firmaradar-Signature`-HMAC når
  abonnementet har signing secret, men Make-webhooks har ikke tilgang til rå
  request-body i IML og kan derfor ikke verifisere body-signaturer — bruk
  leverings-hemmeligheten på denne flaten.)
- **7 nye moduler** — den analytiske KYC- og risiko-kjernen, slik at Make-flaten
  dekker samme operasjoner som MCP-serveren og n8n-pakken:
  - `get_signals` — «Get risk signals»: aggregerte risiko-signaler (KYC-kunngjøringer
    + distress/FIV + mellombalanse) i ett kall. `GET /api/v1/company/{orgnr}/signals`,
    valgfri `since`-dato.
  - `get_risk_score` — «Get risk score»: transparent 0-100-score med nivå og
    komponent-breakdown. `GET /api/v1/risikoscoring/score/{orgnr}`. Markedsplass-gated:
    krever aktivert risikoscoring + bekreftet pre-screening-disclaimer, ellers 403.
  - `check_fiv` — «Check company in difficulty (FIV)»: GBER art. 2(18) a-e-vurdering.
    `GET /api/v1/fiv/assess/{orgnr}`.
  - `search_persons` — «Search persons»: fuzzy navne-søk mot aksjonærer og
    rolleholdere. `GET /api/v1/person/search`. Returnerer stabile nøkler
    (`owner_person_key`, `role_person_id`).
  - `get_person_roles` — «Get person roles»: full rolle-historikk på tvers av
    selskap. `GET /api/v1/person/roles/{role_person_id}`.
  - `get_person_companies` — «Get person shareholdings»: aksjebeholdninger +
    total eierverdi. `GET /api/v1/person/shareholdings/{owner_person_key}`.
  - `get_konsernstotte` — «Get group public support»: direkte + konsern-aggregert
    offentlig støtte. `GET /api/v1/konsernstotte/oversikt/{orgnr}`.
- **Batch-agentiske moduler** — eksponerer de samme mønstrene som MCP-serveren
  og n8n-pakken:
  - `check_fiv_bulk` (**Bulk: distress check (FIV)**) — foretak-i-vanskeligheter
    for opptil 50 orgnr i ett kall. Per-orgnr compliance-gate returneres som
    per-orgnr `error`; 1 enhet/orgnr mot kvoten.
  - `get_risk_score_bulk` (**Bulk: risk score**) — risikoscore (0-100 + nivå +
    komponenter) for opptil 50 orgnr i ett kall.
  - `start_aml_report` (**Start AML report (async)**) — starter AML-rapport i
    bakgrunnen (submit → `rapport_id` + status «pending», HTTP 202). Sender
    DPA-headers (`X-FR-Purpose` + `X-FR-DPA-Confirmed: true`). Rate-limit
    50 kall / 30 min; rapport lagres i 60 mnd (Hvitvaskingsloven §35).
  - `get_aml_report` (**Get AML report (poll)**) — poller async-rapport-status
    til `done`/`failed`; score/level/lenker når ferdig.

  Totalt 19 action/search-moduler (8 → 19) + 2 instant-triggere.

### Changed

- **Dokumentasjonen er delt etter målgruppe.** `README.md` er nå pilot-guiden på
  norsk — installasjon, tilkobling, bruk, priser — og `readme_sdk.md` er
  connector-referansen på engelsk, med hver modul, endepunktet den kaller og
  kontrakten rundt den.
  README-en gjentar ikke referansen; den peker på den. Bakgrunnen var at fila
  blandet to lesere: norske pilotbrukere og eksterne som importerer repoet.
  Referansen ble IKKE en ny fil: alle 26 live-moduler var allerede dokumentert i
  `readme_sdk.md`, så en tredje fil ville duplisert den flaten som faktisk
  publiseres som appens readme i Make. Framgangsmåten for å importere repoet som
  privat app — med felle-notatene om `groups.json` — står i `IMPORTING.md`. Den
  er ikke pilotbruk, og en Make-reviewer kan ikke følge den inne i appen, så den
  hører hjemme utenfor appens readme — men den følger med til det offentlige
  repoet, som er der importørene faktisk er.
- `Get IP portfolio` kaller igjen den dedikerte `/api/v1/company/<orgnr>/ip`-ruten.
  Den live appen sto på `?ip=1`, og en synk fra live overskrev referansefila som
  allerede hadde det riktig. Responsen er den samme (`ip_rettigheter`), men rutene
  er ulikt vektet i metering: query-formen faktureres 1 kreditt, den dedikerte 5.
  Query-formen underfakturerte altså det eksterne Patentstyret-kallet femdobbelt.
- Registerdatoene (`registreringsdato`, `stiftelsesdato`, `konkursdato`,
  `avviklingsdato`, kunngjøringenes `dato`) er nå `text`. De er dato-uten-tid,
  og `date`-typen kunne forskyve dagen med én utenfor UTC. `as_of` i
  FIV-modulene er et faktisk tidsstempel og forblir `date`.
- Dato-input formateres til `YYYY-MM-DD` før den sendes, så en dato valgt i
  norsk tidssone ikke havner på dagen før.
- `Limit` er `uinteger` i alle moduler, og søkemodulenes default er 10.
- Setningskasus på alle modulnavn, og alle beskrivelser i tredjeperson presens.
- Connection: engelsk hjelpetekst og feilmelding, og feiltypen
  `InvalidAccessTokenError` i stedet for den ugyldige `AuthorizationError`.
  Base-URL-en er ikke lenger et redigerbart felt.


### Fixed

- `Get ownership` hadde **retningene invertert**: `down` beskrev eiere og `up`
  datterselskaper, mens APIet gjør det motsatte. Modulen deklarerte dessuten
  `subsidiaries`, som APIet aldri returnerer — feltet var alltid tomt. Riktig
  nøkkel er `holdings`, og den er et objekt med en nested liste, ikke en array.
- `Get recent changes` sendte en `days`-parameter endepunktet ikke leser, så
  «filtrer på antall dager» gjorde ingenting. Den deklarerte også `endringer`
  og `antall`, mens responsen har `items` og `count`. Erstattet med `limit` +
  cursor-paginering og riktige utdatafelter.
- `Check AML / PEP` beskrev seg som screening av et selskaps styreleder,
  daglig leder og signaturberettigede. Endepunktet tar et personnavn og
  screener **én person**.
- `Find shared connections` deklarerte ett felt, `shared`, som ikke finnes i
  responsen. De fjorten faktiske feltene er nå eksponert.
- `Search companies` pekte på en sti som svarer 404, og brukte parameternavnet
  `query` der endepunktet tar `q`.
- `Get roles` brukte `include_retired`; endepunktet tar `include_historic`.
- `Search persons` respekterte ikke `Limit` — alle treff ble sendt videre.

## [0.1.0] — 2026-05-27

Første offentlige release.

### Lagt til

- **Top-level app-definisjon** (`app.json`) med base-URL, default-headers (`Authorization`, `X-FR-Client: make-firmaradar/0.1`) og overordnet error-mapping.
- **API-key-tilkobling** (`connections/apiKey.json`) med felt for `apiKey` (password) og `baseUrl` (default `https://firmaradar.no`). Test-request mot `/api/v1/health/ping`.
- **7 moduler** under `modules/`:
  - `search_companies` — search-type-modul, søk på navn eller orgnr
  - `get_company` — full selskapsprofil
  - `get_ownership` — konsernhierarki opp/ned med `direction`, `depth` (1-12) og `include_persons`
  - `get_roles` — styre, daglig leder, prokura med `role_type` og `include_retired`
  - `get_financials` — årsregnskap og nøkkeltall, opptil 10 år tilbake
  - `check_aml_pep` — AML/PEP-screening (POST) med `purpose`-tagging for audit-log
  - `get_recent_changes` — endringer siste N dager
- **IML-helpers** (`functions/helpers.iml.js`) — `isValidOrgnr`, `normalizeOrgnr`, `extractError`, `isHighRiskStatus`.
- **Scenario-mal (trukket tilbake i Unreleased)** — den opprinnelige
  KYC-blueprinten var ikke kjørbar med de publiserte modulkontraktene.
- **GitHub Pages landing-side** (`docs/index.html`) på engelsk.
- **Norsk markeds-README** og denne `CHANGELOG.md`.
- **Apache 2.0 LICENSE**.

### Kjente begrensninger

- Make.com developer-konto og privat-app-skall opprettes manuelt før submission til den offentlige katalogen.
- Modulene `get_signals`, `search_persons`, `get_person_roles`, `get_person_companies`, `check_fiv`, `get_risk_score` og `get_konsernstotte` er planlagt for senere versjoner (levert i [Unreleased]). `get_announcements`, `search_announcements`, `compare_companies`, `list_companies_in_nace`, `find_related_companies`, `find_shared_connections` og `get_aml_score` gjenstår.

---

## [Planlagt]

### Lagt til i kilde (ikke submittet til Make-portalen ennå)

- `get_company_ip` — dedikert «Get IP portfolio»-action (patenter, varemerker og
  design fra Patentstyret). Henter `ip_rettigheter` direkte. Gjør IP like
  oppdagbar som regnskap/roller/eierskap (samme grep som MCP-verktøyet
  `get_company_ip` og n8n-operasjonen `getIp`). Submittes når appen er godkjent.

### [0.2.0]

- 6 moduler lagt i kilde (`modules/`) OG pushet live til Custom App
  `firmaradar-p9vj9v` 07-09 via Make Apps SDK-API:
  `get_announcements`, `search_announcements`, `compare_companies`,
  `list_companies_in_nace`, `find_related_companies`, `find_shared_connections`
  (live-navn i camelCase: `getAnnouncements` osv.). Appen har nå 25 moduler.
- `icon.png` lagt til (200x200 transparent PNG, nedskalert brand-mark).
- `get_aml_score` («Get AML score») lagt til i kilde (`modules/`) — mirrorer
  live-modulen `getAmlScore` (`POST /api/v1/aml/score`). Endepunktet er
  markert som foreldet av sikkerhets- og kostnadshensyn og
  svarer `202` med samme payload-form som «Start AML report» (`rapport_id`,
  `orgnr`, `status`, kanonisk `poll_url` mot `/api/v1/aml/report/<id>`), pluss
  `deprecated: true` + migreringsmelding. Modulen dekker bakoverkompatibilitet;
  «Start AML report» + «Get AML report» er den anbefalte flyten for nye
  scenarier. **Ikke pushet live** — appen er i markedsplass-review.
- Triggere: `new_announcement`, `ownership_change`, `konkurs_signal_increased`.
- Flere mal-scenarier: `konkurs-overvakning.json`, `konsern-due-diligence.json`.

### [0.3.0]

- OAuth 2.0-alternativ til API-key-auth (når 0.6 Remote MCP / hosted OAuth2-server er deployet).
