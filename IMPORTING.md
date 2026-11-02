# Importing this repository as a private Make app

This guide is for developers building their own Make app from the definitions in
this repository, against their own developer account. Pilot users do not need it
— they install the app from the invitation URL in [`README.md`](README.md).

🪤 **What you get is not a copy of the live app.** A complete import is
deliberately wider than the reviewed surface; see *Module status* below before
you assume the two match.

1. Create a developer account at <https://developers.make.com/>.
2. Create a new Custom App via **Make → More → Custom Apps → Create a new app**.
3. Paste the contents of `app.json`, `connections/`, `modules/`, `webhooks/`,
   `functions/` and `groups.json` through the Web Code Editor (jsonc blocks).
   🪤 `webhooks/` is easy to skip and the omission is silent: the two instant
   modules declare `company_changes` and `nace_changes`, so leaving the
   directory out gives you triggers whose webhook definitions do not exist.
4. Test your scenarios against your own Make instance.

Settle these before you paste the files as they are:

🚨 **The groups do not bind to the imported modules without a name conversion.**
`groups.json` refers to the live app's camelCase identifiers (`getCompany`),
while the definitions in `modules/` identify themselves in snake_case
(`get_company`). Map the names before applying the groups, or nothing gets
grouped.

✅ **`groups.json` groups `makeApiCall`, and it now has a file** —
`modules/make_api_call.json`. Earlier revisions of this guide told you to create
that module by hand or drop it from `groups.json`; **do neither.** Following
those instructions today gives you a duplicate module or a missing one.

🪤 **Do not skip `groups.json`.** Without it every module lands in a single
`Other` group — which is precisely what Make asked us to fix.

### Module status

🪤 **The repository ships 30 module definitions; the live app has 26.** Four were
deliberately never pushed, so importing everything gives you actions and triggers
with no live counterpart:

| Definition | Status |
| --- | --- |
| `get_regnskapsrapport.json` | never pushed |
| `get_aml_score.json` | deprecated 2026-07-07 — build on `Start AML report` + `Get AML report` instead |
| `watch_company_changes.json` | instant trigger, never pushed |
| `watch_nace_changes.json` | instant trigger, never pushed |

🚨 The two instant triggers have no registered webhooks on the live app, so
nothing there can attach to them. In your own app they work once you import
`webhooks/`, and they require `firmaovervåkning` on the account.

### Field-level divergence

Finally, note the divergence banner at the top of `readme_sdk.md` — the ⚠️ block
directly under the title: the module definitions in this tree do not yet match
every live contract documented there. 🪤 That banner lives in the published file
deliberately, because it is the only caveat a Make reader ever sees.
