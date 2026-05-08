/**
 * rename.js — Rename keys in .env objects with mapping support
 */

/**
 * Rename specific keys in an env object using a map.
 * @param {Record<string, string>} env
 * @param {Record<string, string>} renameMap - { oldKey: newKey }
 * @returns {{ result: Record<string, string>, renamed: Array<{from: string, to: string}>, skipped: string[] }}
 */
function applyRenameMap(env, renameMap) {
  const result = { ...env };
  const renamed = [];
  const skipped = [];

  for (const [from, to] of Object.entries(renameMap)) {
    if (!(from in env)) {
      skipped.push(from);
      continue;
    }
    if (to in result && to !== from) {
      skipped.push(from); // avoid clobbering existing keys
      continue;
    }
    result[to] = result[from];
    if (to !== from) delete result[from];
    renamed.push({ from, to });
  }

  return { result, renamed, skipped };
}

/**
 * Rename keys matching a pattern using a replacer function.
 * @param {Record<string, string>} env
 * @param {RegExp} pattern
 * @param {(key: string) => string} replacer
 * @returns {{ result: Record<string, string>, renamed: Array<{from: string, to: string}> }}
 */
function renameByPattern(env, pattern, replacer) {
  const result = {};
  const renamed = [];

  for (const [key, value] of Object.entries(env)) {
    if (pattern.test(key)) {
      const newKey = replacer(key);
      result[newKey] = value;
      if (newKey !== key) renamed.push({ from: key, to: newKey });
    } else {
      result[key] = value;
    }
  }

  return { result, renamed };
}

/**
 * Check if a rename result has no changes.
 * @param {Array<{from: string, to: string}>} renamed
 * @returns {boolean}
 */
function isCleanRename(renamed) {
  return renamed.length === 0;
}

module.exports = { applyRenameMap, renameByPattern, isCleanRename };
