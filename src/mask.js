/**
 * mask.js — Mask env values for safe display (e.g. logs, output)
 * Similar to redact but preserves partial value hints
 */

const SENSITIVE_PATTERNS = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private/i,
  /auth/i,
  /credential/i,
  /cert/i,
  /passphrase/i
];

/**
 * Returns true if the key looks sensitive
 * @param {string} key
 * @returns {boolean}
 */
function isMaskableKey(key) {
  return SENSITIVE_PATTERNS.some(p => p.test(key));
}

/**
 * Masks a value, showing only the first N chars and trailing stars
 * @param {string} value
 * @param {number} [visibleChars=3]
 * @returns {string}
 */
function maskValue(value, visibleChars = 3) {
  if (!value || value.length === 0) return '';
  if (value.length <= visibleChars) return '*'.repeat(value.length);
  const visible = value.slice(0, visibleChars);
  const masked = '*'.repeat(Math.min(value.length - visibleChars, 8));
  return `${visible}${masked}`;
}

/**
 * Returns a new env object with sensitive values masked
 * @param {Record<string, string>} env
 * @param {number} [visibleChars=3]
 * @returns {Record<string, string>}
 */
function maskEnv(env, visibleChars = 3) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = isMaskableKey(key) ? maskValue(value, visibleChars) : value;
  }
  return result;
}

/**
 * Returns list of keys that were masked
 * @param {Record<string, string>} env
 * @returns {string[]}
 */
function listMaskedKeys(env) {
  return Object.keys(env).filter(isMaskableKey);
}

module.exports = { isMaskableKey, maskValue, maskEnv, listMaskedKeys };
