<div align="center">

<img src="https://firmaradar.no/static/img/logo_nobg.png" alt="Firmaradar" width="220">

# firmaradar-make

**Bygg Make.com-scenarier mot norsk selskaps-intelligens — eierskap, konsern, regnskap, KYC, AML og risiko — uten å skrive en eneste linje kode.**

[![Lisens: Apache 2.0](https://img.shields.io/badge/Lisens-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Make.com Custom App](https://img.shields.io/badge/Make.com-custom_app-6d00cc.svg)](https://www.make.com/)
[![Versjon](https://img.shields.io/badge/versjon-0.1.0-orange.svg)](CHANGELOG.md)
[![Norsk data](https://img.shields.io/badge/data-norske%20selskaper-9333ea.svg)](https://firmaradar.no)

[**Installer i Make →**](#installasjon) &nbsp;·&nbsp;
[Modulreferanse](readme_sdk.md) &nbsp;·&nbsp;
[Prising](https://firmaradar.no/prising) &nbsp;·&nbsp;
[Dokumentasjon](https://firmaradar.no/dokumentasjon)

</div>

---

> **Dette er pilot-guiden, på norsk.** Den dekker installasjon, tilkobling og
> daglig bruk.
>
> Den fullstendige **connector-referansen** — hver modul med endepunkt og
> kontrakt, konvensjoner for paginering og datoer, kvotevekter og tilgangsgater
> — ligger i
> [`readme_sdk.md`](readme_sdk.md), på engelsk. Det er samme fil som er publisert
> som appens egen readme inne i Make, så den er skrevet for det publikummet:
> Make-reviewere og eksterne som importerer dette repoet.
>
> Fila du leser nå gjentar ikke den referansen. Når du trenger å vite hva en
> modul faktisk kaller, eller hva et kall koster — gå dit. De enkelte
> inn- og utdatafeltene ser du i modulen selv i Make; referansen beskriver
> kontrakten, ikke hvert felt.

---

## Hva er dette?

`firmaradar-make` er en custom-app for Make.com som gir scenariene dine
beslutningsklar norsk selskaps-intelligens: eierstrukturer, konsernhierarkier,
roller, regnskap, risikoscore og AML/PEP-screening.

Firmaradar er en berikelsesplattform. Modulene svarer med den sammenstilte
vurderingen — ikke med et rått registeruttrekk — fordi plattformen fletter flere
kilder (Brønnøysundregistrene, Skatteetaten, Patentstyret, NAV, Innovasjon
Norge, SkatteFUNN og internasjonale PEP- og sanksjonslister) og legger egne
berikelseslag oppå. Et scenario kan derfor handle på et risikonivå eller en
FIV-klassifisering uten å modellere norsk selskapsrett selv.

Appen er Make-flaten av den samme kontrakten som tilbys over MCP, n8n og Power
Automate. Feltnavn og semantikk er stabile på tvers av flatene, så du kan flytte
en arbeidsflyt mellom dem uten datatap.

Egnet for:

- **KYC-automatisering** — automatisk eierskaps-screening når nye kunder kommer inn via CRM, HubSpot, Pipedrive eller Airtable
- **Konkurs-overvåkning** — utløs varsler i Slack/Teams når et selskap i porteføljen får signaler
- **Konsern-due-diligence** — bygg sammensatte rapporter ved å kombinere flere oppslag, eksporter til Google Sheets eller PDF
- **Compliance-rapportering** — eksporter regelmessige snapshots til Sharepoint, Excel eller Google Drive
- **Kreditt-vurdering** — automatisk regnskaps-uthenting + endringssjekk på leverandører

---

## Installasjon

### Pilot (anbefalt — fungerer nå)

Appen er i **pilot-fase** og distribueres via Install URL mens Make vurderer
innsendingen til app-katalogen. Klikk lenken under for å legge appen til din
Make.com-konto:

**🚀 [Installer Firmaradar Custom App](https://www.make.com/en/hq/app-invitation/f2d3ea79f03dee549219e984b33a9308)**

Etter installasjon:

1. **Gå til Scenarios** → opprett nytt scenario
2. **Søk etter "Firmaradar"** i moduler-panelet
3. **Velg en modul** (Get company, Search companies, Check AML / PEP, osv.)
4. **Opprett tilkobling** med din Firmaradar API-nøkkel fra [firmaradar.no/min-side/api-keys](https://firmaradar.no/min-side/api-keys)

### Fra Make.com-katalogen (etter sertifisering)

Hvis Make godkjenner og publiserer appen i katalogen:

1. Logg inn på [Make.com](https://www.make.com/)
2. Gå til **My Apps → Add app** og søk etter **Firmaradar**
3. Klikk **Install**

### Bygge din egen private app fra dette repoet

Vil du importere definisjonene i dette repoet til din egen developer-konto i
stedet, står den framgangsmåten i
[`IMPORTING.md`](IMPORTING.md) — seksjonen ble flyttet dit da `readme_sdk.md` ble gjort publiserbar.

Den delen er engelsk med vilje: den er ikke pilotbruk, men skrevet for den som
importerer repoet. Den bærer også fellene i importen — les den før du limer inn
noe, for gruppene binder ikke uten videre til de importerte modulene.

> ⚠️ Filene i dette repoet er **referanse-dokumentasjon** av live-appen. De er
> ikke nødvendigvis 100 % synkronisert med Make sin database i sanntid (Make CLI
> for source-sync kommer i v0.2).

---

## Konfigurer legitimasjon

Når du legger til en Firmaradar-modul, må du opprette en **Firmaradar API**-tilkobling:

1. Klikk **Add → Firmaradar → API Key**
2. Lim inn API-nøkkelen din fra [firmaradar.no/min-side/api-keys](https://firmaradar.no/min-side/api-keys)
3. Lagre

Det er hele skjemaet. Samme tilkobling gjenbrukes på tvers av alle
Firmaradar-moduler i alle scenarier.

To ting er verdt å vite før du tester:

> 🪤 **Det finnes ingen base-URL-kontroll.** Tilkoblingen har kun feltet
> `apiKey`; URL-en er hardkodet til `https://firmaradar.no` nettopp for at
> `Authorization`-headeren ikke skal kunne omdirigeres til en server du selv
> velger. Selvhosting støttes derfor ikke gjennom denne connectoren.

> 🪤 **Tilkoblingstesten koster én kvoteenhet.** Make validerer nøkkelen med et
> ekte autentisert oppslag (`GET /api/v1/company/923609016`), ikke med et gratis
> helsesjekk-kall. `/api/v1/health/ping` ble vurdert og forkastet: den svarer
> `404`, så en test mot den ville godtatt hvilken som helst nøkkel — også en
> ugyldig.

Tilkoblingen lagres ved `200`, `402`, `403` og `429` — de tre siste betyr at
nøkkelen **autentiserte**, selv om noe annet stoppet kallet. Det er bevisst: en
nøkkel med aktiv AML- eller utvidelsespakke, men uten selskaps-oppslag, får
`403` på testkallet selv om dens egne moduler virker helt fint.

🪤 Alt annet enn disse fire avvises som ugyldig nøkkel. `401` er det tilsiktede
tilfellet, men en forbigående `500` eller en uventet `404` gir samme
`InvalidAccessTokenError`. Får du den under et backend-avbrudd, er det ikke
nødvendigvis nøkkelen din — prøv igjen senere før du genererer en ny. Prisen er at en sperret eller utløpt
konto ser en frisk tilkobling og får sin spesifikke feil først når en modul
kjører — den billigste av de to feilene.

---

## Hva du finner i modulvelgeren

Modulene er gruppert som `Companies`, `People`, `Risk and signals`, `AML`,
`Search` og `Other`. Hver enkelt modul, med endepunktet den kaller og hva den
returnerer, er dokumentert i
[`readme_sdk.md` § *Module reference*](readme_sdk.md#module-reference).

🪤 **Ikke alle moduldefinisjoner i `modules/` er moduler du kan velge.** Noen er
med vilje ikke pushet til live-appen, og noen av de pushede er skjult i
modulvelgeren for å holde reviewflaten smal. De skjulte står i
[`readme_sdk.md` § *Module reference*](readme_sdk.md#module-reference), som er
stedet statusen vedlikeholdes. De fire som aldri ble pushet er ikke der — de
står i en repo-intern oversikt som ikke følger med det offentlige speilet.
Antallet er med vilje ikke gjentatt her: en modul som gjøres synlig eller pushes
ville ellers gjort denne fila usann uten at noen så det.

Finner du ikke en modul du forventet, er det nesten alltid dette som er
forklaringen — ikke en feil i installasjonen.

---

## Når du får 403 (eller 422)

Noen funksjoner er gated per konto. En `403` — eller en `422` fra
organisasjonsform-gaten — betyr at gaten er lukket, ikke at forespørselen var
feil.

🪤 En `400` er ikke en gate. **Enkeltoppslags-modulene** validerer orgnummeret
før det gatede kallet og svarer `400 invalid_orgnr` på alt som ikke er ni
siffer, så en ugyldig verdi skal ikke feilsøkes som et tilgangsproblem.

🪤 **Bulk-modulene viser ingen av delene som HTTP-status.** De svarer `200` selv
når rader feiler: både et ugyldig nummer (`invalid_orgnr`) og en lukket gate
ligger per orgnr i `results[]`. Per-rad-statusen går til audit-loggen og
`_meta.failed`, ikke til svarkoden. Et scenario som forgrener seg på
HTTP-statusen alene, vil lese en batch med feilede rader som helt vellykket —
sjekk `results[].error`.

- **Risikoscoring** krever at funksjonen er aktivert på kontoen, og at
  pre-screening-disclaimeren er bekreftet
- **Person-modulene og person-søket** krever full-søk-tilgang. Mindreårige
  filtreres bort, og fødselsår maskeres alltid til firesifret år
- **AML-modulene** krever signert databehandleravtale
- **Organisasjonsform** — både `ENK` (enkeltpersonforetak) og `NUF`
  (norskregistrert utenlandsk foretak) er blokkert fra risikoscore-modulene by
  design, gjennom én og samme sperre (`enk_not_supported`, HTTP 422). Tross
  navnet på feilkoden er dette en organisasjonsform-gate, ikke en ENK-gate — et
  NUF er ikke et enkeltpersonforetak. 🪤 FIV-modulene har ikke den sperren: et
  ENK blir vurdert, men holdes utenfor kriterium (b), som måler tap av
  selskapskapital et enkeltpersonforetak ikke har

I bulk-modulene kommer et lukket gate-svar som en feil per orgnr, ikke som en
feil på hele kallet. Den fullstendige oversikten står i
[`readme_sdk.md` § *Compliance notes*](readme_sdk.md#compliance-notes).

---

## Priser

Make-appen er gratis. Du betaler kun for Firmaradar-abonnementet ditt etter forbruk:

- **99 kr/mnd plattformavgift**
- Per-kall-pris avhengig av pakke (se [firmaradar.no/prising](https://firmaradar.no/prising))
- Egen rabattert MCP/agent-pakke for høy-volum-arbeidsflyter

Make-kall belastes som vanlige API-kall siden de skjer fra Make sin
infrastruktur, ikke fra en AI-agent. Hva det enkelte kallet veier — og hvorfor
et orgnr i en bulk-modul teller som én kvoteenhet, men koster ulikt antall
kreditter fra modul til modul — står under
[`readme_sdk.md` § *Quotas and rate limits*](readme_sdk.md#quotas-and-rate-limits).

---

## Forholdet til MCP-serveren og n8n-pakken

Denne pakken, [Firmaradar MCP-serveren](https://github.com/Tiwas/firmaradar-mcp)
og [n8n-pakken](https://github.com/Tiwas/firmaradar-n8n) er tre grensesnitt til
samme plattform:

| | Make.com custom app | n8n community node | MCP-server |
|---|---|---|---|
| **Bruksområde** | Visuelle scenarier, branching, SaaS-integrasjoner | Selvhostede arbeidsflyter, avansert scripting | AI-agenter (Claude, ChatGPT, Cursor) |
| **Installasjon** | Make.com app-katalog | n8n GUI eller `npm install` | OAuth-tilkobling eller `pip install` |
| **Auth** | API-nøkkel (kryptert i Make) | API-nøkkel via n8n-legitimasjon | OAuth 2.0 eller API-nøkkel |
| **Kontrakt** | Samme Firmaradar-kontrakt | Samme Firmaradar-kontrakt | Samme Firmaradar-kontrakt |

Alle tre bruker samme operasjons-skjema i bunn, så du kan migrere arbeidsflyter
mellom dem uten datatap.

---

## Hvorfor åpen kildekode?

- **Transparens** — du kan lese hver moduldefinisjon og se nøyaktig hva som sendes til Firmaradar
- **Tillit gjennom gjennomgang** — Apache 2.0. Lås til en spesifikk versjon, kjør din egen SBOM-skanning, eller fork-en og kjør som privat-app på din egen Make-konto
- **Bidrag velkommen** — vi tar imot pull requests som forbedrer skjemaer eller legger til kompatibilitets-lag for nye Make.com-versjoner

Backend (firmaradar.no) er proprietær fordi den eier dataflyten og
lisensieringen mot Skatteetaten og Brønnøysund.

---

## Sikkerhet og GDPR

- API-nøkkelen lagres i Make sin krypterte legitimasjon-store, aldri i klartekst i scenario-JSON. Appen deklarerer i tillegg `log.sanitize` på `Authorization`-headeren — mekanismen Make bruker for å holde den utenfor eksekveringsloggene
- Loggføring per kall på Firmaradar-siden (kunde-id, nøkkel-id, endepunkt og status) — eksporteres via DSAR-rapport
- Person-data pseudonymiseres på serversiden; sikkerhetskopier krypteres og lagres eksternt
- Make-tilkoblingen sender `X-FR-Client: make-firmaradar/0.1` slik at Firmaradar kan skille Make-trafikk fra n8n/MCP/direkte API-bruk i audit-loggen
- Norsk lov og GDPR-tilpasset: behandlingsgrunnlag, samtykke, oppbevaringstid

> 🚨 **`untrusted_content`-markøren er smal, og fraværet av den beviser
> ingenting.** Bare to endepunkter merker svaret sitt. Ingen andre setter
> markøren — heller ikke de mange som returnerer fritekst fra registeret. Bygger
> du et scenario som leser markøren for å avgjøre hva som er trygt å sende videre
> til en AI-modul, vil det behandle de fleste selskapsnavn som betrodde. Behandle
> all register-fritekst som data, aldri som instruksjoner — uavhengig av
> markøren.
> Hvilke to endepunktene er, står i
> [`readme_sdk.md` § *Conventions*](readme_sdk.md#conventions).

Hele sikkerhets-policyen: [firmaradar.no/personvern](https://firmaradar.no/personvern)

---

## Repo-struktur

```
.
├── app.json              # App-metadata: navn, fast base-URL, felles headere
├── groups.json           # Modulgruppene i velgeren — fasit for hvilke som er live
├── connections/
│   └── apiKey.json       # API-nøkkel-tilkoblingen (ett felt) + tilkoblingstesten
├── modules/              # Moduldefinisjoner (ikke alle er live — se avsnittet over)
├── webhooks/             # 2 webhook-definisjoner for instant-triggerne
├── functions/
│   └── helpers.iml.js    # IML-helpers (orgnr-validering, feil-uttrekk)
├── docs/
│   └── index.html        # GitHub Pages landingsside (engelsk)
├── icon.png              # App-ikonet
├── README.md             # Denne fila — pilot-guide (norsk)
├── readme_sdk.md         # Connector-referanse (engelsk), publisert som appens readme
├── IMPORTING.md           # Importere repoet som privat Make-app (engelsk)
├── CHANGELOG.md          # Versjons-historikk
└── LICENSE               # Apache 2.0
```

---

## Støtte og spørsmål

- **Feil i denne Make-pakken** → [GitHub Issues](https://github.com/Tiwas/firmaradar-make/issues)
- **Spørsmål om data eller priser** → [kontakt Firmaradar](https://firmaradar.no/kontakt)
- **Salg eller partnerskap** → lars@firmaradar.no

---

## Versjons-historikk

Se [CHANGELOG.md](CHANGELOG.md) for full historikk.

- **0.1.0** — Første moduldefinisjoner; se [endringsloggen](CHANGELOG.md) for historiske detaljer og senere rettinger.

---

<div align="center">

**Bygget av [Firmaradar AS](https://firmaradar.no)** — agentisk infrastruktur for norsk selskaps-intelligens.

[firmaradar.no](https://firmaradar.no) &nbsp;·&nbsp; [Prising](https://firmaradar.no/prising) &nbsp;·&nbsp; [Dokumentasjon](https://firmaradar.no/dokumentasjon) &nbsp;·&nbsp; [Personvern](https://firmaradar.no/personvern) &nbsp;·&nbsp; [MCP-server](https://github.com/Tiwas/firmaradar-mcp) &nbsp;·&nbsp; [n8n-noder](https://github.com/Tiwas/firmaradar-n8n)

</div>
