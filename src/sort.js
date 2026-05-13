/**
 * sort.js — utilities for sorting .env key-value pairs
 */

/**
 * Sort env keys alphabetically (case-insensitive)
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function sortAlpha(env) {
  return Object.fromEntries(
    Object.entries(env).sort(([a], [b]) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    )
  );
}

/**
 * Sort env keys by prefix group, then alphabetically within each group
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function sortByPrefix(env) {
  return Object.fromEntries(
    Object.entries(env).sort(([a], [b]) => {
      const prefixA = a.includes('_') ? a.split('_')[0] : '';
      const prefixB = b.includes('_') ? b.split('_')[0] : '';
      if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
      return a.toLowerCase().localeCompare(b.toLowerCase());
    })
  );
}

/**
 * Sort env keys by value length (shortest first)
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function sortByValueLength(env) {
  return Object.fromEntries(
    Object.entries(env).sort(([, a], [, b]) => a.length - b.length)
  );
}

/**
 * Check if an env object is already sorted alphabetically
 * @param {Record<string, string>} env
 * @returns {boolean}
 */
function isSorted(env) {
  const keys = Object.keys(env);
  for (let i = 1; i < keys.length; i++) {
    if (keys[i - 1].toLowerCase().localeCompare(keys[i].toLowerCase()) > 0) {
      return false;
    }
  }
  return true;
}

/**
 * Return list of keys that are out of alphabetical order
 * @param {Record<string, string>} env
 * @returns {string[]}
 */
function unsortedKeys(env) {
  const keys = Object.keys(env);
  const out = [];
  for (let i = 1; i < keys.length; i++) {
    if (keys[i - 1].toLowerCase().localeCompare(keys[i].toLowerCase()) > 0) {
      out.push(keys[i - 1]);
    }
  }
  return out;
}

module.exports = { sortAlpha, sortByPrefix, sortByValueLength, isSorted, unsortedKeys };
