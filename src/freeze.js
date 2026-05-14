/**
 * freeze.js — Detect and enforce immutable (frozen) keys in .env files
 *
 * A "frozen" key is one that should never change across environments or snapshots.
 * Useful for enforcing constants like APP_NAME, API_VERSION, etc.
 */

/**
 * Check if a single key/value pair violates a freeze rule.
 * @param {string} key
 * @param {string} value
 * @param {Object} frozenMap - { KEY: expectedValue }
 * @returns {{ key: string, expected: string, actual: string } | null}
 */
function checkFrozenKey(key, value, frozenMap) {
  if (!(key in frozenMap)) return null;
  const expected = frozenMap[key];
  if (value !== expected) {
    return { key, expected, actual: value };
  }
  return null;
}

/**
 * Validate an entire env object against a frozen keys map.
 * @param {Object} env - parsed env { KEY: value }
 * @param {Object} frozenMap - { KEY: expectedValue }
 * @returns {Array<{ key: string, expected: string, actual: string }>}
 */
function checkFrozen(env, frozenMap) {
  const violations = [];
  for (const [key, value] of Object.entries(env)) {
    const violation = checkFrozenKey(key, value, frozenMap);
    if (violation) violations.push(violation);
  }
  return violations;
}

/**
 * Returns true if no frozen keys are violated.
 * @param {Object} env
 * @param {Object} frozenMap
 * @returns {boolean}
 */
function isCleanFreeze(env, frozenMap) {
  return checkFrozen(env, frozenMap).length === 0;
}

/**
 * Build a frozen map snapshot from the current env (lock current values).
 * Only freezes keys that match the provided list.
 * @param {Object} env
 * @param {string[]} keys
 * @returns {Object}
 */
function buildFreezeMap(env, keys) {
  const map = {};
  for (const key of keys) {
    if (key in env) {
      map[key] = env[key];
    }
  }
  return map;
}

/**
 * Summarize freeze check results.
 * @param {Array} violations
 * @returns {{ total: number, violations: number, clean: boolean }}
 */
function freezeSummary(violations) {
  return {
    total: violations.length,
    violations: violations.length,
    clean: violations.length === 0,
  };
}

module.exports = {
  checkFrozenKey,
  checkFrozen,
  isCleanFreeze,
  buildFreezeMap,
  freezeSummary,
};
