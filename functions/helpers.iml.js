/**
 * Firmaradar — Make.com Custom App helpers
 *
 * IML-funksjoner som kan brukes i Make.com-moduler via `{{fn.<name>(...)}}`
 * eller i communication-templates der vi trenger litt mer logikk enn
 * Make sin innebygde mapping-syntax støtter.
 *
 * Konvensjoner:
 *   - Hver funksjon eksporteres som `module.exports.<navn>`.
 *   - Ingen avhengigheter — bare ren JS som Make sitt IML-runtime støtter.
 *   - Funksjonene må være rene (ingen side-effekter, ingen nettverkskall).
 */

/**
 * Valider norsk organisasjonsnummer (9 siffer).
 *
 * Returnerer `true` hvis input er en streng med eksakt 9 sifre, ellers `false`.
 * Validerer ikke mod-11-sjekksum — det er server-side ansvar. Make-modulene
 * bruker dette som siste forsvar mot åpenbare skrivefeil før kallet sendes.
 *
 * @param {string} orgnr - Organisasjonsnummer som strenger.
 * @returns {boolean}
 */
module.exports.isValidOrgnr = function isValidOrgnr(orgnr) {
    if (typeof orgnr !== 'string') return false;
    return /^[0-9]{9}$/.test(orgnr.trim());
};

/**
 * Normaliser et orgnr: trim whitespace + fjern mellomrom og bindestreker.
 *
 * "  999 999 999  " → "999999999"
 * "999-999-999"     → "999999999"
 *
 * @param {string} raw
 * @returns {string}
 */
module.exports.normalizeOrgnr = function normalizeOrgnr(raw) {
    if (typeof raw !== 'string') return '';
    return raw.replace(/[\s\-_]+/g, '').trim();
};

/**
 * Hent en lesbar feilmelding ut av en Firmaradar-API-response.
 *
 * Firmaradar bruker strukturerte feil-koder (0.8-foundation), så
 * `response.body.error_code` + `response.body.message` er foretrukket.
 * Faller tilbake til `error`, `detail` eller statustekst hvis ikke
 * tilstede.
 *
 * @param {object} response - Make.com response-objekt med `statusCode` + `body`.
 * @returns {string}
 */
module.exports.extractError = function extractError(response) {
    if (!response || typeof response !== 'object') {
        return 'Unknown error (no response object)';
    }
    const status = response.statusCode || response.status || '?';
    const body = response.body || {};
    const code = body.error_code ? `[${body.error_code}] ` : '';
    const msg = body.message || body.error || body.detail || `HTTP ${status}`;
    return `${code}${msg}`;
};

/**
 * Map en intern Firmaradar-status-streng til en boolsk høy-risiko-indikator.
 *
 * AML/PEP-respons har `status` som kan være "clean", "match", "review" eller
 * "high_risk". Make-scenarier vil ofte ha en router som forgreiner på
 * "alvorlig nok til å varsle" — denne hjelperen samler den logikken.
 *
 * @param {string} status
 * @returns {boolean}
 */
module.exports.isHighRiskStatus = function isHighRiskStatus(status) {
    if (typeof status !== 'string') return false;
    const s = status.toLowerCase().trim();
    return s === 'match' || s === 'high_risk' || s === 'review';
};
