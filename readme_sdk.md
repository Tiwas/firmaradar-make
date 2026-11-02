# Firmaradar for Make

> Output fields have been reviewed against the registered routes and source
> producers. Many fields depend on source coverage, account access and the
> specific company. Handle absent or null fields in your scenario; sample
> responses illustrate possible values rather than guaranteeing them.

Enrichment platform for Norwegian company intelligence — KYC, AML, ownership,
roles, financials and risk, directly in your Make workflows.

Firmaradar fuses several Norwegian and international sources into
decision-ready answers: the Brønnøysund Register Centre, Skatteetaten (the
Norwegian Tax Administration), Patentstyret (the Norwegian Industrial Property
Office), NAV, Innovasjon Norge, SkatteFUNN and international PEP and sanctions
lists. The modules return the fused assessment, not raw registry records — so a
scenario can act on a risk level or a statutory distress classification without
having to model Norwegian company law itself.

This app is the Make surface of the same contract offered over MCP, n8n and
Power Automate. Field names and semantics are stable across those surfaces.

---

## Contents

- [Connection](#connection)
- [Conventions](#conventions)
- [Module reference](#module-reference)
- [Quotas and rate limits](#quotas-and-rate-limits)
- [Compliance notes](#compliance-notes)
- [Full API reference](#full-api-reference)

---

## Connection

The connection takes a single field, **API Key**. Generate one at
<https://firmaradar.no/min-side/api-keys>.

- Make stores the key encrypted and sends it as `Authorization: Bearer <key>`
  on every request.
- Both the app base and the connection declare
  `log.sanitize: ["request.headers.authorization"]` — the mechanism by which
  Make is instructed to keep the header out of execution logs.
- The base URL is fixed to `https://firmaradar.no`. It is deliberately not a
  connection field: a user-editable base URL would let the `Authorization`
  header be sent to a server of the user's choosing.
- Creating the connection performs one authenticated lookup to validate the key
  and consumes one quota unit. The connection is saved on `200`, `402`, `403`
  and `429` — the last three mean the key **authenticated** even though
  something else stopped the call, so an account entitled to AML or an extension
  but not to company lookup can still connect.
  🪤 Every other status is rejected as an invalid key. `401` is the intended
  case, but a transient `500` or an unexpected `404` raises the same
  `InvalidAccessTokenError`, so a failure during a backend outage is not
  necessarily a bad key.

---

## Conventions

**Base URL.** All module paths are relative to `https://firmaradar.no`.

**Organization numbers.** A Norwegian organization number (`orgnr`) is exactly
nine digits. Every module that takes one validates that shape before calling.

**Dates.** Register dates (`registreringsdato`, `stiftelsesdato`,
`konkursdato`, `avviklingsdato`, `dato`) are date-only values in `YYYY-MM-DD`
form and are exposed as **text**, not as Make date fields. A date-only string
parsed into a timestamp can shift by a day in time zones other than UTC, which
would silently move a registration or bankruptcy date. Fields that genuinely
carry a timestamp — such as `as_of` in the distress modules — remain date
fields. Date *inputs* are date fields for the picker, and are formatted to
`YYYY-MM-DD` before being sent.

**Pagination.** Where the endpoint supports it, the modules paginate on
`cursor` and stop when the response returns no `next_cursor`:
`Search companies`, `Search announcements` and `List companies in NACE industry`.
`Get recent changes` is an action: it returns one page as one bundle. To fetch
another page, map its `next_cursor` to the optional `Cursor` input of the next
call. `Search persons` does **not** paginate — the
`/api/v1/person/search` endpoint accepts only `q` and `limit` (maximum 100)
and offers no cursor, offset or page parameter. For that module, 100 results
per result set is a limit of the API, not of the app.

**Search modules** return each match as its own bundle, so the next module in
the scenario runs once per match. No Iterator is required. Each of them
honours the module's `Max results` value.

**Errors.** Failures surface as `[<status>] <error_code> <message>` from the
API. `403` generally means the account lacks that capability (see
[Compliance notes](#compliance-notes)); `401` means the API key is invalid.

**Untrusted content.** 🚨 The marker is NARROW, and its absence proves nothing.

Exactly two endpoints tag their output. Verified against the running API on
18-08 by enumerating every place the tag is applied — these two, and no others:

| Tagged endpoint | Module | Tagged field |
| --- | --- | --- |
| `GET /api/v1/company/{orgnr}/changes` | Get recent changes | `items[].navn` |
| `GET /api/v1/announcements/search` | Get company announcements, Search announcements | `items[].navn` |

Those responses set `untrusted_content: true` and list the affected paths in
`untrusted_fields`.

No other endpoint sets the marker — including the many that do return
register-sourced free text. For example `GET /api/v1/company/{orgnr}/basic`
returns `navn` straight from the register and sets nothing. A scenario that reads
the marker to decide what is safe to pipe into an AI module will therefore treat
most company names as trusted.

🪤 **Treat all register-sourced text as data, never as instructions —
regardless of the marker.** The marker tells you a field IS untrusted; it never
tells you a field is safe.

---

## Module reference

**26 modules are live**, and the tables below describe exactly those.

🔒 **Six of the 26 are hidden and cannot be selected.** They are deliberately
kept private, are marked 🔒 in the tables, and are documented for completeness
— not because you can pick them today.

### Companies

| Module | Endpoint | Notes |
| --- | --- | --- |
| Get company | `GET /api/v1/company/{orgnr}/basic` | Flat core record: name, organization form, status, industry, employees, address, contact details, capital, bankruptcy and dissolution flags. |
| Get financials | `GET /api/regnskap/{orgnr}/historikk` | Up to 10 years of operating revenue, operating profit, profit for the year, total assets, equity and liabilities. Returns **one** statement type per call — company accounts when they exist, otherwise consolidated group accounts; the `regnskapstype` output says which. `hydrating` marks a history still being built, so a short `items` array is not proof that no more years exist. This path deliberately has no `/v1/` prefix — it is a legacy path with its own metering gate. |
| Get ownership | `GET /api/v1/company/{orgnr}/ownership` | `direction=down` returns `holdings` (companies this company owns); `direction=up` returns `owners` (who owns this company, toward the ultimate beneficial owner); `both` returns both. 🪤 `depth` is accepted (1–10) and echoed back, but does not currently affect the result — the payload is non-recursive regardless of the value, so do not build a scenario that expects the module to walk a multi-level tree for you. `Include individual owners` requires full-ownership consent on the key. |
| Get roles | `GET /api/v1/company/{orgnr}/roles` | CEO, chair, board members, power of procuration, signatories. Optionally includes people who have resigned (`include_historic`). |
| Get recent changes | `GET /api/v1/company/{orgnr}/changes` | One page of register announcements per action call, most recent first. Pass `next_cursor` back as `Cursor` to fetch the next page. |
| Get company announcements 🔒 | `GET /api/v1/announcements/search` | Announcements for one company, filtered by type and date range. |
| Get IP portfolio | `GET /api/v1/company/{orgnr}/ip` | Patents, trademarks and designs from Patentstyret — totals, active counts and individual rights, newest first. |
| Get group public support | `GET /api/v1/konsernstotte/oversikt/{orgnr}` | State aid received by the company and aggregated up the ownership tree. Fuses NAV grants, COVID-19 support, the register's state-aid data, Innovasjon Norge and SkatteFUNN. |
| Compare companies 🔒 | `POST /api/v1/companies/compare` | Server-side comparison of 1–5 companies over N years. |

### People

| Module | Endpoint | Notes |
| --- | --- | --- |
| Get person roles | `GET /api/v1/person/roles/{role_person_id}` | Complete role history, active and historical. Takes the stable `role_person_id` from `Search persons`. |
| Get person shareholdings | `GET /api/v1/person/shareholdings/{owner_person_key}` | Every company the person holds shares in, with stakes and values. Takes the stable `owner_person_key` from `Search persons`. |

Both require full-search access. Birth year is masked to a four-digit year and
minors are excluded.

### Risk and signals

| Module | Endpoint | Notes |
| --- | --- | --- |
| Get risk signals | `GET /api/v1/company/{orgnr}/signals` | Multi-source KYC announcements, FIV classification, interim balances and other indicators. `aggregate` contains a KYC announcement count and boolean flags; check each source's `error`, `coverage` and `data_gaps` before interpreting a negative flag. |
| Get risk score | `GET /api/v1/risikoscoring/score/{orgnr}` | Transparent 0–100 score with `risk_level` (`lav`/`moderat`/`høy`/`kritisk`) and a component breakdown. The score is returned **even when inputs are missing** — read `data_gaps`, and observe the `disclaimer`, which forbids credit assessment and automated negative decisions. Gate failures are typed non-2xx responses: `403` for access/confirmation, `404 company_not_found`, `422 enk_not_supported`/`blocked_enk`, and retryable `503 orgform_unavailable`. |
| Bulk: risk score | `POST /api/v1/risikoscoring/score/bulk` | Up to 50 companies per call. Per-orgnr gates are returned as per-orgnr errors rather than failing the batch. |
| Check company in difficulty (FIV) | `GET /api/v1/fiv/assess/{orgnr}` | Deterministic statutory distress classification against Norwegian criteria a–e, with a group-level two-tier test (GBER art. 2(18)). `as_of` is a timestamp. |
| Bulk: distress check (FIV) | `POST /api/v1/fiv/bulk` | Up to 50 companies per call, each assessed independently. |

In both distress modules, an empty `root_distressed` means **not determined**,
not healthy — the distinction matters for a compliance decision.

### AML

| Module | Endpoint | Notes |
| --- | --- | --- |
| Check AML / PEP | `POST /api/v1/aml/check` | Screens a **named person** against PEP and sanctions lists (EU, UN, OFAC, UK). Takes a name, optionally narrowed by birth year and category — not an organization number. |
| Start AML report (async) | `POST /api/v1/aml/report` | Starts a full company AML report and returns immediately with `rapport_id` and `status: pending`. |
| Get AML report (poll) | `GET /api/v1/aml/report/{report_id}` | Poll with the **`rapport_id`** from `Start AML report`. Note the naming: the value to poll with is `rapport_id`; this module's own `report_id` output is the identifier of the finished report, not the polling key. |

The AML modules require a signed data-processing agreement and send a purpose
(`kyc_onboarding` / `kyc_review` / `risk_monitoring` / `manual`) plus a
per-call confirmation as headers, for the audit trail. Reports are retained for
60 months under the Norwegian Anti-Money Laundering Act § 30.

### Search

| Module | Endpoint | Notes |
| --- | --- | --- |
| Search companies | `GET /api/v1/companies/search` | By company name prefix or exact nine-digit organization number. The module offers `q`, NACE code, municipality and result limit; `q` may be empty when NACE or municipality is set. Results are cursor-paginated. Use `Get company` when you know the organization number and want its basic record. |
| Search persons | `GET /api/v1/person/search` | Shareholders and role holders by name, with fuzzy matching. Shareholder bundles carry `owner_person_key`; role-person bundles carry `role_person_id`. No pagination — see [Conventions](#conventions). |
| Search announcements 🔒 | `GET /api/v1/announcements/search` | Across all companies, by type, free text and date range. Cursor-paginated. |
| List companies in NACE industry 🔒 | `GET /api/v1/nace/{code}/companies` | By industry code or prefix, optionally filtered by status, municipality and minimum employees. Cursor-paginated. |
| Find related companies 🔒 | `GET /api/v1/company/{orgnr}/related` | Companies linked through shared people, owners or address. |
| Find shared connections 🔒 | `GET /api/v1/find-shared-connections` | People, owners and addresses that two or more companies have in common. |

### Other

| Module | Endpoint | Notes |
| --- | --- | --- |
| Make an API call | `/api/` + the path you supply | Authenticated call to non-DPA endpoints the dedicated modules do not cover. It deliberately rejects the DPA-gated AML paths (`POST /api/v1/aml/check`, `/report` and `/score`): use `Check AML / PEP` or `Start AML report`, which expose the required purpose and per-call confirmation. Enter the path **after** `/api/` — for example `v1/company/923609016` or `regnskap/923609016/historikk`. The `/api/` prefix is part of the module template rather than your value; a fixed module marker makes the server reject any mapped path that normalizes outside `/api/`, and the request cannot be redirected off `firmaradar.no`. Returns status code, response headers and body. |

## Quotas and rate limits

- Each call consumes quota, weighted by cost. Polling an AML report is close to
  free; a full report or an ownership tree including individual owners is heavy.
- In the bulk modules, each organization number counts as one QUOTA unit, but
  the CREDIT cost is weighted per module — measured against the billing weights:
  `check_fiv_bulk` charges **2.5 credits** per organization (5 sync × 0.5 batch
  factor) and `get_risk_score_bulk` charges **0.5** (5 per 10 organizations).
  🪤 Estimating a PAYG bulk run at one credit per organization understates
  `check_fiv_bulk` by a factor of 2.5.
- `Start AML report` is limited by the AML extension manifest to 30 report
  submissions per minute, per company for API-key calls. `Check AML / PEP`
  has a separate limit of 50 calls per 30 minutes per user. Both are also
  subject to the general API quota and their access gates.
- Creating or re-testing a connection performs one lookup and consumes one unit.

---

## Compliance notes

Some capabilities are gated per account. Risk scoring uses `403` for
access/confirmation gates, `404 company_not_found`, `422` for the
organization-form gate, and retryable `503 orgform_unavailable`. These are
typed gate outcomes rather than a successful score.

🪤 A `400` is not a gate. The **single-company** modules validate the
organization number before invoking the gated handler and return
`400 invalid_orgnr` for anything that is not nine digits, so an invalid input
must not be troubleshooted as an account-access problem.

🪤 **The bulk modules surface none of these as an HTTP status.**
`Bulk: distress check (FIV)` and `Bulk: risk score` answer **HTTP 200** even when
entries fail: an invalid number arrives as
`{"orgnr": ..., "error": "invalid_orgnr"}` inside `results[]`, and a closed gate
arrives the same way (`company_not_found`, `enk_not_supported`, `blocked_enk`,
`orgform_unavailable`, `kundebekreftelse_required` —
these exist on **Bulk: risk score** only;
`Bulk: distress check (FIV)` has no gate and fails a row with
`extension_not_active` when the add-on is off). The per-item status feeds the audit log and
`_meta.failed`, not the response code. A scenario that branches on the HTTP
status alone will read a batch of failed rows as fully successful — inspect
`results[].error`. Each failed risk row also exposes `results[].http_status`
(for example 404/422/503), because the outer HTTP 200 cannot carry the
per-company transport outcome.

- **Risk scoring** requires the capability enabled and the pre-screening
  disclaimer confirmed.
- **Person search and the People modules** require full-search access. Minors
  are filtered out and birth year is always masked to a four-digit year.
- **AML modules** require a signed data-processing agreement.
- **Organization form** — `ENK` (sole proprietorship) **and** `NUF`
  (Norwegian-registered foreign enterprise) are both blocked from the
  **risk-scoring** modules by design. The branch is one and the same:
  `enk_not_supported`, HTTP 422, raised in the risk-scoring handler. Despite the
  error code's name this is an organization-form gate, not a sole-proprietorship
  gate — a `NUF` is not a sole proprietorship. In the bulk module it arrives as a
  per-orgnr error.
  🪤 The **distress (FIV) modules do not have that gate.** An `ENK` is assessed;
  it is merely excluded from criterion (b), which measures the loss of company
  capital that a sole proprietorship does not have. Reading the risk-scoring
  block as a general one would wrongly tell a sole proprietor that no distress
  assessment is available.

---

## Full API reference

The complete OpenAPI specification is published at
<https://firmaradar.no/api/openapi.yaml> and the human-readable documentation at
<https://firmaradar.no/dokumentasjon>.

If an automated client receives `403` with Cloudflare error `1010` when
fetching either URL, the request was blocked on its client signature rather
than by us. Clients whose `User-Agent` begins with `Python-urllib` are blocked
by that rule; sending any ordinary user agent returns `200`. The module
reference above is complete on its own, so reviewing this app does not depend
on reaching those URLs.

Support: <https://firmaradar.no/kontakt>
