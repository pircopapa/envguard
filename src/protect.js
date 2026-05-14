/**
 * protect.js — Mark keys as protected and detect unauthorized changes
 */

/**
 * Build a protection map from an array of protected key names.
 * @param {string[]} keys
 * @param {Object} env
 * @returns {Object} map of key -> locked value
 */
function buildProtectMap(keys, env) {
  const map = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      map[key] = env[key];
    }
  }
  return map;
}

/**
 * Check a single key against its protected value.
 * @param {string} key
 * @param {string|undefined} currentValue
 * @param {string} lockedValue
 * @returns {{ key: string, status: 'ok'|'modified'|'missing', lockedValue: string, currentValue: string|undefined }}
 */
function checkProtectedKey(key, currentValue, lockedValue) {
  if (currentValue === undefined) {
    return { key, status: 'missing', lockedValue, currentValue: undefined };
  }
  if (currentValue !== lockedValue) {
    return { key, status: 'modified', lockedValue, currentValue };
  }
  return { key, status: 'ok', lockedValue, currentValue };
}

/**
 * Validate all protected keys in the current env against the protect map.
 * @param {Object} env
 * @param {Object} protectMap
 * @returns {Array} array of result objects
 */
function checkProtected(env, protectMap) {
  return Object.entries(protectMap).map(([key, lockedValue]) =>
    checkProtectedKey(key, env[key], lockedValue)
  );
}

/**
 * Returns true if no protected keys have been modified or removed.
 * @param {Array} results
 * @returns {boolean}
 */
function isCleanProtect(results) {
  return results.every((r) => r.status === 'ok');
}

/**
 * Summarize protect check results.
 * @param {Array} results
 * @returns {{ total: number, ok: number, modified: number, missing: number }}
 */
function protectSummary(results) {
  return results.reduce(
    (acc, r) => {
      acc.total++;
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    { total: 0, ok: 0, modified: 0, missing: 0 }
  );
}

module.exports = {
  buildProtectMap,
  checkProtectedKey,
  checkProtected,
  isCleanProtect,
  protectSummary,
};
