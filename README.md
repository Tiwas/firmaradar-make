<div align="center">

<img src="https://firmaradar.no/static/img/logo_nobg.png" alt="Firmaradar" width="220">

# firmaradar-make

**Bygg Make.com-scenarier mot norske selskapsdata — eierregister, konsern, regnskap, KYC og AML — uten å skrive en eneste linje kode.**

[![Lisens: Apache 2.0](https://img.shields.io/badge/Lisens-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Make.com Custom App](https://img.shields.io/badge/Make.com-custom_app-6d00cc.svg)](https://www.make.com/)
[![Versjon](https://img.shields.io/badge/versjon-0.1.0-orange.svg)](CHANGELOG.md)
[![Norsk data](https://img.shields.io/badge/data-norske%20selskaper-9333ea.svg)](https://firmaradar.no)

[**Installer i Make →**](#installasjon) &nbsp;·&nbsp;
[Moduler](#moduler) &nbsp;·&nbsp;
[Mal-scenarier](#malscenarier) &nbsp;·&nbsp;
[Prising](https://firmaradar.no/prising) &nbsp;·&nbsp;
[Dokumentasjon](https://firmaradar.no/dokumentasjon)

</div>

---

## Hva er dette?

`firmaradar-make` er en custom-app for Make.com som lar deg slå opp norske selskaper, eierstrukturer, konsernhierarkier, roller, regnskap og AML/PEP-screening direkte i scenariene dine. Samme datakilde og samme operasjoner som [MCP-serveren](https://github.com/Tiwas/firmaradar-mcp) og [n8n-pakken](https://github.com/Tiwas/firmaradar-n8n), men i Make.com-konteksten med visuelle scenarie-bygger.

Egnet for:

- **KYC-automatisering** — automatisk eierskaps-screening når nye kunder kommer inn via CRM, HubSpot, Pipedrive eller Airtable
- **Konkurs-overvåkning** — utløs varsler i Slack/Teams når et selskap i porteføljen får signaler
- **Konsern-due-diligence** — bygg sammensatte rapporter ved å kombinere flere oppslag, eksporter til Google Sheets eller PDF
- **Compliance-rapportering** — eksporter regelmessige snapshots til Sharepoint, Excel eller Google Drive
- **Kreditt-vurdering** — automatisk regnskaps-uthenting + endringssjekk på leverandører

---

## Installasjon

### Pilot (anbefalt — fungerer nå)

Appen er i **pilot-fase** og distribueres via Install URL inntil Make.com sertifisering (4-6 uker køtid). Klikk lenken under for å legge appen til din Make.com-konto:

**🚀 [Installer Firmaradar Custom App](https://www.make.com/en/hq/app-invitation/f2d3ea79f03dee549219e984b33a9308)**

Etter installasjon:

1. **Gå til Scenarios** → opprett nytt scenario
2. **Søk etter "Firmaradar"** i moduler-panelet
3. **Velg en modul** (Get Company, Search Companies, Check AML / PEP, osv.)
4. **Opprett tilkobling** med din Firmaradar API-key fra [firmaradar.no/min-side/api-keys](https://firmaradar.no/min-side/api-keys)

### Fra Make.com-katalogen (etter sertifisering)

Når appen er godkjent og publisert i Make-direktoratet (Q3 2026 estimert):

1. Logg inn på [Make.com](https://www.make.com/)
2. Gå til **My Apps → Add app** og søk etter **Firmaradar**
3. Klikk **Install**

### Eksperimentell: privat-app-utvikling

Hvis du vil eksperimentere med å bygge din egen versjon av appen mot egen developer-konto:

1. Opprett developer-konto på [developers.make.com](https://developers.make.com/)
2. Opprett ny Custom App via **Make → More → Custom Apps → Create a new app**
3. Lim inn innholdet fra `app.json`, `connections/`, `modules/` og `functions/` via Web Code Editor (jsonc-blokker)
4. Test scenariene mot din egen Make.com-instans

> ⚠️ Filene i dette repoet er **referanse-dokumentasjon** av live-appen. De er ikke nødvendigvis 100 % synkronisert med Make sin database i sanntid (Make CLI for source-sync kommer i v0.2).

---

## Konfigurer legitimasjon

Når du legger til en Firmaradar-modul, må du opprette en **Firmaradar API**-tilkobling:

1. Klikk **Add → Firmaradar → API Key**
2. Lim inn API-nøkkelen din fra [firmaradar.no/min-side/api-keys](https://firmaradar.no/min-side/api-keys)
3. (Valgfritt) Endre base-URL hvis du kjører selvhostet Firmaradar (default: `https://firmaradar.no`)
4. Make tester tilkoblingen mot `/api/v1/health/ping` automatisk
5. Lagre

Samme tilkobling gjenbrukes på tvers av alle Firmaradar-moduler i alle scenarier.

---

## Moduler

7 moduler i v0.1, samlet under én Firmaradar-app:

### Søk (search-modul)
- **Search companies** — søk på navn eller orgnr, returnerer opptil 100 rader

### Selskaps-handlinger (action-moduler)
- **Get company** — full profil (organisasjonsform, NACE, ansatte, adresse, regnskap, eiere, roller)
- **Get ownership** — konsernhierarki opp og ned, dybde 1–12, valgfri person-inkludering
- **Get roles** — styre, daglig leder, prokura (med valgfri fratrådt-historikk)
- **Get financials** — årsregnskap og nøkkeltall opptil 10 år tilbake
- **Get recent changes** — endringer siste N dager (rolle, adresse, signal, kunngjøring)

### KYC og AML
- **Check AML/PEP** — full AML/PEP-screening med sanksjonslister, audit-log og formåls-tagging (kyc_onboarding / kyc_review / risk_monitoring / manual)

Flere moduler — `get_announcements`, `get_signals`, `search_persons`, `compare_companies`, `list_companies_in_nace`, AML-score, FIV-sjekk — kommer i v0.2 og v0.3.

---

## Mal-scenarier

Repoet inneholder en ferdig scenario-mal du kan importere direkte i Make via **Scenarios → Create → Import blueprint**:

| Mal | Bruksområde |
|---|---|
| [`templates/kyc-screening.json`](templates/kyc-screening.json) | Webhook-trigger (orgnr) → AML/PEP-sjekk + eierskap → router som varsler Slack ved høy risiko og logger til Google Sheets ellers |

---

## Priser

Make-appen er gratis. Du betaler kun for Firmaradar-abonnementet ditt etter forbruk:

- **99 kr/mnd plattformavgift**
- Per-kall-pris avhengig av pakke (se [firmaradar.no/prising](https://firmaradar.no/prising))
- Egen rabattert MCP/agent-pakke for høy-volum-arbeidsflyter

Make-kall belastes som vanlige API-kall siden de skjer fra Make sin infrastruktur, ikke fra en AI-agent.

---

## Forholdet til MCP-serveren og n8n-pakken

Denne pakken, [Firmaradar MCP-serveren](https://github.com/Tiwas/firmaradar-mcp) og [n8n-pakken](https://github.com/Tiwas/firmaradar-n8n) er tre grensesnitt til samme datakilde:

| | Make.com custom app | n8n community node | MCP-server |
|---|---|---|---|
| **Bruksområde** | Visuelle scenarier, branching, SaaS-integrasjoner | Selvhostede arbeidsflyter, avansert scripting | AI-agenter (Claude, ChatGPT, Cursor) |
| **Installasjon** | Make.com app-katalog | n8n GUI eller `npm install` | OAuth-tilkobling eller `pip install` |
| **Auth** | API-nøkkel (kryptert i Make) | API-nøkkel via n8n-legitimasjon | OAuth 2.0 eller API-nøkkel |
| **Datakilde** | Samme Firmaradar API | Samme Firmaradar API | Samme Firmaradar API |

Alle tre bruker samme operasjons-skjema i bunn, så du kan migrere arbeidsflyter mellom dem uten datatap.

---

## Hvorfor åpen kildekode?

- **Transparens** — du kan lese hver moduldefinisjon og se nøyaktig hva som sendes til Firmaradar
- **Tillit gjennom gjennomgang** — Apache 2.0. Lås til en spesifikk versjon, kjør din egen SBOM-skanning, eller fork-en og kjør som privat-app på din egen Make-konto
- **Bidrag velkommen** — vi tar imot pull requests som forbedrer skjemaer eller legger til kompatibilitets-lag for nye Make.com-versjoner

Backend (firmaradar.no) er proprietær fordi den eier dataflyten og lisensieringen mot Skatteetaten og Brønnøysund.

---

## Sikkerhet og GDPR

- API-nøkkel lagres i Make sin krypterte legitimasjon-store, aldri i klartekst i scenario-JSON
- Loggføring per kall på Firmaradar-siden (kunde-id, nøkkel-id, endepunkt og status) — eksporteres via DSAR-rapport
- Person-data pseudonymiseres på serversiden; sikkerhetskopier kryptert og lagret eksternt
- Make-tilkoblingen sender `X-FR-Client: make-firmaradar/0.1` slik at Firmaradar kan skille Make-trafikk fra n8n/MCP/direkte API-bruk i audit-loggen
- Norsk lov og GDPR-tilpasset: behandlingsgrunnlag, samtykke, oppbevaringstid

Hele sikkerhets-policyen: [firmaradar.no/personvern](https://firmaradar.no/personvern)

---

## Repo-struktur

```
tools/make_app/
├── app.json                          # Top-level metadata (navn, base-URL, headers)
├── connections/
│   └── apiKey.json                   # API-key-tilkobling med test mot /health/ping
├── modules/
│   ├── search_companies.json         # Search-type modul
│   ├── get_company.json              # Action: full profil
│   ├── get_ownership.json            # Action: eierskap m/direction + depth
│   ├── get_roles.json                # Action: roller m/role_type + include_retired
│   ├── get_financials.json           # Action: regnskap m/years
│   ├── check_aml_pep.json            # POST: AML/PEP-screening m/purpose
│   └── get_recent_changes.json       # Action: endringer siste N dager
├── functions/
│   └── helpers.iml.js                # IML-helpers (orgnr-validering, error-extract)
├── templates/
│   └── kyc-screening.json            # Eksempel-scenario (KYC-screening)
├── docs/
│   └── index.html                    # GitHub Pages landing-side (engelsk)
├── README.md                         # Denne filen
├── CHANGELOG.md                      # Versjons-historikk
└── LICENSE                           # Apache 2.0
```

---

## Støtte og spørsmål

- **Feil i denne Make-pakken** → [GitHub Issues](https://github.com/Tiwas/firmaradar-make/issues)
- **Spørsmål om data eller priser** → [kontakt Firmaradar](https://firmaradar.no/kontakt)
- **Salg eller partnerskap** → lars@firmaradar.no

---

## Versjons-historikk

Se [CHANGELOG.md](CHANGELOG.md) for full historikk.

- **0.1.0** — Initial release. 7 moduler (search_companies, get_company, get_ownership, get_roles, get_financials, check_aml_pep, get_recent_changes) + KYC-screening-mal.

---

<div align="center">

**Bygget av [Firmaradar AS](https://firmaradar.no)** — agentisk infrastruktur for norske selskapsdata.

[firmaradar.no](https://firmaradar.no) &nbsp;·&nbsp; [Prising](https://firmaradar.no/prising) &nbsp;·&nbsp; [Dokumentasjon](https://firmaradar.no/dokumentasjon) &nbsp;·&nbsp; [Personvern](https://firmaradar.no/personvern) &nbsp;·&nbsp; [MCP-server](https://github.com/Tiwas/firmaradar-mcp) &nbsp;·&nbsp; [n8n-noder](https://github.com/Tiwas/firmaradar-n8n)

</div>
