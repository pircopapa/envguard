/**
 * deprecate.js
 * Detect and report deprecated keys in .env files.
 * A key is deprecated if it appears in a provided deprecation map.
 */

/**
 * Check a single key against the deprecation map.
 * @param {string} key
 * @param {Object} deprecationMap - { OLD_KEY: 'NEW_KEY' | null }
 * @returns {{ deprecated: boolean, replacement: string|null }}
 */
function checkDeprecatedKey(key, deprecationMap) {
  if (Object.prototype.hasOwnProperty.call(deprecationMap, key)) {
    return { deprecated: true, replacement: deprecationMap[key] || null };
  }
  return { deprecated: false, replacement: null };
}

/**
 * Scan an env object for deprecated keys.
 * @param {Object} env - parsed env key/value pairs
 * @param {Object} deprecationMap
 * @returns {Array<{ key: string, replacement: string|null }>}
 */
function findDeprecatedKeys(env, deprecationMap) {
  return Object.keys(env)
    .filter(key => Object.prototype.hasOwnProperty.call(deprecationMap, key))
    .map(key => ({ key, replacement: deprecationMap[key] || null }));
}

/**
 * Returns true if no deprecated keys are present.
 * @param {Object} env
 * @param {Object} deprecationMap
 * @returns {boolean}
 */
function isCleanDeprecation(env, deprecationMap) {
  return findDeprecatedKeys(env, deprecationMap).length === 0;
}

/**
 * Summarise deprecation findings.
 * @param {Object} env
 * @param {Object} deprecationMap
 * @returns {{ total: number, deprecated: number, clean: boolean, entries: Array }}
 */
function deprecateSummary(env, deprecationMap) {
  const entries = findDeprecatedKeys(env, deprecationMap);
  return {
    total: Object.keys(env).length,
    deprecated: entries.length,
    clean: entries.length === 0,
    entries
  };
}

module.exports = {
  checkDeprecatedKey,
  findDeprecatedKeys,
  isCleanDeprecation,
  deprecateSummary
};
