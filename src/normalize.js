/**
 * normalize.js
 * Utilities for normalizing .env values and keys to consistent formats.
 */

/**
 * Normalize a single key: trim whitespace, uppercase, replace spaces/dashes with underscores.
 * @param {string} key
 * @returns {string}
 */
function normalizeKey(key) {
  if (typeof key !== 'string') return key;
  return key.trim().toUpperCase().replace(/[\s\-]+/g, '_');
}

/**
 * Normalize a single value: trim whitespace, collapse internal whitespace.
 * @param {string} value
 * @returns {string}
 */
function normalizeValue(value) {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Normalize all keys in an env object.
 * @param {Record<string, string>} env
 * @returns {{ normalized: Record<string, string>, changes: Array<{from: string, to: string}> }}
 */
function normalizeKeys(env) {
  const normalized = {};
  const changes = [];

  for (const [key, value] of Object.entries(env)) {
    const newKey = normalizeKey(key);
    if (newKey !== key) {
      changes.push({ from: key, to: newKey });
    }
    normalized[newKey] = value;
  }

  return { normalized, changes };
}

/**
 * Normalize all values in an env object.
 * @param {Record<string, string>} env
 * @returns {{ normalized: Record<string, string>, changes: Array<{key: string, from: string, to: string}> }}
 */
function normalizeValues(env) {
  const normalized = {};
  const changes = [];

  for (const [key, value] of Object.entries(env)) {
    const newValue = normalizeValue(value);
    if (newValue !== value) {
      changes.push({ key, from: value, to: newValue });
    }
    normalized[key] = newValue;
  }

  return { normalized, changes };
}

/**
 * Normalize both keys and values.
 * @param {Record<string, string>} env
 * @returns {{ normalized: Record<string, string>, keyChanges: Array, valueChanges: Array }}
 */
function normalizeEnv(env) {
  const { normalized: keysNorm, changes: keyChanges } = normalizeKeys(env);
  const { normalized, changes: valueChanges } = normalizeValues(keysNorm);
  return { normalized, keyChanges, valueChanges };
}

/**
 * Returns true if the env is already fully normalized.
 * @param {Record<string, string>} env
 * @returns {boolean}
 */
function isCleanNormalize(env) {
  const { keyChanges, valueChanges } = normalizeEnv(env);
  return keyChanges.length === 0 && valueChanges.length === 0;
}

module.exports = { normalizeKey, normalizeValue, normalizeKeys, normalizeValues, normalizeEnv, isCleanNormalize };
