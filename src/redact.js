/**
 * redact.js — Utilities to detect and redact sensitive .env values
 */

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /passphrase/i,
  /access[_-]?key/i,
];

/**
 * Returns true if the key looks sensitive.
 * @param {string} key
 * @returns {boolean}
 */
function isSensitiveKey(key) {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Redacts the value of a sensitive key, replacing it with a masked string.
 * @param {string} value
 * @returns {string}
 */
function redactValue(value) {
  if (!value || value.length === 0) return '';
  if (value.length <= 4) return '****';
  return value.slice(0, 2) + '*'.repeat(Math.min(value.length - 2, 8)) + value.slice(-1);
}

/**
 * Returns a new env object with sensitive values redacted.
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function redactEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = isSensitiveKey(key) ? redactValue(value) : value;
  }
  return result;
}

/**
 * Returns a list of keys that were redacted.
 * @param {Record<string, string>} env
 * @returns {string[]}
 */
function listRedactedKeys(env) {
  return Object.keys(env).filter(isSensitiveKey);
}

module.exports = { isSensitiveKey, redactValue, redactEnv, listRedactedKeys };
