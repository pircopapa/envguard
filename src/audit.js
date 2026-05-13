/**
 * audit.js — Check for risky or sensitive key patterns in .env files
 */

const SENSITIVE_PATTERNS = [
  { pattern: /secret/i, label: 'secret' },
  { pattern: /password/i, label: 'password' },
  { pattern: /passwd/i, label: 'password' },
  { pattern: /api_key/i, label: 'api key' },
  { pattern: /token/i, label: 'token' },
  { pattern: /private_key/i, label: 'private key' },
  { pattern: /auth/i, label: 'auth credential' },
  { pattern: /credentials/i, label: 'credentials' },
];

const RISKY_VALUE_PATTERNS = [
  { pattern: /^(true|1|yes)$/i, label: 'debug flag enabled', keyPattern: /debug/i },
  { pattern: /^(true|1|yes)$/i, label: 'verbose flag enabled', keyPattern: /verbose/i },
  { pattern: /localhost|127\.0\.0\.1/, label: 'localhost value', keyPattern: null },
];

/** Placeholder values that indicate a key hasn't been properly configured */
const PLACEHOLDER_VALUES = new Set(['', 'changeme', 'todo', 'placeholder', 'fixme', 'replace_me']);

/**
 * @param {string} key
 * @param {string} value
 * @returns {{ key: string, issue: string }[]}
 */
function auditEntry(key, value) {
  const findings = [];

  for (const { pattern, label } of SENSITIVE_PATTERNS) {
    if (pattern.test(key) && PLACEHOLDER_VALUES.has(value.toLowerCase())) {
      findings.push({ key, issue: `Sensitive key (${label}) has placeholder or empty value` });
    }
  }

  for (const { pattern, label, keyPattern } of RISKY_VALUE_PATTERNS) {
    const keyMatches = keyPattern ? keyPattern.test(key) : true;
    if (keyMatches && pattern.test(value)) {
      findings.push({ key, issue: `Risky value detected: ${label}` });
    }
  }

  return findings;
}

/**
 * Audit all entries in a parsed env object.
 * @param {Record<string, string>} envObj
 * @returns {{ key: string, issue: string }[]}
 */
function auditEnv(envObj) {
  const results = [];
  for (const [key, value] of Object.entries(envObj)) {
    results.push(...auditEntry(key, value));
  }
  return results;
}

/**
 * Returns true if no audit issues were found.
 * @param {Record<string, string>} envObj
 * @returns {boolean}
 */
function isCleanAudit(envObj) {
  return auditEnv(envObj).length === 0;
}

/**
 * Returns a summary of audit results grouped by issue type.
 * @param {Record<string, string>} envObj
 * @returns {Record<string, string[]>} Map of issue label to affected keys
 */
function auditSummary(envObj) {
  const findings = auditEnv(envObj);
  const summary = {};
  for (const { key, issue } of findings) {
    if (!summary[issue]) summary[issue] = [];
    summary[issue].push(key);
  }
  return summary;
}

module.exports = { auditEnv, isCleanAudit, auditSummary };
