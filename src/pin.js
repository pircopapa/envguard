/**
 * pin.js — Pin specific env keys to expected values and detect drift
 */

/**
 * Build a pin map from an array of { key, value } entries or a plain object.
 * @param {Object} pins - { KEY: 'expected_value', ... }
 * @returns {Object}
 */
function buildPinMap(pins) {
  if (!pins || typeof pins !== 'object') return {};
  return { ...pins };
}

/**
 * Check a single key against its pinned value.
 * @param {string} key
 * @param {string|undefined} actual
 * @param {string} expected
 * @returns {{ key, expected, actual, pinned: boolean }}
 */
function checkPinnedKey(key, actual, expected) {
  return {
    key,
    expected,
    actual: actual ?? null,
    pinned: actual === expected,
  };
}

/**
 * Check all pinned keys against an env object.
 * @param {Object} env - parsed env { KEY: value }
 * @param {Object} pins - { KEY: expected_value }
 * @returns {Array<{ key, expected, actual, pinned }>}
 */
function checkPinned(env, pins) {
  const pinMap = buildPinMap(pins);
  return Object.entries(pinMap).map(([key, expected]) =>
    checkPinnedKey(key, env[key], expected)
  );
}

/**
 * Returns true if all pinned keys match their expected values.
 * @param {Object} env
 * @param {Object} pins
 * @returns {boolean}
 */
function isCleanPin(env, pins) {
  return checkPinned(env, pins).every((r) => r.pinned);
}

/**
 * Returns only the entries where the pinned value does not match.
 * @param {Object} env
 * @param {Object} pins
 * @returns {Array}
 */
function driftedKeys(env, pins) {
  return checkPinned(env, pins).filter((r) => !r.pinned);
}

/**
 * Summary object for pin results.
 * @param {Object} env
 * @param {Object} pins
 * @returns {{ total, passed, failed, drifted: Array }}
 */
function pinSummary(env, pins) {
  const results = checkPinned(env, pins);
  const drifted = results.filter((r) => !r.pinned);
  return {
    total: results.length,
    passed: results.length - drifted.length,
    failed: drifted.length,
    drifted,
  };
}

/**
 * Formats drifted pin results into human-readable strings.
 * Useful for logging or CLI output when pin checks fail.
 * @param {Object} env
 * @param {Object} pins
 * @returns {string[]} Array of formatted drift messages
 */
function formatDriftMessages(env, pins) {
  return driftedKeys(env, pins).map(({ key, expected, actual }) => {
    const actualDisplay = actual === null ? '(not set)' : JSON.stringify(actual);
    return `${key}: expected ${JSON.stringify(expected)}, got ${actualDisplay}`;
  });
}

module.exports = {
  buildPinMap,
  checkPinnedKey,
  checkPinned,
  isCleanPin,
  driftedKeys,
  pinSummary,
  formatDriftMessages,
};
