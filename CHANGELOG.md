# Changelog

Alle merkbare endringer i `firmaradar-make` dokumenteres her.

Formatet følger [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) og prosjektet bruker [Semantic Versioning](https://semver.org/lang/no/).

---

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
- **Scenario-mal** (`templates/kyc-screening.json`) — webhook-trigger → AML/PEP-sjekk + eierskap → router (Slack ved høy risiko, Google Sheets ellers).
- **GitHub Pages landing-side** (`docs/index.html`) på engelsk.
- **Norsk markeds-README** og denne `CHANGELOG.md`.
- **Apache 2.0 LICENSE**.

### Kjente begrensninger

- Logo-filene leveres av Marius og er ennå ikke inkludert i `icon`-feltet i `app.json` (plassholder-referanse til `icon.png`).
- Make.com developer-konto og privat-app-skall opprettes manuelt før submission til den offentlige katalogen.
- Modulene `get_announcements`, `get_signals`, `search_persons`, `compare_companies`, `list_companies_in_nace`, `get_aml_score`, `check_fiv`, `list_konsernstotte` og `get_skattelister` er planlagt for 0.2 og 0.3.

---

## [Planlagt]

### Lagt til i kilde (ikke submittet til Make-portalen ennå)

- `get_company_ip` — dedikert «Get IP portfolio»-action (patenter, varemerker og
  design fra Patentstyret). Henter `ip_rettigheter` direkte. Gjør IP like
  oppdagbar som regnskap/roller/eierskap (samme grep som MCP-verktøyet
  `get_company_ip` og n8n-operasjonen `getIp`). Submittes når appen er godkjent.

### [0.2.0]

- Legg til moduler: `get_announcements`, `get_signals`, `search_persons`, `search_persons` med fødselsår-filter, `compare_companies`, `list_companies_in_nace`.
- Triggere: `new_announcement`, `ownership_change`, `konkurs_signal_increased`.
- Flere mal-scenarier: `konkurs-overvakning.json`, `konsern-due-diligence.json`.

### [0.3.0]

- AML-score-modul (`get_aml_score`).
- Foretak-i-vanskeligheter-modul (`check_fiv`).
- Offentlige data: `list_konsernstotte`, `get_skattelister`.
- OAuth 2.0-alternativ til API-key-auth (når 0.6 Remote MCP / hosted OAuth2-server er deployet).
