/**
 * Diff two parsed .env objects and report differences.
 */

/**
 * @typedef {Object} DiffResult
 * @property {string[]} missingInB   - Keys present in A but not in B
 * @property {string[]} missingInA   - Keys present in B but not in A
 * @property {Array<{key: string, valueA: string, valueB: string}>} changed - Keys with different values
 */

/**
 * Compare two parsed env maps.
 *
 * @param {Record<string, string>} envA
 * @param {Record<string, string>} envB
 * @returns {DiffResult}
 */
function diffEnvs(envA, envB) {
  const keysA = new Set(Object.keys(envA));
  const keysB = new Set(Object.keys(envB));

  const missingInB = [...keysA].filter((k) => !keysB.has(k));
  const missingInA = [...keysB].filter((k) => !keysA.has(k));

  const changed = [];
  for (const key of keysA) {
    if (keysB.has(key) && envA[key] !== envB[key]) {
      changed.push({ key, valueA: envA[key], valueB: envB[key] });
    }
  }

  return { missingInB, missingInA, changed };
}

/**
 * Returns true if there are no differences.
 *
 * @param {DiffResult} result
 * @returns {boolean}
 */
function isClean(result) {
  return (
    result.missingInA.length === 0 &&
    result.missingInB.length === 0 &&
    result.changed.length === 0
  );
}

module.exports = { diffEnvs, isClean };
